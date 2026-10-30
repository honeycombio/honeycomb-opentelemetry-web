import { ROOT_CONTEXT, SpanKind } from '@opentelemetry/api';
import {
  AlwaysOffSampler,
  BasicTracerProvider,
  InMemorySpanExporter,
  RandomIdGenerator,
  SamplingDecision,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { DeterministicSampler } from '../src/deterministic-sampler';
import { configureSampling } from '../src/passthrough/sample-rate';

const ids = new RandomIdGenerator();
const traceIds = Array.from({ length: 4000 }, () => ids.generateTraceId());

const exportedSpans = (options: Parameters<typeof configureSampling>[0]) => {
  const { sampler, processors } = configureSampling(options);
  const exporter = new InMemorySpanExporter();
  const provider = new BasicTracerProvider({
    sampler,
    idGenerator: {
      generateTraceId: () => traceIds[i++],
      generateSpanId: () => ids.generateSpanId(),
    },
    spanProcessors: [...processors, new SimpleSpanProcessor(exporter)],
  });
  let i = 0;
  const tracer = provider.getTracer('t');
  traceIds.forEach(() => tracer.startSpan('s').end());
  return exporter.getFinishedSpans();
};

describe('configureSampling: upstream sampler plus a SampleRate processor', () => {
  test.each([2, 7, 100])(
    'sampleRate %i keeps exactly the traces DeterministicSampler keeps',
    (sampleRate) => {
      const legacy = new DeterministicSampler(sampleRate);
      const expected = traceIds.filter(
        (id) =>
          legacy.shouldSample(ROOT_CONTEXT, id, 's', SpanKind.INTERNAL, {}, [])
            .decision === SamplingDecision.RECORD_AND_SAMPLED,
      );

      const spans = exportedSpans({ sampleRate });

      expect(spans.map((s) => s.spanContext().traceId)).toEqual(expected);
      expect(expected.length).toBeGreaterThan(0);
      expect(expected.length).toBeLessThan(traceIds.length);
      expect(new Set(spans.map((s) => s.attributes.SampleRate))).toEqual(
        new Set([sampleRate]),
      );
    },
  );

  test('the default exports every span and says so', () => {
    const spans = exportedSpans({});

    expect(spans).toHaveLength(traceIds.length);
    expect(spans[0].attributes.SampleRate).toBe(1);
  });

  test('sampleRate 0 exports nothing', () => {
    expect(exportedSpans({ sampleRate: 0 })).toHaveLength(0);
  });

  test('a caller-supplied sampler is used as is, with no SampleRate guess', () => {
    const { sampler, processors } = configureSampling({
      sampler: new AlwaysOffSampler(),
    });

    expect(sampler).toBeInstanceOf(AlwaysOffSampler);
    expect(processors).toEqual([]);
  });
});
