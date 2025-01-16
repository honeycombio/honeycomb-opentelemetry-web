import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  getStructuredStackTrace,
  GlobalErrorsInstrumentation,
} from '../src/global-errors-autoinstrumentation';
import timers from 'node:timers/promises';
import * as tracekit from 'tracekit';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('tracekit', () => ({
  __esModule: true,
  ...jest.requireActual('tracekit'),
}));

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
      const err = new Error('Something happened');
      err.stack =
        '' +
        '  Error: Something happened\n' +
        '    at baz (filename.js:10:15)\n' +
        '    at bar (filename.js:6:3)\n' +
        '    at foo (filename.js:2:3)\n' +
        '    at (filename.js:13:1)';
      setTimeout(() => {
        throw err;
      });
      await timers.setTimeout();

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('exception');
      // TODO: Mock a stack trace and test that it returns the correct keys and values
      expect(span.attributes).toEqual({
        'exception.type': 'Error',
        'exception.message': 'Something happened',
        'exception.stacktrace': err.stack,
        'exception.structured_stacktrace.columns': [15, 3, 3, 1],
        'exception.structured_stacktrace.lines': [10, 6, 2, 13],
        'exception.structured_stacktrace.functions': ['baz', 'bar', 'foo', '?'],
        'exception.structured_stacktrace.urls': [
          'filename.js',
          'filename.js',
          'filename.js',
          'filename.js',
        ],
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

  describe('_computeStackTrace', () => {
    it('should return an empty object if error is undefined', () => {
      expect(getStructuredStackTrace(undefined)).toEqual({});
    });

    it('should return an empty object if StackTrace.stack is null', () => {
      const spy = jest.spyOn(tracekit, 'computeStackTrace');
      // @ts-expect-error bad data from 3rd part lib
      spy.mockReturnValueOnce({ stack: null });

      const err = new Error('This is an error');
      err.stack = 'garbo';
      expect(getStructuredStackTrace(err)).toEqual({});
      spy.mockRestore();
    });

    it('should return an object with structured stack trace information', () => {
      const err = new Error('This is an error');
      err.stack =
        '' +
        '  Error: This is an error\n' +
        '    at new <anonymous> (http://example.com/js/test.js:63:1)\n' + // stack frame 0
        '    at namedFunc0 (http://example.com/js/script.js:10:2)\n' + // stack frame 1
        '    at http://example.com/js/test.js:65:10\n' + // stack frame 2
        '    at new Promise (<anonymous>)\n' + // stack frame 3
        '    at namedFunc2 (http://example.com/js/script.js:20:5)\n' + // stack frame 4
        '    at http://example.com/js/test.js:67:5\n' + // stack frame 5
        '    at namedFunc4 (http://example.com/js/script.js:100001:10002)'; // stack frame 6

      const structuredStack = getStructuredStackTrace(err);

      expect(structuredStack).toEqual({
        'exception.structured_stacktrace.columns': [
          1,
          2,
          10,
          null,
          5,
          5,
          10002,
        ],
        'exception.structured_stacktrace.lines': [
          63,
          10,
          65,
          null,
          20,
          67,
          100001,
        ],
        'exception.structured_stacktrace.functions': [
          'new <anonymous>',
          'namedFunc0',
          '?',
          'new Promise',
          'namedFunc2',
          '?',
          'namedFunc4',
        ],
        'exception.structured_stacktrace.urls': [
          'http://example.com/js/test.js',
          'http://example.com/js/script.js',
          'http://example.com/js/test.js',
          '<anonymous>',
          'http://example.com/js/script.js',
          'http://example.com/js/test.js',
          'http://example.com/js/script.js',
        ],
      });

      expect(
        structuredStack['exception.structured_stacktrace.columns']?.length,
      ).toEqual(
        structuredStack['exception.structured_stacktrace.lines']?.length,
      );
    });
  });
});
