/**
 * @jest-environment-options {"url": "http://something-something.com/some-page?search_params=yes&hello=hi#the-hash"}
 */
import { configureEntryPageResource } from '../src/entry-page-resource';
import { Resource } from '@opentelemetry/resources';

afterEach(() => {
  jest.resetAllMocks();
});

test('it should return a Resource', () => {
  const resource = configureEntryPageResource();
  expect(resource).toBeInstanceOf(Resource);
});

test('when called without a custom config, the resource should include default attributes', () => {
  jest
    .spyOn(document, 'referrer', 'get')
    .mockReturnValue('http://fan-site.com');

  const resource = configureEntryPageResource();
  expect(resource.attributes).toEqual({
    'entry_page.path': '/some-page',
    'entry_page.hash': '#the-hash',
    'entry_page.hostname': 'something-something.com',
    'entry_page.referrer': 'http://fan-site.com',
  });
});

test('when called with false, it should return an emtpy resource', () => {
  const resource = configureEntryPageResource(false);

  expect(resource.attributes).toEqual({});
});

test('a custom config overrides the default attributes', () => {
  jest.spyOn(document, 'referrer', 'get').mockReturnValue('');
  const resource = configureEntryPageResource({ path: false, url: true });

  expect(resource.attributes).toEqual({
    'entry_page.url':
      'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
    'entry_page.hash': '#the-hash',
    'entry_page.hostname': 'something-something.com',
    'entry_page.referrer': '',
  });
});
