/** a permissive regex for UUIDs, any sequence of hex characters in the uuid format will do */
const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/**
 * takes a URL pathname, replaces uuid segments with paramN
 */
export function pathnameToRoute(pathname: string): string {
  const segments = pathname.split('/');

  let count = 0;
  const routeSegments = segments.map((segment) => {
    if (uuidRe.test(segment)) {
      return `{param${++count}}`;
    }
    return segment;
  });

  return routeSegments.join('/');
}
