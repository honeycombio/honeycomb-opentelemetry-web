import { context, Span, trace } from '@opentelemetry/api';
import {
  InstrumentationBase,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';
import { getElementXPath } from '@opentelemetry/sdk-trace-web';

import { VERSION } from './version';

const INSTRUMENTATION_NAME = '@honeycombio/user-instrumentation';
const SPAN_KEY = '__HNY_SPAN';

const DEFAULT_EVENT_NAMES: EventName[] = ['click'];

type EventName = keyof GlobalEventHandlersEventMap;

type Listener = {
  eventName: EventName;
  handler: (event: Event) => void;
};

interface UserInteractionInstrumentationConfig extends InstrumentationConfig {
  eventNames?: EventName[];
  rootNodeId: string;
}

export class UserInteractionInstrumentation extends InstrumentationBase {
  protected _config: UserInteractionInstrumentationConfig;
  private _is_enabled: boolean;
  private _listeners: Listener[];

  constructor(config: UserInteractionInstrumentationConfig) {
    super(INSTRUMENTATION_NAME, VERSION, config);
    this._config = config;
    this._is_enabled = this._config.enabled ?? false;

    // enable() gets called by our superclass constructor
    // @ts-expect-error this may get set in enable()
    this._listeners = this._listeners ?? [];
  }

  protected init() {}

  public enable() {
    if (this._is_enabled) {
      return;
    }
    const rootNode = document.getElementById(this._config.rootNodeId);
    if (rootNode === null) {
      this._diag.warn(`Root Node id: ${this._config.rootNodeId} not found!`);
      return;
    }

    // enable() gets called by our superclass constructor
    // meaning our private fields aren't initialized yet!!
    this._listeners = [];
    //
    const eventNames = this._config.eventNames ?? DEFAULT_EVENT_NAMES;
    eventNames.forEach((eventName) => {
      // we need a stable reference to this handler so that we can remove it later
      const handler = createGlobalEventListener(
        eventName,
        this._config.rootNodeId,
        () => this._is_enabled,
      );
      this._listeners.push({ eventName, handler });

      // capture phase listener to kick in before any other listeners
      document.addEventListener(eventName, handler, { capture: true });

      // bubble phase listener gets called at the end, if user space doesn't call e.stopPropagation()
      document.addEventListener(eventName, endSpan);
    });

    this._is_enabled = true;
  }

  public disable(): void {
    this._is_enabled = false;
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
  rootNodeId: string,
): element is HTMLElement => {
  // @ts-expect-error we set this field in the handler, if it's already here then we've already seen this event
  if (event[SPAN_KEY]) {
    return false;
  }

  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const handlerName = `on${eventName}` as keyof GlobalEventHandlers;
  if (!elementHasEventHandler(element, handlerName, rootNodeId)) {
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

const elementHasEventHandler = (
  element: HTMLElement | null,
  eventName: keyof GlobalEventHandlers,
  rootNodeId: string,
) => {
  if (!element || element.id === rootNodeId) {
    return false;
  }
  if (element[eventName]) {
    return true;
  }
  return elementHasEventHandler(element.parentElement, eventName, rootNodeId);
};

const createGlobalEventListener =
  (
    eventName: EventName,
    rootNodeId: string,
    isInstrumentationEnabled: () => boolean,
  ) =>
  (event: Event) => {
    const element = event.target;
    if (
      !shouldCreateSpan(event, element, eventName, rootNodeId) ||
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

export const wrapEventPropagationCb = (
  event: Pick<Event, 'stopPropagation' | 'stopImmediatePropagation'>,
  key: 'stopPropagation' | 'stopImmediatePropagation',
  span: Pick<Span, 'end'>,
) => {
  const oldCb = event[key].bind(event);
  event[key] = () => {
    span.end();
    oldCb();
  };
};
