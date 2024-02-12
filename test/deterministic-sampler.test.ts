import {
  configureDeterministicSampler,
  DeterministicSampler,
} from '../src/deterministic-sampler';
import { ROOT_CONTEXT, SpanKind, trace, TraceFlags } from '@opentelemetry/api';
import {
  SamplingDecision,
  SamplingResult,
} from '@opentelemetry/sdk-trace-base';

const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
const spanId = '6e0c63257de34c92';
const spanName = 'foobar';

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

it('sampler with rate of undefined configures inner AlwaysOnSampler', () => {
  const sampler = configureDeterministicSampler();
  expect(sampler).toBeInstanceOf(DeterministicSampler);
  expect(sampler.toString()).toBe('DeterministicSampler(AlwaysOnSampler)');

  const result = getSamplingResult(sampler);
  expect(result.decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
  expect(result.attributes).toEqual({ SampleRate: 1 });
});

it('sampler with rate of 1 configures inner AlwaysOnSampler', () => {
  const sampler = configureDeterministicSampler(1);
  expect(sampler).toBeInstanceOf(DeterministicSampler);
  expect(sampler.toString()).toBe('DeterministicSampler(AlwaysOnSampler)');

  const result = getSamplingResult(sampler);
  expect(result.decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
  expect(result.attributes).toEqual({ SampleRate: 1 });
});

it('sampler with rate of 0 configures inner AlwaysOffSampler', () => {
  const sampler = configureDeterministicSampler(0);
  expect(sampler).toBeInstanceOf(DeterministicSampler);
  expect(sampler.toString()).toBe('DeterministicSampler(AlwaysOffSampler)');

  const result = getSamplingResult(sampler);
  expect(result.decision).toBe(SamplingDecision.NOT_RECORD);
  expect(result.attributes).toEqual({ SampleRate: 0 });
});

it('sampler with rate of 10 configures inner TraceIdRatioBased sampler with a ratio of 0.1', () => {
  const sampler = new DeterministicSampler(10);
  expect(sampler).toBeInstanceOf(DeterministicSampler);
  expect(sampler.toString()).toBe(
    'DeterministicSampler(TraceIdRatioBased{0.1})',
  );

  const result = getSamplingResult(sampler);
  expect(result.decision).toBe(SamplingDecision.NOT_RECORD);
  expect(result.attributes).toEqual({ SampleRate: 10 });
});
