import {
  computeDeviceProperties,
  computeNetworkType,
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
    'browser.name': 'WebKit',
    'browser.version': '537.36',
    'browser.language': 'en-US',
    'browser.mobile': false,
    'browser.touch_screen_enabled': false,
    'device.type': 'desktop',
    'network.effectiveType': 'unknown',
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

describe('compute browser type', () => {
  // sample UAs courtesy of
  // https://explore.whatismybrowser.com/useragents/explore/software_name/
  // https://useragents.io/explore
  const USER_AGENTS = {
    'Android Browser': [
      'Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
    ],
    Chrome: [
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
      'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; TECNO BG6 Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.118 Mobile Safari/537.36',
    ],
    Chromium: [
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/124.0.6329.210 Chrome/124.0.6329.210 Safari/537.36',
    ],
    Edge: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 EdgA/122.0.0.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/46.2.5 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299',
    ],
    Firefox: [
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
      'Mozilla/5.0 (X11; Linux x86_64; rv:93.0) Gecko/20100101 Firefox/93.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
      'Mozilla/5.0 (Android 14; Mobile; rv:124.0) Gecko/124.0 Firefox/124.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/114.1 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:16.0) Gecko/20121011 Firefox/16.0 SeaMonkey/2.13.1 Lightning/1.8',
    ],
    IE: [
      'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
    ],
    'Mobile Safari': [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 15_8_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1',
    ],
    Opera: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0 (Edition std-1)',
      'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML like Gecko) Chrome/39.0.2171.65 Safari/537.36 OPR/26.0.1656.24',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 OPR/97.0.0.0',
      'Mozilla/5.0 (Windows NT 5.1; U; en) Opera 8.01',
      'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
    ],
    Safari: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
      'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.71 (KHTML like Gecko) WebVideo/1.0.1.10 Version/7.0 Safari/537.71',
    ],
    unknown: [
      'blah blah blah',
      'DeathStar/1.0 (X11; Linux x86_64) like StarDestroyer/12.11',
      'Hello World',
      'Dalvik/2.1.0 (Linux; U; Android 13; SM-A326B Build/TP1A.220624.014)',
    ],
  };

  Object.entries(USER_AGENTS).forEach(([type, userAgents]) => {
    test(`determines ${type}`, () => {
      userAgents.forEach((userAgent) => {
        expect(computeDeviceProperties(userAgent).browserName).toBe(type);
      });
    });
  });
});

describe('compute device type', () => {
  // sample UAs courtesy of
  // https://explore.whatismybrowser.com/useragents/explore/software_name/
  // https://useragents.io/explore
  const USER_AGENTS = {
    console: [
      'Mozilla/5.0 (Nintendo Switch; WifiWebAuthApplet) AppleWebKit/609.4 (KHTML, like Gecko) NF/6.0.2.20.5 NintendoBrowser/5.1.0.22023',
      'Opera/9.50 (Nintendo DSi; Opera/446; U; ja)',
      'Mozilla/5.0 (Nintendo 3DS; U; ; pt) Version/1.7630.EU',
      'Mozilla/5.0 (PlayStation Vita 3.73) AppleWebKit/537.73 (KHTML, like Gecko) Silk/3.2',
      'Mozilla/5.0 (PlayStation; PlayStation 4/11.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17742',
    ],
    desktop: [
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36',
      'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/124.0.6329.210 Chrome/124.0.6329.210 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
      'Mozilla/5.0 (X11; Linux x86_64; rv:93.0) Gecko/20100101 Firefox/93.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
      'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:16.0) Gecko/20121011 Firefox/16.0 SeaMonkey/2.13.1 Lightning/1.8',
      'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0 (Edition std-1)',
      'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML like Gecko) Chrome/39.0.2171.65 Safari/537.36 OPR/26.0.1656.24',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 OPR/97.0.0.0',
      'Mozilla/5.0 (Windows NT 5.1; U; en) Opera 8.01',
      'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
      'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.71 (KHTML like Gecko) WebVideo/1.0.1.10 Version/7.0 Safari/537.71',
    ],
    mobile: [
      'Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
      'Mozilla/5.0 (Linux; Android 13; TECNO BG6 Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.118 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 EdgA/122.0.0.0',
      'Mozilla/5.0 (Android 14; Mobile; rv:124.0) Gecko/124.0 Firefox/124.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/46.2.5 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/114.1 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      'Dalvik/2.1.0 (Linux; U; Android 13; SM-A326B Build/TP1A.220624.014)',
    ],
    smarttv: [
      'AppleCoreMedia/1.0.0.17J586 (Apple TV; U; CPU OS 13_0 like Mac OS X; en_us)',
      'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.5) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/5.0 Chrome/85.0.4183.93 TV Safari/537.36',
    ],
    tablet: [
      'Mozilla/5.0 (iPad; CPU OS 15_8_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1',
    ],
    unknown: [
      'blah blah blah',
      'DeathStar/1.0 (X11; Linux x86_64) like StarDestroyer/12.11',
      'Hello World',
    ],
  };

  Object.entries(USER_AGENTS).forEach(([type, userAgents]) => {
    test(`determines ${type}`, () => {
      userAgents.forEach((userAgent) => {
        expect(computeDeviceProperties(userAgent).deviceType).toBe(type);
      });
    });
  });
});

describe('computeNetworkSpeed', () => {
  it('handles undefined', () => {
    expect(computeNetworkType()).toBe('unknown');
  });
  it('handles objects without the effectiveType property', () => {
    expect(computeNetworkType({})).toBe('unknown');
  });
  it('computes network speed', () => {
    expect(computeNetworkType({ effectiveType: 'slow-2g' })).toBe('slow-2g');
    expect(computeNetworkType({ effectiveType: '2g' })).toBe('2g');
    expect(computeNetworkType({ effectiveType: '3g' })).toBe('3g');
    expect(computeNetworkType({ effectiveType: '4g' })).toBe('4g');
  });
});
