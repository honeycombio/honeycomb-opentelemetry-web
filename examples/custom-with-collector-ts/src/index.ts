import { context, propagation, trace } from '@opentelemetry/api';
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const tracing = () => {
  const sdk = new HoneycombWebSDK({
    // To send direct to Honeycomb, set API Key and comment out endpoint
    // apiKey: 'api-key',
    endpoint: 'http://localhost:4318', // send to local collector
    serviceName: 'web-distro',
    debug: true,
    skipOptionsValidation: true,
    resourceAttributes: { 'app.environment': 'development' },
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
  });
  sdk.start();
};

const createButton = (text: string, onClick: { (): void; (): void }) => {
  const button = document.createElement('button');
  const tracer = trace.getTracer('click-tracer');
  button.textContent = text;
  button.setAttribute('data-cy', 'button'); // attribute for testing
  button.addEventListener('click', () => {
    console.log(
      'click event is automatically captured by the auto-instrumentation',
    );
  });

  button.onclick = () =>
    tracer.startActiveSpan(`clicked the button`, (span) => {
      onClick();
      span.end();
    });
  document.body.appendChild(button);
};

const onClick = () => {
  console.debug('button clicked');
  const ctx = propagation.setBaggage(
    context.active(),
    propagation.createBaggage({
      username: { value: 'alice' },
    }),
  );
  context.with(ctx, () => {
    const tracer = trace.getTracer('click-tracer');
    tracer.startActiveSpan('did a thing', (span) => {
      span.setAttribute('message', 'important message');
      tracer.startActiveSpan('calculating stuff', (childspan) => {
        console.log('important things are happening');
        childspan.end();
      });
      span.end();
    });
  });
};

const main = () => {
  tracing();
  createButton('click me!', onClick);
};
main();
