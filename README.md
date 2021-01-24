[![npm](https://img.shields.io/npm/v/@redhat-developer/vscode-redhat-telemetry?color=brightgreen)](https://www.npmjs.com/package/@redhat-developer/vscode-redhat-telemetry)

This library provides Telemetry APIs specifically meant to be used by VS Code extensions developped by Red Hat.

# How to use from a VS Code extension
From a VS Code extension, you need to use a thin wrapper for accessing Red Hat's [vscode-commons API](https://github.com/redhat-developer/vscode-commons). 

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
