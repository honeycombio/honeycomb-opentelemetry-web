import { context, Span, trace } from '@opentelemetry/api';
import {
  InstrumentationBase,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';
import { getElementXPath } from '@opentelemetry/sdk-trace-web';

import { VERSION } from '../../version';

const INSTRUMENTATION_NAME = '@honeycombio/user-instrumentation';

const DEFAULT_EVENT_NAMES: EventName[] = ['click'];

type EventName = keyof GlobalEventHandlersEventMap;

type Listener = {
  eventName: EventName;
  handler: (event: Event) => void;
};

interface UserInteractionInstrumentationConfig extends InstrumentationConfig {
  eventNames?: EventName[];
  rootNodeId?: string;
}

export class UserInteractionInstrumentation extends InstrumentationBase {
  protected _config: UserInteractionInstrumentationConfig;
  private _isEnabled: boolean;
  private _listeners: Listener[];
  private static _eventMap: WeakMap<Event, Span> = new WeakMap();

  constructor(config: UserInteractionInstrumentationConfig = {}) {
    super(INSTRUMENTATION_NAME, VERSION, config);
    this._config = config;
    this._isEnabled = this._config.enabled ?? false;

    // enable() gets called by our superclass constructor
    // @ts-expect-error this may get set in enable()
    this._listeners = this._listeners ?? [];
  }

  protected init() {}

  private static handleEndSpan(this: void, ev: Event): void {
    UserInteractionInstrumentation._eventMap.get(ev)?.end();
  }

  private static createGlobalEventListener(
    this: void,
    eventName: EventName,
    rootNodeId: string | undefined,
    isInstrumentationEnabled: () => boolean,
  ) {
    return (event: Event) => {
      const element = event.target;
      if (isInstrumentationEnabled() === false) return;
      if (UserInteractionInstrumentation._eventMap.has(event)) return;
      if (!shouldCreateSpan(event, element, eventName, rootNodeId)) return;

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
            UserInteractionInstrumentation._eventMap.set(event, span);
          },
        );
      });
    };
  }
  public enable() {
    if (this._isEnabled) {
      return;
    }
    const rootNode = this.getRootNode();

    // enable() gets called by our superclass constructor
    // meaning our private fields aren't initialized yet!!
    this._listeners = [];
    //
    const eventNames = this._config.eventNames ?? DEFAULT_EVENT_NAMES;
    eventNames.forEach((eventName) => {
      // we need a stable reference to this handler so that we can remove it later
      const handler = UserInteractionInstrumentation.createGlobalEventListener(
        eventName,
        this._config.rootNodeId,
        () => this._isEnabled,
      );
      this._listeners.push({ eventName, handler });

      // capture phase listener to kick in before any other listeners
      rootNode.addEventListener(eventName, handler, { capture: true });

      // bubble phase listener gets called at the end, if user space doesn't call e.stopPropagation()
      rootNode.addEventListener(
        eventName,
        UserInteractionInstrumentation.handleEndSpan,
      );
    });

    this._isEnabled = true;
  }

  private getRootNode() {
    if (this._config.rootNodeId) {
      const rootNode = document.getElementById(this._config.rootNodeId);
      if (rootNode === null) {
        this._diag.warn(`Root Node id: ${this._config.rootNodeId} not found!`);
        return document;
      }
      return rootNode;
    }
    return document;
  }

  public disable(): void {
    this._isEnabled = false;
    this._listeners.forEach(({ eventName, handler }) => {
      document.removeEventListener(eventName, handler, { capture: true });
      document.removeEventListener(
        eventName,
        UserInteractionInstrumentation.handleEndSpan,
      );
    });
    this._listeners = [];
  }
}

const shouldCreateSpan = (
  event: Event,
  element: EventTarget | null,
  eventName: EventName,
  rootNodeId: string | undefined,
): element is HTMLElement => {
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

/**
 * Detects if this event on this element is useful
 *    by checking if this element or any of its parents have handlers
 *    for this event.
 *
 * Accounts for the fact that frameworks like React will put dummy/noop
 *    handlers at their root, and ignores those.
 */
const elementHasEventHandler = (
  element: HTMLElement | null,
  eventName: keyof GlobalEventHandlers,
  rootNodeId: string | undefined,
) => {
  if (!element || (!!rootNodeId && element.id === rootNodeId)) {
    return false;
  }
  if (element[eventName]) {
    return true;
  }
  return elementHasEventHandler(element.parentElement, eventName, rootNodeId);
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
