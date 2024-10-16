import { DiagLogLevel } from '@opentelemetry/api';
import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import {
  IGNORED_DATASET_ERROR,
  MISSING_API_KEY_ERROR,
  MISSING_DATASET_ERROR,
  MISSING_SERVICE_NAME_ERROR,
  NO_EXPORTERS_DISABLED_DEFAULT,
  SAMPLER_OVERRIDE_WARNING,
  SKIPPING_OPTIONS_VALIDATION_MSG,
} from '../src/validate-options';
import {
  AlwaysOnSampler,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
const debugSpy = jest
  .spyOn(console, 'debug')
  .mockImplementation(() => undefined);

const warningSpy = jest
  .spyOn(console, 'warn')
  .mockImplementation(() => undefined);

afterEach(() => {
  debugSpy.mockClear();
  warningSpy.mockClear();
});

afterAll(() => {
  debugSpy.mockRestore();
  warningSpy.mockRestore();
});

// non-ingest classic keys are 32 chars long
const classicApiKey = '12345678901234567890123456789012';
// non-ingest non-classic keys are 22 chars log
const apiKey = 'kgvSpPwegJshQkuowXReLD';

describe('console warnings', () => {
  describe('when skipOptionsValidation is true', () => {
    it('should not show any warnings', () => {
      new HoneycombWebSDK({
        skipOptionsValidation: true,
      });
      expect(debugSpy).toHaveBeenNthCalledWith(
        1,
        SKIPPING_OPTIONS_VALIDATION_MSG,
      );
    });

    it('should not show any warnings or debug logs if log level is lower than DEBUG level', () => {
      new HoneycombWebSDK({
        skipOptionsValidation: true,
        logLevel: DiagLogLevel.INFO,
      });
      expect(debugSpy).not.toHaveBeenCalled();
    });

    it("should show debug logs if log level is 'DEBUG'", () => {
      new HoneycombWebSDK({
        skipOptionsValidation: true,
        logLevel: DiagLogLevel.DEBUG,
      });
      expect(debugSpy).toHaveBeenNthCalledWith(
        1,
        SKIPPING_OPTIONS_VALIDATION_MSG,
      );
    });
  });

  describe('when skipOptionsValidation is false', () => {
    it('should show the API key missing warning', () => {
      new HoneycombWebSDK({
        serviceName: 'test-service',
      });
      expect(warningSpy).toHaveBeenNthCalledWith(1, MISSING_API_KEY_ERROR);
    });

    it('should show the missing service name warning', () => {
      new HoneycombWebSDK({});
      expect(warningSpy).toHaveBeenNthCalledWith(2, MISSING_SERVICE_NAME_ERROR);
    });

    it('should show ignored dataset warning', () => {
      new HoneycombWebSDK({
        apiKey: apiKey,
        dataset: 'test-dataset',
        serviceName: 'test-servicename',
      });
      expect(warningSpy).toHaveBeenLastCalledWith(IGNORED_DATASET_ERROR);
    });

    it('should show dataset missing warning if using a classic key', () => {
      new HoneycombWebSDK({
        apiKey: classicApiKey,
      });

      expect(warningSpy).toHaveBeenLastCalledWith(MISSING_DATASET_ERROR);
    });

    it('should sampler override warning', () => {
      const customSampler = new AlwaysOnSampler();
      new HoneycombWebSDK({
        apiKey: apiKey,
        serviceName: 'test-service',
        sampler: customSampler,
      });

      expect(debugSpy).toHaveBeenLastCalledWith(SAMPLER_OVERRIDE_WARNING);
    });

    it("should not show any warnings if log level is lower than 'WARN'", () => {
      new HoneycombWebSDK({
        logLevel: DiagLogLevel.ERROR,
      });

      expect(warningSpy).not.toHaveBeenCalled();
    });
  });
  describe('when the default trace exporter is disabled', () => {
    describe('and no trace exporters are defined', () => {
      it('should show a no exporters warning', () => {
        new HoneycombWebSDK({
          apiKey,
          serviceName: ' test-service',
          disableDefaultTraceExporter: true,
        });

        expect(warningSpy).toHaveBeenCalledWith(NO_EXPORTERS_DISABLED_DEFAULT);
      });
    });

    describe('and traceExporter is defined', () => {
      it('should not show any warnings', () => {
        const customExporter = new ConsoleSpanExporter();
        new HoneycombWebSDK({
          apiKey,
          serviceName: 'test-service',
          disableDefaultTraceExporter: true,
          traceExporter: customExporter,
        });

        expect(warningSpy).not.toHaveBeenCalled();
      });
    });

    describe('and a traceExporters array is defined', () => {
      it('should not show any warnings', () => {
        const customExporter = new ConsoleSpanExporter();

        new HoneycombWebSDK({
          apiKey,
          serviceName: 'test-service',
          disableDefaultTraceExporter: true,
          traceExporters: [customExporter],
        });

        expect(warningSpy).not.toHaveBeenCalled();
      });
    });
  });
});
