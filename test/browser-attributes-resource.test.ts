import {
  computeScreenSize,
  configureBrowserAttributesResource,
} from '../src/browser-attributes-resource';
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
    'screen.size': 'small',
  });
});

describe('compute screen size', () => {
  test('it returns small for sizes less than or equal to 768', () => {
    expect(computeScreenSize(600)).toBe('small');
    expect(computeScreenSize(768)).toBe('small');
  });

  test('it returns medium for sizes greater than 768 and less than or equal to 1024', () => {
    expect(computeScreenSize(769)).toBe('medium');
    expect(computeScreenSize(1024)).toBe('medium');
  });

  test('it returns large for sizes larger than 1024', () => {
    expect(computeScreenSize(1025)).toBe('large');
  });
});
