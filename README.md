[![npm](https://img.shields.io/npm/v/@redhat-developer/vscode-redhat-telemetry?color=brightgreen)](https://www.npmjs.com/package/@redhat-developer/vscode-redhat-telemetry)

# Red Hat Telemetry Collection API

This library provides a telemetry collection API for extensions published by Red Hat. **After getting the user's approval, anonymous** [usage data](https://github.com/redhat-developer/vscode-redhat-telemetry/blob/HEAD/USAGE_DATA.md) is collected and sent to Red Hat servers, to help improve our products and services. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection) to learn more about it.

The first time one of Red Hat's extensions engaging in telemetry collection runs, the user will be asked to opt-in Red Hat's telemetry collection program:

![Opt-in request](images/optin-popup.png)

Whether the request is accepted or denied, this pop up will not show again.

It's also possible to opt-in later, by setting the `redhat.telemetry.enabled` user setting to `true`.

From File > Preferences > Settings (On macOS: Code > Preferences > Settings), search for telemetry, and check the `Redhat > Telemetry : Enabled` setting. This will enable sending all telemetry events from Red Hat extensions going forward.


## How to disable telemetry reporting?
If you want to stop sending usage data to Red Hat, you can set the `redhat.telemetry.enabled` user setting to `false`. 

From File > Preferences > Settings (On macOS: Code > Preferences > Settings), search for telemetry, and uncheck the `Redhat > Telemetry : Enabled` setting. This will silence all telemetry events from Red Hat extensions going forward.

Additionally, and starting from version 0.5.0, this module abides by Visual Studio Code's telemetry level: if `telemetry.telemetryLevel` is set to `off`, then no telemetry events will be sent to Red Hat, even if `redhat.telemetry.enabled` is set to `true`. If `telemetry.telemetryLevel` is set to `error` or `crash`, only events containing an `error` or `errors` property will be sent to Red Hat.

# Remote configuration
Starting from version 0.5.0, Red Hat Telemetry can be remotely configured. Once every 12h (or whatever is remotely configured), [telemetry-config.json](src/config/telemetry-config.json) will be downloaded to, depending on your platform:

- **Windows** `%APPDATA%\Code\User\globalStorage\vscode-redhat-telemetry\cache\telemetry-config.json`
- **macOS** `$HOME/Library/Application\ Support/Code/User/globalStorage/vscode-redhat-telemetry/cache/telemetry-config.json`
- **Linux** `$HOME/.config/Code/User/globalStorage/vscode-redhat-telemetry/cache/telemetry-config.json`

This allows Red Hat extensions to limit the events to be sent, by including or excluding certain events, by name or containing properties, or by limiting the ratio of users sending data.
eg.:
- 50% of `redhat.vscode-hypothetical` users only, to report error events, excluding stackoverflows:

Starting with 0.6.1, you can configure ratios on included events, meaning X% of the users will send a particular event (does not mean X% of the events will be sent!).

```json
{
    "*": {
        "enabled":"all", // supports "all", "error", "crash", "off"
        "refresh": "12h",
        "includes": [
            {
                "name" : "startup",
                "dailyLimit": "1" // Limit to 1 event per day per extension
            },
            {
                "name" : "*" // Always put wildcard patterns last in the array, to ensure other events are included
            }
        ]
    },
    "redhat.vscode-hypothetical": {
        "enabled": "error", 
        "ratio": "0.5", // 50% of the users will send data
        "excludes": [
            {
                "property": "error",
                "value": "*stackoverflow*"
            }
        ]
    },
    "redhat.vscode-mythological": {
        "enabled": "all", 
        "includes": [
            {
                "name": "something-too-frequent",
                "ratio":"0.1" // 10% of the users will send that event
            },
            {
                "name": "something-less-frequent",// all users could send that event but ...
            }
        ],
        "excludes": [
            {
                "name": "something-less-frequent",
                "ratio":"0.997" //... actually 99.7% of the users won't send that event
            }
        ]
    }
}
```

Extension configuration inherits and overrides the `*` configuration.


# How to use this library

## Add the `@redhat-developer/vscode-redhat-telemetry` dependency

In order to install [`@redhat-developer/vscode-redhat-telemetry`](https://github.com/redhat-developer/vscode-redhat-telemetry/) in your VS Code extension, open a terminal and execute:

```
npm i @redhat-developer/vscode-redhat-telemetry
```
## Contribute the `redhat.telemetry.enabled` preference
Unless your extension already depends on a telemetry-enabled Red Hat extension, it needs to declare the `redhat.telemetry.enabled` preference in its package.json, like:

```
"contributes": {
    "configuration": {
      ...
      "properties": {
        ...
        "redhat.telemetry.enabled": {
          "type": "boolean",
          "default": null,
          "markdownDescription": "Enable usage data and errors to be sent to Red Hat servers. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection).",
          "tags":[ "telemetry", "usesOnlineServices" ],
          "scope": "window"
        },
      }
    }
}
```
## [Optional] Add a custom segment key in package.json file
By default, extensions will send their data to https://app.segment.com/redhat-devtools/sources/vscode/. In development mode, the data is sent to https://app.segment.com/redhat-devtools/sources/vs_code_tests/.

- You can specify custom segment keys in your package.json, to connect and push usage data to https://segment.com/

```json
    "segmentWriteKey": "your-segment-key-goes-here",
    "segmentWriteKeyDebug": "your-segment-key-goes-here-for-dev-mode",
```

## Add the below code to your `extension.ts`

Get a reference to the RedHatService instance from your VS Code extension's `activate` method in `extension.ts`:
```typescript
import { getRedHatService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";

let telemetryService: TelemetryService = null;

export async function activate(context: ExtensionContext) {
  const redhatService = await getRedHatService(context);  
  telemetryService = await redhatService.getTelemetryService();
  telemetryService.sendStartupEvent();
  ...
}
```

Send events from the telemetryService reference:

```typescript
...
if (telemetryService) {
  telemetryService.send({name: "Simplest event"});
  ...
  let event = {
    name: "Test Event",
    type: "track", // optional type (track is the default)
    properties: { // optional custom properties
      foo: "bar", 
    }
  };
  telemetryService.send(event);
}
```

To access the anonymous Red Hat UUID for the current user:
```typescript
const redhatUuid = await (await redhatService.getIdProvider()).getRedHatUUID();
```

Once your extension is deactivated, a shutdown event, including the session duration, will automatically be sent on its behalf. However, shutdown event delivery is not guaranteed, in case VS Code is faster to exit than to send those last events.

All event properties are automatically sanitized to anonymize all paths (best effort) and references to the username.


## Publicly document your data collection

Once telemetry is in place, you need to document the extent of the telemetry collection performed by your extension.
* add a USAGE_DATA.md page to your extension's repository, listing the type of data being collected by your extension.
* add a `Data and Telemetry` paragraph at the end of your extension's README file:
> `The ***** extension collects anonymous [usage data](USAGE_DATA.md) and sends it to Red Hat servers to help improve our products and services. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection) to learn more. This extension respects the `redhat.telemetry.enabled` setting which you can learn more about at https://github.com/redhat-developer/vscode-redhat-telemetry#how-to-disable-telemetry-reporting`

* add a reference to your telemetry documentation page to this repository's own [USAGE_DATA.md](https://github.com/redhat-developer/vscode-redhat-telemetry/blob/HEAD/USAGE_DATA.md#other-extensions).

### Checking telemetry during development
In your `.vscode/launch.json`:
- set the `VSCODE_REDHAT_TELEMETRY_DEBUG` environment variable to `true`, to log telemetry events in the console
- set the `REDHAT_TELEMETRY_REMOTE_CONFIG_URL` environment variable to the URL of a remote configuration file, if you need to test remote configuration 

```json
{
  "name": "Run Extension",
  "type": "extensionHost",
  "request": "launch",
  "args": [
    "--extensionDevelopmentPath=${workspaceFolder}"
  ],
  "outFiles": [
    "${workspaceFolder}/dist/**/*.js"
  ],
  "preLaunchTask": "${defaultBuildTask}",
  "env": {
    "VSCODE_REDHAT_TELEMETRY_DEBUG":"true",
    "REDHAT_TELEMETRY_REMOTE_CONFIG_URL":"https://gist.githubusercontent.com/fbricon/cff82f0bd7ff69bf2b9f5f04b1accc50/raw/65b61b7d8845c842a90a8e6a90d852af34934160/telemetry-config.json"
  }
},
```


# How to use from a VS Code web extension
When the VS Code extension runs as a web extension, telemetry should use a webworker specific API. So just change your code so it imports from the dedicated webworker namespace. 

```typescript
import { getRedHatService, TelemetryService} from "@redhat-developer/vscode-redhat-telemetry/lib/webworker";
```

The API is identical to the regular node one.

However, in order for webpack to compile your web extension, some adjustments are required to the alias and fallback properties:

```js
/**@type {import('webpack').Configuration}*/
const webConfig = {
  target: 'webworker', // extensions run in a webworker context
  ...
  resolve: {
    ...
    alias: {
      'node-fetch': 'whatwg-fetch',
      'object-hash': 'object-hash/dist/object_hash.js',
    },
    fallback: {
      path: require.resolve('path-browserify'),
      'node-fetch': require.resolve('whatwg-fetch'),
      util: require.resolve('util'),
    },
  },
  ...
};
```

# Build
In a terminal, execute: 
```
npm i
```
to install the dependencies, then:
```
npm run prepublish
```
to build the library

# Information on data transmission during development

When the extension sending telemetry is running in `development mode`, the data are sent to the `test.vscode` project on https://segment.com/, or whatever project bound to the optional [segmentWriteDebugKey](#optional-add-a-custom-segment-key-in-packagejson-file).
As the transmission is opt-in, unless specifiying it explicitely, no data are transmitted during CI builds.
