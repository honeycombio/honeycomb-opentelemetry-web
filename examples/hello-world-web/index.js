import { WebSDK, ReportingSpanExporter } from '@honeycombio/opentelemetry-web';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

const main = () => {
  console.log('hey pk!');
  // Set OTel to log in Debug mode
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  // Initialize base OTel WebSDK
  const sdk = new WebSDK({
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
    spanProcessor: new SimpleSpanProcessor(
      new ReportingSpanExporter({
        sendSpansHere: (reportedSpan) => {
          const spanList = document.getElementById('spans-go-here');
          const newSpan = document.createElement('li');
          newSpan.innerHTML = reportedSpan.name;
          spanList.appendChild(newSpan);
        },
      }),
    ),
  });
  sdk.start();
};

main();
