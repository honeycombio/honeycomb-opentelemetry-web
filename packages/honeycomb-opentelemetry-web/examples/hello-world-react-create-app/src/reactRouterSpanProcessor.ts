import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Span } from '@opentelemetry/api';

function createRouteGetter(router: any) {
  let route = router.state.matches[router.state.matches.length - 1]?.route.path;
  router.subscribe((state: any) => {
    route = state.matches[state.matches.length - 1]?.route.path;
  });
  return () => route;
}

/**
 * SpanProcessor that adds attributes to spans based on the state of the React Router
 * Sets the page.route attribute to the generic dynamic route
 * Records the span as an error if there are errors in the router state (e.g. 404)
 */
export class ReactRouterSpanProcessor implements SpanProcessor {
  router;
  constructor({ router }: { router: any }) {
    this.router = router;
  }

  onStart(span: Span) {
    const { errors } = this.router.state;

    // If there are errors, set the span status to error and record the error message
    if (errors !== null) {
      span.setStatus({
        code: 2,
        message: errors[0].data,
      });
    }

    // Set the page.route as the generic dynamic route, making things easier to query
    // e.g. /name/:name/pet/:pet instead of name/123/pet/456
    // url.path attribute will have the more specific computed route
    const pageRoute = createRouteGetter(this.router)();
    span.setAttributes({ 'page.route': pageRoute });
  }

  onEnd() {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}
