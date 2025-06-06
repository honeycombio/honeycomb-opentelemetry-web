import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { trace } from '@opentelemetry/api';
import { waitForNetworkIdle } from './networkActivityTracker';

import { createContext, useContext } from 'react';
import type { Span } from '@opentelemetry/api';

export const PageViewSpanContext = createContext<Span | undefined>(undefined);

export function usePageViewSpan(): Span | undefined {
  return useContext(PageViewSpanContext);
}

export function PageViewSpanProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const [pageViewSpan, setPageViewSpan] = useState<Span | undefined>(undefined);
  const currentSpanRef = useRef<Span | undefined>(undefined);

  useEffect(() => {
    console.log(location.pathname);
    const tracer = trace.getTracer('react-app');

    const now = performance.now();
    const span = tracer.startSpan('page_view', {
      startTime: now,
      attributes: {
        'route.path': location.pathname,
      },
    });
    span.addEvent('navigation_start', now);
    setPageViewSpan(span);
    currentSpanRef.current = span;

    // Optionally end span after network_idle
    waitForNetworkIdle().then(({ idleAt, lastResponseAt }) => {
      span.addEvent('last_response_complete', lastResponseAt);
      span.addEvent('network_idle', idleAt);
      span.end(lastResponseAt);
      console.log('[Perf] Root span ended at network_idle', idleAt);
    });
  }, [location.pathname]);

  return (
    <PageViewSpanContext.Provider value={pageViewSpan}>
      {children}
    </PageViewSpanContext.Provider>
  );
}
