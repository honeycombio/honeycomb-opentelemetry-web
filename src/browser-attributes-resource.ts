import { Resource } from '@opentelemetry/resources';
import UAParser from 'ua-parser-js';

type ScreenSize = 'small' | 'medium' | 'large' | 'unknown';

export const computeScreenSize = (screenWidth: number): ScreenSize => {
  if (screenWidth <= 768) return 'small';
  else if (screenWidth > 768 && screenWidth <= 1024) return 'medium';
  else if (screenWidth > 1024) return 'large';

  return 'unknown';
};

const computeDeviceType = (
  detectedDeviceType?: string,
  detectedBrowserName?: string,
): string => {
  // ua-parser-js doesn't fill in device type unless it's in the user agent directly
  // which means that desktops/laptops show up as undefined
  // https://github.com/faisalman/ua-parser-js/issues/182
  //
  // we're going to do this:
  // browser name & device type both undefined -> unknown
  // browser name defined & device type undefined -> desktop
  // device type defined -> use that
  if (!detectedDeviceType && !detectedBrowserName) {
    return 'unknown';
  }
  if (!detectedDeviceType) {
    return 'desktop';
  }
  return detectedDeviceType;
};

export const computeDeviceProperties = (userAgent: string) => {
  const uaParser = new UAParser(userAgent);
  const { name: browserName, version: browserVersion } = uaParser.getBrowser();

  return {
    browserName: browserName ?? 'unknown',
    browserVersion: browserVersion ?? 'unknown',
    deviceType: computeDeviceType(uaParser.getDevice().type, browserName),
  };
};

export function configureBrowserAttributesResource(): Resource {
  const { browserName, browserVersion, deviceType } = computeDeviceProperties(
    navigator.userAgent,
  );
  return new Resource({
    'user_agent.original': navigator.userAgent,
    //https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
    'browser.mobile': navigator.userAgent.includes('Mobi'),
    'browser.touch_screen_enabled': navigator.maxTouchPoints > 0,
    'browser.language': navigator.language,
    'browser.name': browserName,
    'browser.version': browserVersion,
    'device.type': deviceType,
    'screen.width': window.screen.width,
    'screen.height': window.screen.height,
    'screen.size': computeScreenSize(window.screen.width),
  });
}
