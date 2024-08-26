import { context, Span, trace } from '@opentelemetry/api';
import {
  InstrumentationBase,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';
import { getElementXPath } from '@opentelemetry/sdk-trace-web';

type EventName = keyof HTMLElementEventMap;
interface UserInteractionInstrumentationConfig extends InstrumentationConfig {
  eventNames?: EventName[];
}

const DEFAULT_EVENT_NAMES: EventName[] = ['click'];

const INSTRUMENTATION_NAME = '@honeycombio/user-instrumentation';
const VERSION = '0.0.1';

const SPAN_KEY = '__HNY_SPAN';

type Listener = {
  eventName: EventName;
  handler: (event: Event) => void;
};

export class ReactUserInteractionInstrumentation extends InstrumentationBase {
  protected _config: UserInteractionInstrumentationConfig;
  private _isenabled: boolean;
  private _listeners: Listener[];

  constructor(config: UserInteractionInstrumentationConfig = {}) {
    super(INSTRUMENTATION_NAME, VERSION, config);
    this._config = config;
    this._isenabled = true;
    this._listeners = [];
  }

  protected init() {}

  public enable() {
    if (this._isenabled) {
      return;
    }
    const eventNames = this._config.eventNames ?? DEFAULT_EVENT_NAMES;
    eventNames.forEach((eventName) => {
      // we need a stable reference to this handler so that we can remove it later
      const handler = createGlobalEventListener(
        eventName,
        () => this._isenabled,
      );
      this._listeners.push({ eventName, handler });

      // capture phase listener to kick in before any other listeners
      document.addEventListener(eventName, handler, { capture: true });

      // bubble phase listener gets called at the end, if user space doesn't call e.stopPropagation()
      document.addEventListener(eventName, endSpan);
    });

    this._isenabled = true;
  }

  public disable(): void {
    this._isenabled = false;
    this._listeners.forEach(({ eventName, handler }) => {
      document.removeEventListener(eventName, handler, { capture: true });
      document.removeEventListener(eventName, endSpan);
    });
    this._listeners = [];
  }
}

const shouldCreateSpan = (
  event: Event,
  element: EventTarget | null,
  eventName: EventName,
): element is HTMLElement => {
  // @ts-expect-error we set this field in the handler, if it's already here then we've already seen this event
  if (event[SPAN_KEY]) {
    return false;
  }

  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const handlerName = `on${eventName}`;
  // @ts-expect-error this element might not have a handler for this event
  if (!element[handlerName]) {
    return false;
  }

  if (!element.getAttribute) {
    return false;
  }

  if (element.hasAttribute('disabled')) {
    return false;
  }

  return true;
};

const createGlobalEventListener =
  (eventName: EventName, isInstrumentationEnabled: () => boolean) =>
  (event: Event) => {
    const element = event.target;
    if (
      !shouldCreateSpan(event, element, eventName) ||
      !isInstrumentationEnabled()
    ) {
      return;
    }

    const xpath = getElementXPath(element);

    const tracer = trace.getTracer(INSTRUMENTATION_NAME);
    context.with(context.active(), () => {
      tracer.startActiveSpan(
        eventName,
        {
          attributes: {
            event_type: eventName,
            target_element: element.tagName,
            target_xpath: xpath,
            'http.url': window.location.href,
          },
        },
        (span) => {
          // if user space code calls stopPropagation, we'll never see it again
          // so let's monkey patch those funcs to end the span if they do kill it
          wrapEventPropagationCb(event, 'stopPropagation', span);
          wrapEventPropagationCb(event, 'stopImmediatePropagation', span);

          // @ts-expect-error store the span on the event so we can get it later
          event[SPAN_KEY] = span;
        },
      );
    });
  };

const endSpan = (ev: Event) => {
  // @ts-expect-error we stored the span on the event earlier
  (ev[SPAN_KEY] as Span)?.end();
};

const wrapEventPropagationCb = (
  event: Event,
  key: 'stopPropagation' | 'stopImmediatePropagation',
  span: Span,
) => {
  const oldCb = event[key].bind(event);
  event[key] = () => {
    span.end();
    oldCb();
  };
};
