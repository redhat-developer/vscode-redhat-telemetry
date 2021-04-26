[![npm](https://img.shields.io/npm/v/@redhat-developer/vscode-redhat-telemetry?color=brightgreen)](https://www.npmjs.com/package/@redhat-developer/vscode-redhat-telemetry)

This library provides Telemetry APIs specifically meant to be used by VS Code extensions developped by Red Hat.

# How to use from a VS Code extension

`@redhat-developer/vscode-redhat-telemetry` acts as a thin wrapper for Red Hat's [vscode-commons API](https://github.com/redhat-developer/vscode-commons).

Start by adding `redhat.vscode-commons` to the `extensionDependencies` section of your extension's package.json, so that dependency can be automatically downloaded and installed, when installing your extension from the Marketplace.

```
  "extensionDependencies": ["redhat.vscode-commons"],
```

To install `@redhat-developer/vscode-redhat-telemetry` in your VS Code extension, open a terminal and execute:

```
npm i @redhat-developer/vscode-redhat-telemetry
```

To get a reference to the TelemetryService instance for your VS Code extension:
```typescript
import { getTelemetryService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry";
...
let telemetryService: TelemetryService = await getTelemetryService("redhat.your-extension-id")
...

// Call from your extension's activate() function
telemetryService.sendStartupEvent(); 

...
let event = {
    type: "track",
    name: "Test Event",
};
telemetryService.send(event);
```

To access the anonymous Red Hat UUID for the current user:
```typescript
import { getRedHatUUID } from "@redhat-developer/vscode-redhat-telemetry";
...
const REDHAT_UUID = getRedHatUUID();
```

# How to use from a VS Code webview
From a VS Code webview, since you can not rely on accessing the filesystem, you need to instanciate the `TelemetryService` from a `TelemetryServiceBuilder`, providing browser-specific implementations of services for collecting data. 

To get a reference to the TelemetryService instance for your VS Code extension:
```typescript
import { TelemetryServiceBuilder, TelemetryService, TelemetrySettings, Environment, IdManager } from "@redhat-developer/vscode-redhat-telemetry";
...
const packageJson: any = ...; // an object defining `{publisher:string, name:string, version:string, segmentWriteKey:string}` 
const idManager: IdManager = ...; // a service returning Red Hat anonymous UUID
const environment: Environment = ...; // an object containing environment specific data (OS, locale...)
const settings:TelemetrySettings = ...;  // an object checking whether telemetry collection is enabled
const telemetryService: TelemetryService = new TelemetryServiceBuilder(packageJson)
                                             .setIdManager(idManager) 
                                             .setEnvironment(environment) 
                                             .setSettings(settings)
...
let event = {
    type: "track",
    name: "Test Event",
};
telemetryService.send(event);

//To access the RedHat UUID for the current user:
const REDHAT_UUID = idManager.getRedHatUUID();
```

# Build
In a terminal, execute: 
```
npm i
```

# Information on data transmission during development

When the extension sending telemetry is running in `development mode`, the data are sent to the `test.vscode` project, or whatever project bound to the optional [segmentWriteDebugKey](https://github.com/redhat-developer/vscode-commons/blob/master/INSTRUCTIONS.md#optional-add-a-custom-segment-key-in-packagejson-file).
As the transmission is opt-in, unless specifiying it explicitely, no data are transmitted during CI build.
