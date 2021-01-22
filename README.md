# How to use

```
npm i @redhat-developer/vscode-redhat-telemetry
```

```
import { Telemetry } from "@redhat-developer/vscode-redhat-telemetry";

```

```
// set your extension name
Telemetry.setExtension("redhat.alice");

let event = {
    type: "track",
    name: "Test Event",
};
Telemetry.send(event);

// to get RedHat UUID
Telemetry.getRedHatUUID()
```
