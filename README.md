![npm](https://img.shields.io/npm/v/@redhat-developer/vscode-redhat-telemetry?color=brightgreen)

This library is a thin wrapper for accessing Red Hat's [vscode-commons API](https://github.com/redhat-developer/vscode-commons). It's specifically meant to be used by VS Code extensions developped by Red Hat.

# How to use
To install @redhat-developer/vscode-redhat-telemetry in your VS Code extension, open a terminal and execute:

```
npm i @redhat-developer/vscode-redhat-telemetry
```

To get a reference to the TelemetryService instance for your VS Code extension:
```
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

To access the RedHat UUID for the current user:
```
import { getRedHatUUID } from "@redhat-developer/vscode-redhat-telemetry";
...
const REDHAT_UUID = getRedHatUUID();
```

# Build
In a terminal, execute: 
```
npm i
```
To update src/telemetry.ts to the latest version from https://raw.githubusercontent.com/redhat-developer/vscode-commons/master/src/interfaces/telemetry.ts, execute:
```
npm run update-interfaces
```
