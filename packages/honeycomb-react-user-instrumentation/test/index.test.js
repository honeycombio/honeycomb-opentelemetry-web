import { add } from '../src/index';

describe('add', () => {
  it('adds', () => {
    expect(add(1, 1)).toBe(2);
  });
});
