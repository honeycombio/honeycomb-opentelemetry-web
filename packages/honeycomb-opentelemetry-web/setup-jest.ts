
import { afterEach, beforeEach, jest } from '@jest/globals';

const getEntriesByTypeSpy = jest.fn(() => {
  return [];
});

beforeEach(() => {
  global.performance.getEntriesByType = getEntriesByTypeSpy;
});

afterEach(() => {
  getEntriesByTypeSpy.mockClear();
});
