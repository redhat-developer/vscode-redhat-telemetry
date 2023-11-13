import { AnalyticsEvent } from '../api/analyticsEvent';
import { Environment } from '../api/environment';
import { TelemetryEvent } from '../api/telemetry';

/**
 * Enhances a `TelemetryEvent` by injecting environmental data to its properties and context
 *
 * See segment.com fields: https://segment.com/docs/connections/spec/common/#integrations
 * {
  "anonymousId": "507f191e810c19729de860ea",
  "context": {
    "active": true,
    "app": {
      "name": "InitechGlobal",
      "version": "545",
      "build": "3.0.1.545",
      "namespace": "com.production.segment"
    },
    "campaign": {
      "name": "TPS Innovation Newsletter",
      "source": "Newsletter",
      "medium": "email",
      "term": "tps reports",
      "content": "image link"
    },
    "device": {
      "id": "B5372DB0-C21E-11E4-8DFC-AA07A5B093DB",
      "advertisingId": "7A3CBEA0-BDF5-11E4-8DFC-AA07A5B093DB",
      "adTrackingEnabled": true,
      "manufacturer": "Apple",
      "model": "iPhone7,2",
      "name": "maguro",
      "type": "ios",
      "token": "ff15bc0c20c4aa6cd50854ff165fd265c838e5405bfeb9571066395b8c9da449"
    },
    "ip": "8.8.8.8",
    "library": {
      "name": "analytics.js",
      "version": "2.11.1"
    },
    "locale": "en-US",
    "location": {
      "city": "San Francisco",
      "country": "United States",
      "latitude": 40.2964197,
      "longitude": -76.9411617,
      "speed": 0
    },
    "network": {
      "bluetooth": false,
      "carrier": "T-Mobile US",
      "cellular": true,
      "wifi": false
    },
    "os": {
      "name": "iPhone OS",
      "version": "8.1.3"
    },
    "page": {
      "path": "/academy/",
      "referrer": "",
      "search": "",
      "title": "Analytics Academy",
      "url": "https://segment.com/academy/"
    },
    "referrer": {
      "id": "ABCD582CDEFFFF01919",
      "type": "dataxu"
    },
    "screen": {
      "width": 320,
      "height": 568,
      "density": 2
    },
    "groupId": "12345",
    "timezone": "Europe/Amsterdam",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
  },
  "integrations": {
    "All": true,
    "Mixpanel": false,
    "Salesforce": false
  },
  "messageId": "022bb90c-bbac-11e4-8dfc-aa07a5b093db",
  "receivedAt": "2015-12-10T04:08:31.909Z",
  "sentAt": "2015-12-10T04:08:31.581Z",
  "timestamp": "2015-12-10T04:08:31.905Z",
  "type": "track",
  "userId": "97980cfea0067",
  "version": 2
}
 *
 * @param event the event to enhance
 * @param environment the environment data to inject the event with
 */
export const IGNORED_USERS = ['user', 'gitpod', 'theia', 'vscode', 'redhat']
export const IGNORED_PROPERTIES = ['extension_name', 'extension_version', 'app_name', 'app_version', 'app_kind', 'app_remote', 'app_host', 'browser_name', 'browser_version', '']

export function transform(event: TelemetryEvent, userId: string, environment: Environment): AnalyticsEvent {
  //Inject Client name and version,  Extension id and version, and timezone to the event properties
  const properties = event.properties ? sanitize(event.properties, environment) : {};
  if (!(event.type) || event.type == 'track') {
    properties.extension_name = environment.extension.name
    properties.extension_version = environment.extension.version
    properties.app_name = environment.application.name;
    properties.app_version = environment.application.version;
    if (environment.application.uiKind) {
      properties.app_kind = environment.application.uiKind;
    }
    if (environment.application.remote) {
      properties.app_remote = environment.application.remote;
    }
    if (environment.application.appHost) {
      properties.app_host = environment.application.appHost;
    }
    //WTF
    if (environment.browser?.name) {
      properties.browser_name = environment.browser.name;
    }
    if (environment.browser?.version) {
      properties.browser_version = environment.browser.version;
    }
  }

  const traits = event.traits ? sanitize(event.traits, environment) : {};
  if (event.type == 'identify') {
    //All those traits should be handled by Woopra in the context block, but are not. Meh.
    traits.timezone = environment.timezone;
    traits.os_name = environment.platform.name;
    traits.os_version = environment.platform.version;
    traits.os_distribution = environment.platform.distribution;
    traits.locale = environment.locale;
  }

  //Inject Platform specific data in segment's context, so it can be recognized by the end destination
  // XXX Currently, Woopra ignores app, os, locale and timezone
  const context = event.context ? event.context : {};
  context.ip = '0.0.0.0';
  context.app = {
    name: environment.application.name,
    version: environment.application.version
  };
  context.os = {
    name: environment.platform.name,
    version: environment.platform.version,
  };
  context.locale = environment.locale;
  context.location = {
    // This is inaccurate in some cases (user uses a different locale than from his actual country),
    // but still provides an interesting metric in most cases.
    country: environment.country
  };
  context.timezone = environment.timezone;

  const enhancedEvent: AnalyticsEvent = {
    userId: userId,
    event: event.name,
    type: event.type ? event.type : 'track', // type of telemetry event such as : identify, track, page, etc.
    properties: properties,
    measures: event.measures,
    traits: traits,
    context: context
  };
  return enhancedEvent;
}

function sanitize(properties: any, environment: Environment): any {
  const sanitized: any = {};
  let usernameRegexp: RegExp | undefined;
  if (environment.username && environment.username.length > 3 && !IGNORED_USERS.includes(environment.username)) {
    usernameRegexp = new RegExp(environment.username, 'g');
  }
  for (const p in properties) {
    const rawProperty = properties[p];
    if (!rawProperty || IGNORED_PROPERTIES.includes(p) || !usernameRegexp || isNonStringPrimitive(rawProperty)) {
      sanitized[p] = rawProperty;
      continue;
    }
    const isObj = isObject(rawProperty);
    let sanitizedProperty = isObj ? JSON.stringify(rawProperty) : rawProperty;

    sanitizedProperty = (sanitizedProperty as string).replace(usernameRegexp, '_username_');
    if (isObj) {
      //let's try to deserialize into a sanitized object
      try {
        sanitizedProperty = JSON.parse(sanitizedProperty);
      } catch (e) {
        //We messed up, we'll return the sanitized string instead
      }
    }
    sanitized[p] = sanitizedProperty;
  }
  return sanitized;
}

function isObject(test: any): boolean {
  return test === Object(test);
}

export function isError(event: any): boolean {
  return event.properties?.error || event.properties?.errors;
}

function isNonStringPrimitive(test: any) {
  return typeof test !== "string" && !(test instanceof String) && !isObject(test);
}
