/**
 * @jest-environment-options {"url": "http://something-something.com/some-page?search_params=yes&hello=hi#the-hash"}
 */
import { configureLandingPageResource } from '../src/landing-page-resource';
import { Resource } from '@opentelemetry/resources';

test('it should return a Resource', () => {
  const resource = configureLandingPageResource();
  expect(resource).toBeInstanceOf(Resource);
});

test('it should have location attributes', () => {
  const resource = configureLandingPageResource();
  expect(resource.attributes).toEqual({
    'landing_page.url':
      'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
    'landing_page.path': '/some-page',
    'landing_page.search': '?search_params=yes&hello=hi',
    'landing_page.hash': '#the-hash',
    'landing_page.hostname': 'something-something.com',
  });
});
