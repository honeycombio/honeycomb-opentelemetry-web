import { Attributes, Context, Link, SpanKind } from '@opentelemetry/api';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  Sampler,
  SamplingResult,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { getSampleRate } from './util';
import { HoneycombOptions } from './types';

/**
 * Builds and returns a Deterministic Sampler that uses the provided sample rate to
 * configure the inner sampler, if custom sampler has not provided.
 * @param options The {@link HoneycombOptions}
 * @returns a {@link DeterministicSampler}
 */
export const configureDeterministicSampler = (options?: HoneycombOptions) => {
  if(options.sampler) {
    return options.sampler;
  }
  const sampleRate = getSampleRate(options);
  return new DeterministicSampler(sampleRate);
};

/**
 * A {@link Sampler} that uses a deterministic sample rate to configure the sampler.
 */
export class DeterministicSampler implements Sampler {
  private _sampleRate: number;
  private _sampler: Sampler;

  constructor(sampleRate: number) {
    this._sampleRate = sampleRate;
    switch (sampleRate) {
      // sample rate of 0 means send nothing
      case 0:
        this._sampler = new AlwaysOffSampler();
        break;
      // sample rate of 1 is default, send everything
      case 1:
        this._sampler = new AlwaysOnSampler();
        break;
      default: {
        const ratio = 1.0 / sampleRate;
        this._sampler = new TraceIdRatioBasedSampler(ratio);
        break;
      }
    }
  }

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[],
  ): SamplingResult {
    const result = this._sampler.shouldSample(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links,
    );
    return {
      ...result,
      attributes: {
        ...result.attributes,
        SampleRate: this._sampleRate,
      },
    };
  }

  toString(): string {
    return `DeterministicSampler(${this._sampler.toString()})`;
  }
}
