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

export class ReactUserInteractionInstrumentation extends InstrumentationBase {
  protected _config: UserInteractionInstrumentationConfig;
  private _isenabled: boolean;

  constructor(config: UserInteractionInstrumentationConfig = {}) {
    super(INSTRUMENTATION_NAME, VERSION, config);
    this._config = config;
    this._isenabled = true;
  }

  protected init() {}

  public enable() {
    if (this._isenabled) {
      return;
    }
    const eventNames = this._config.eventNames ?? DEFAULT_EVENT_NAMES;
    eventNames.forEach((eventName) => {
      console.log(`adding event listener for ${eventName}`);
      // capture phase listener to kick in before any other listeners
      document.addEventListener(
        eventName,
        (event: Event) => {
          const element = event.target;
          if (!this.shouldCreateSpan(event, element, eventName)) {
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
        },
        true,
      );

      // bubble phase listener gets called at the end, if user space doesn't call e.stopPropagation()
      document.addEventListener(eventName, (ev: Event) => {
        // @ts-expect-error we stored the span on the event earlier
        (ev[SPAN_KEY] as Span)?.end();
      });
    });

    this._isenabled = true;
  }

  private shouldCreateSpan(
    event: Event,
    element: EventTarget | null,
    eventName: EventName,
  ): element is HTMLElement {
    if (!this._isenabled) {
      return false;
    }

    // @ts-expect-error we might check it twice?
    if (event[SPAN_KEY]) {
      return false;
    }

    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const handlerName = `on${eventName}`;
    // @ts-expect-error might not exist
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
  }

  // TODO: disable doesn't remove event listeners
  // so enable() -> disable() -> enable() will create duplicate listeners
  public disable(): void {
    this._isenabled = false;
  }
}

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
