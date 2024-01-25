/**
 * @jest-environment-options {"url": "http://something-something.com/some-page?search_params=yes&hello=hi#the-hash"}
 */
import { configureEntryPageResource } from '../src/entry-page-resource';
import { Resource } from '@opentelemetry/resources';

test('it should return a Resource', () => {
  const resource = configureEntryPageResource();
  expect(resource).toBeInstanceOf(Resource);
});

test('it should have location attributes', () => {
  const resource = configureEntryPageResource();
  expect(resource.attributes).toEqual({
    'entry_page.url':
      'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
    'entry_page.path': '/some-page',
    'entry_page.search': '?search_params=yes&hello=hi',
    'entry_page.hash': '#the-hash',
    'entry_page.hostname': 'something-something.com',
  });
});
