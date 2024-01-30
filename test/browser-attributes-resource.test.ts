import { configureBrowserAttributesResource } from '../src/browser-attributes-resource';
import { Resource } from '@opentelemetry/resources';

test('it should return a Resource', () => {
  const resource = configureBrowserAttributesResource();
  expect(resource).toBeInstanceOf(Resource);
});

test('it should have location attributes', () => {
  const resource = configureBrowserAttributesResource();
  expect(resource.attributes).toEqual({
    'browser.language': 'en-US',
    'browser.mobile': false,
    'browser.touch_screen_enabled': false,
    'screen.height': 0,
    'screen.width': 0,
    // user agent will be different locally and on CI,
    // we're really only testing to make sure it gets the value
    'user_agent.original': navigator.userAgent,
  });
});
