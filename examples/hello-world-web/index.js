import { WebSDK } from '@honeycombio/opentelemetry-web';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

const main = () => {
  // Set OTel to log in Debug mode
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  // Initialize base OTel WebSDK
  const sdk = new WebSDK({
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
    traceExporter: new ConsoleSpanExporter(), // log spans to the console
  });
  sdk.start();
};

main();
