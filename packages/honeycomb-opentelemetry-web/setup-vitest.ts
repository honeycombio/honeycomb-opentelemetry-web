import { afterEach, beforeEach, vi } from 'vitest';

const getEntriesByTypeSpy = vi.fn(() => {
  return [] as PerformanceEntryList;
});

beforeEach(() => {
  global.performance.getEntriesByType = getEntriesByTypeSpy;
});

afterEach(() => {
  getEntriesByTypeSpy.mockClear();
});
