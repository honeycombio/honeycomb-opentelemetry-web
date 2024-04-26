import { Resource } from '@opentelemetry/resources';
import UAParser from 'ua-parser-js';

type ScreenSize = 'small' | 'medium' | 'large' | 'unknown';

export const computeScreenSize = (screenWidth: number): ScreenSize => {
  if (screenWidth <= 768) return 'small';
  else if (screenWidth > 768 && screenWidth <= 1024) return 'medium';
  else if (screenWidth > 1024) return 'large';

  return 'unknown';
};

export const computeBrowserName = (userAgent: string) => {
  const uaParser = new UAParser(userAgent);
  return uaParser.getBrowser().name ?? 'unknown';
};

export function configureBrowserAttributesResource(): Resource {
  return new Resource({
    'user_agent.original': navigator.userAgent,
    //https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
    'browser.mobile': navigator.userAgent.includes('Mobi'),
    'browser.touch_screen_enabled': navigator.maxTouchPoints > 0,
    'browser.language': navigator.language,
    'browser.name': computeBrowserName(navigator.userAgent),
    'screen.width': window.screen.width,
    'screen.height': window.screen.height,
    'screen.size': computeScreenSize(window.screen.width),
  });
}
