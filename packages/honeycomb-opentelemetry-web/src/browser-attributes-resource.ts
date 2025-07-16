import {
  DetectedResourceAttributes,
  Resource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { ATTR_USER_AGENT_ORIGINAL } from '@opentelemetry/semantic-conventions';
import {
  ATTR_BROWSER_LANGUAGE,
  ATTR_BROWSER_MOBILE,
} from '@opentelemetry/semantic-conventions/incubating';
import UAParser from 'ua-parser-js';
import {
  ATTR_BROWSER_NAME,
  ATTR_BROWSER_TOUCH_SCREEN_ENABLED,
  ATTR_BROWSER_VERSION,
  ATTR_DEVICE_TYPE,
  ATTR_NETWORK_EFFECTIVE_TYPE,
  ATTR_SCREEN_HEIGHT,
  ATTR_SCREEN_SIZE,
  ATTR_SCREEN_WIDTH,
} from './semantic-attributes';

type ScreenSize = 'small' | 'medium' | 'large' | 'unknown';

export const computeScreenSize = (screenWidth: number): ScreenSize => {
  if (screenWidth <= 768) return 'small';
  else if (screenWidth > 768 && screenWidth <= 1024) return 'medium';
  else if (screenWidth > 1024) return 'large';

  return 'unknown';
};

type NetworkInformationEffectiveType = 'slow-2g' | '2g' | '3g' | '4g';
type ExtendedNavigator = Navigator & {
  connection: NetworkInformation;
};
type NetworkInformation = {
  effectiveType?: NetworkInformationEffectiveType;
};

export const computeNetworkType = (networkInformation?: NetworkInformation) =>
  networkInformation?.effectiveType ?? 'unknown';

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

  const browserAttributes: DetectedResourceAttributes = {
    [ATTR_USER_AGENT_ORIGINAL]: navigator.userAgent,
    //https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
    [ATTR_BROWSER_MOBILE]: navigator.userAgent.includes('Mobi'),
    [ATTR_BROWSER_TOUCH_SCREEN_ENABLED]: navigator.maxTouchPoints > 0,
    [ATTR_BROWSER_LANGUAGE]: navigator.language,
    [ATTR_BROWSER_NAME]: browserName,
    [ATTR_BROWSER_VERSION]: browserVersion,
    [ATTR_DEVICE_TYPE]: deviceType,
    [ATTR_NETWORK_EFFECTIVE_TYPE]: computeNetworkType(
      (navigator as ExtendedNavigator).connection,
    ),
    [ATTR_SCREEN_WIDTH]: window.screen.width,
    [ATTR_SCREEN_HEIGHT]: window.screen.height,
    [ATTR_SCREEN_SIZE]: computeScreenSize(window.screen.width),
  };

  return resourceFromAttributes(browserAttributes);
}
