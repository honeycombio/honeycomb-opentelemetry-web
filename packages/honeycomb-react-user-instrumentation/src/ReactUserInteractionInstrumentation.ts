import {
  EventName,
  UserInteractionInstrumentation,
  UserInteractionInstrumentationConfig,
} from '@opentelemetry/instrumentation-user-interaction';

const DEFAULT_EVENT_NAMES = ['click'];

type ReactPrefix<K> = K extends string ? `react-${K}` : K;
type ReactEventName = ReactPrefix<EventName>;

const buildEventNames = (events: EventName[]): ReactEventName[] => {
  return events.map((ev) => `react-${ev}` as ReactEventName);
};

export class ReactUserInteractionInstrumentation extends UserInteractionInstrumentation {
  constructor(config: UserInteractionInstrumentationConfig = {}) {
    super({
      ...config,
      // React sets up its own event system, with its own event names.
      //    We intentionally pass through non-browser events here so we can listen
      //    to the custom events.
      // @ts-expect-error React has its own event names
      eventNames: buildEventNames(config.eventNames ?? DEFAULT_EVENT_NAMES),
    });
  }
}
