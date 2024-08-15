import {
  UserInteractionInstrumentation,
  UserInteractionInstrumentationConfig,
} from '@opentelemetry/instrumentation-user-interaction';

const DEFAULT_EVENT_NAMES = ['react-click'];

export class ReactUserInteractionInstrumentation extends UserInteractionInstrumentation {
  constructor(
    config: Omit<UserInteractionInstrumentationConfig, 'eventNames'> = {},
  ) {
    super({
      ...config,
      // React sets up its own event system, with its own event names.
      //    We intentionally pass through non-browser events here so we can listen
      //    to the custom events.
      // @ts-expect-error React has its own event names
      eventNames: DEFAULT_EVENT_NAMES,
    });
  }
}
