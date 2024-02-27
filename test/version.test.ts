import { VERSION } from '../src/version';

describe('sdk version', () => {
  it('matches package.json version', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const expectedVersion = require('../package.json').version;
    expect(VERSION).toBe(expectedVersion);
  });
});
