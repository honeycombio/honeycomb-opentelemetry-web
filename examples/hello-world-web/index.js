import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

const main = () => {
  // Set OTel to log in Debug mode
  // TODO: this doesn't seem to work with bundling?
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  // Initialize base OTel WebSDK
  const sdk = new HoneycombWebSDK({
    apiKey: 'api-key-goes-here',
    serviceName: 'web-distro',
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
    // traceExporter: new ConsoleSpanExporter() // for local and smoke testing
  });
  sdk.start();
};

main();
