import { Span } from '@opentelemetry/api';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  Sampler,
  SpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { HoneycombOptions } from '../types';
import { getSampleRate } from '../util';

/** Honeycomb reads this field to weight counts by how many spans each one stands for. */
const ATTR_SAMPLE_RATE = 'SampleRate';

/** Adds the `SampleRate` field to every recorded span. */
export class SampleRateSpanProcessor implements SpanProcessor {
  constructor(private readonly _sampleRate: number) {}

  onStart(span: Span) {
    span.setAttribute(ATTR_SAMPLE_RATE, this._sampleRate);
  }

  onEnd() {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}

/**
 * Picks an upstream sampler from `sampleRate` and the processor that stamps
 * `SampleRate`. A sampler the caller supplies is used as is: it owns its own
 * rate, so Honeycomb cannot know what to write.
 */
export function configureSampling(options?: HoneycombOptions): {
  sampler: Sampler;
  processors: SpanProcessor[];
} {
  if (options?.sampler) {
    return { sampler: options.sampler, processors: [] };
  }
  const rate = getSampleRate(options);
  return {
    sampler:
      rate === 0
        ? new AlwaysOffSampler()
        : rate === 1
          ? new AlwaysOnSampler()
          : new TraceIdRatioBasedSampler(1 / rate),
    processors: [new SampleRateSpanProcessor(rate)],
  };
}
