// networkActivityTracker.ts
let inflightCount = 0;
let lastResponseEndTime = 0;
const idleListeners: (() => void)[] = [];

function maybeEmitIdle() {
  if (inflightCount === 0) {
    const idleStart = performance.now();
    console.log(
      `[Net] idle candidate at ${idleStart.toFixed(2)}ms, scheduling confirm...`,
    );

    setTimeout(() => {
      if (inflightCount === 0) {
        const now = performance.now();
        console.log(`[Net] confirmed network idle at ${now.toFixed(2)}ms`);
        idleListeners.forEach((cb) => cb());
        idleListeners.length = 0;
      }
    }, 100); // 100ms quiet period
  }
}

export function notifyRequestStarted(url?: string) {
  inflightCount++;
  const now = performance.now();
  console.log(
    `[Net] ➕ Request started (${inflightCount} in flight) - ${url ?? ''} @ ${now.toFixed(2)}ms`,
  );
}

export function notifyRequestCompleted(url?: string) {
  inflightCount = Math.max(0, inflightCount - 1);
  const now = performance.now();
  lastResponseEndTime = now;
  console.log(
    `[Net] ✔️ Request completed (${inflightCount} remaining) - ${url ?? ''} @ ${now.toFixed(2)}ms`,
  );

  maybeEmitIdle();
}

export function waitForNetworkIdle(): Promise<{
  idleAt: number;
  lastResponseAt: number;
}> {
  return new Promise((resolve) => {
    idleListeners.push(() => {
      resolve({
        idleAt: performance.now(),
        lastResponseAt: lastResponseEndTime,
      });
    });
    maybeEmitIdle();
  });
}
