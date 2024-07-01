import { pathnameToRoute } from '../src/pathname-to-route';

describe('pathnameToRoute', () => {
  it('infers the route from the pathname', () => {
    const cases = [
      ['/entity/BBA1B7C5-3CE1-42CD-984A-9D95988B08E7', '/entity/{param1}'],
      ['/entity/abcde', '/entity/abcde'],
      ['/entity/bba1b7c5-3ce1-42cd-984a-9d95988b08e7', '/entity/{param1}'],
      [
        '/entity/bba1b7c5-3ce1-42cd-984a-9d95988b08e7/sub/BBA1B7C5-3CE1-42CD-984A-9D95988B08E8',
        '/entity/{param1}/sub/{param2}',
      ],
    ];
    for (const [pathname, route] of cases) {
      expect(pathnameToRoute(pathname)).toEqual(route);
    }
  });
});
