import { Resource } from '@opentelemetry/resources';

export function configureBrowserAttributesResource(): Resource {
  return new Resource({
    'user_agent.original': navigator.userAgent,
    //https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
    'browser.mobile': navigator.userAgent.includes('Mobi'),
    'browser.touch_screen_enabled': navigator.maxTouchPoints > 0,
    'browser.language': navigator.language,
    'screen.width': window.screen.width,
    'screen.height': window.screen.height,
  });
}
