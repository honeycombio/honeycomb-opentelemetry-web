import {
  configureSampler,
  DeterministicSampler,
} from '../src/deterministic-sampler';
import { ROOT_CONTEXT, SpanKind, trace, TraceFlags } from '@opentelemetry/api';
import {
  AlwaysOnSampler,
  SamplingDecision,
  SamplingResult,
} from '@opentelemetry/sdk-trace-base';

const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
const spanId = '6e0c63257de34c92';
const spanName = 'doStuff';

const getSamplingResult = (sampler: DeterministicSampler): SamplingResult => {
  return sampler.shouldSample(
    trace.setSpanContext(ROOT_CONTEXT, {
      traceId,
      spanId,
      traceFlags: TraceFlags.NONE,
    }),
    traceId,
    spanName,
    SpanKind.CLIENT,
    {},
    [],
  );
};

describe('deterministic sampler', () => {
  test('sampler with rate of 1 configures inner AlwaysOnSampler', () => {
    const sampler = new DeterministicSampler(1);
    expect(sampler).toBeInstanceOf(DeterministicSampler);
    expect(sampler.toString()).toBe('DeterministicSampler(AlwaysOnSampler)');

    const result = getSamplingResult(sampler);
    expect(result.decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
    expect(result.attributes).toEqual({ SampleRate: 1 });
  });

  test('sampler with rate of 10 configures inner TraceIdRatioBased sampler with a ratio of 0.1', () => {
    const sampler = new DeterministicSampler(10);
    expect(sampler).toBeInstanceOf(DeterministicSampler);
    expect(sampler.toString()).toBe(
      'DeterministicSampler(TraceIdRatioBased{0.1})',
    );

    const result = getSamplingResult(sampler);
    expect(result.decision).toBe(SamplingDecision.NOT_RECORD);
    expect(result.attributes).toEqual({ SampleRate: 10 });
  });
});

describe('configureSampler', () => {
  test('when a sampler is provided, it is returned', () => {
    const options = {
      sampler: new AlwaysOnSampler(),
    };
    const sampler = configureSampler(options);
    expect(sampler).toBeInstanceOf(AlwaysOnSampler);
  });

  test('sample rate of 1 configures inner AlwaysOnSampler', () => {
    const options = {
      sampleRate: 1,
    };
    const sampler = configureSampler(options);
    expect(sampler).toBeInstanceOf(DeterministicSampler);
    expect(sampler.toString()).toBe('DeterministicSampler(AlwaysOnSampler)');

    const result = getSamplingResult(sampler);
    expect(result.decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
    expect(result.attributes).toEqual({ SampleRate: 1 });
  });

  test('sample rate of 0 configures inner AlwaysOffSampler', () => {
    const options = {
      sampleRate: 0,
    };
    const sampler = configureSampler(options);
    expect(sampler).toBeInstanceOf(DeterministicSampler);
    expect(sampler.toString()).toBe('DeterministicSampler(AlwaysOffSampler)');

    const result = getSamplingResult(sampler);
    expect(result.decision).toBe(SamplingDecision.NOT_RECORD);
    expect(result.attributes).toEqual({ SampleRate: 0 });
  });

  test('sample rate of -42 configures inner AlwaysOn Sampler', () => {
    const options = {
      sampleRate: -42,
    };
    const sampler = configureSampler(options);
    expect(sampler).toBeInstanceOf(DeterministicSampler);
    expect(sampler.toString()).toBe('DeterministicSampler(AlwaysOnSampler)');

    const result = getSamplingResult(sampler);
    expect(result.decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
    expect(result.attributes).toEqual({ SampleRate: 1 });
  });

  test('sample rate of 10 configures inner TraceIdRatioBased sampler with a ratio of 0.1', () => {
    const options = {
      sampleRate: 10,
    };
    const sampler = configureSampler(options);
    expect(sampler).toBeInstanceOf(DeterministicSampler);
    expect(sampler.toString()).toBe(
      'DeterministicSampler(TraceIdRatioBased{0.1})',
    );

    const result = getSamplingResult(sampler);
    expect(result.decision).toBe(SamplingDecision.NOT_RECORD);
    expect(result.attributes).toEqual({ SampleRate: 10 });
  });
});
