import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { GlobalErrorsInstrumentation } from '../src/global-errors-autoinstrumentation';
import timers from 'node:timers/promises';

describe('Global Errors Instrumentation Tests', () => {
  const exporter = new InMemorySpanExporter();
  const provider = new BasicTracerProvider();
  const spanProcessor = new SimpleSpanProcessor(exporter);
  provider.addSpanProcessor(spanProcessor);
  provider.register();
  let instr: GlobalErrorsInstrumentation;

  beforeEach(() => {
    instr = new GlobalErrorsInstrumentation();
    instr.enable();
  });

  afterEach(() => {
    instr.disable();
    exporter.reset();
  });

  describe('when enabled', () => {
    it('should create a span when an error escapes', async () => {
      setTimeout(() => {
        throw new Error('Something happened');
      });
      await timers.setTimeout();

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('exception');
      expect(span.attributes).toMatchObject({
        'exception.type': 'Error',
        'exception.message': 'Something happened',
        'exception.stacktrace': expect.any(String),
      });
    });

    // would love for this to work, but unfortunately jests underlying dom
    // implementation doesn't control the promise implementation so
    // `unhandledrejection` is not dispatched in response to unhandled
    // rejections.
    it.skip('should create a span when a promise rejection is unhandled', async () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      timers
        .setTimeout()
        .then(() => Promise.reject(new Error('Something happened')));
      await timers.setTimeout();

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('exception');
      expect(span.attributes).toMatchObject({
        'exception.type': 'Error',
        'exception.message': 'Something happened',
        'exception.stacktrace': expect.any(String),
      });
    });
  });
});
