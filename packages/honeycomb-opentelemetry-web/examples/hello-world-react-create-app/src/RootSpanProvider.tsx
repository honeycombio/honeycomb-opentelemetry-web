import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { trace } from '@opentelemetry/api';
import { waitForNetworkIdle } from './networkActivityTracker';

import { createContext, useContext } from 'react';
import type { Span } from '@opentelemetry/api';

export const RootSpanContext = createContext<Span | undefined>(undefined);

export function useRootSpan(): Span | undefined {
  return useContext(RootSpanContext);
}

export function RootSpanProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [rootSpan, setRootSpan] = useState<Span | undefined>(undefined);
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
    setRootSpan(span);
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
    <RootSpanContext.Provider value={rootSpan}>
      {children}
    </RootSpanContext.Provider>
  );
}
