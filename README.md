# How to use

```
npm i vscode-tele
```

```
import { Telemetry } from "vscode-tele";

```

```
// set your extension name
Telemetry.setExtensionName("redhat.alice");

let event = {
    type: "track",
    name: "Test Event",
};
Telemetry.send(event);

// to get RedHat UUID
Telemetry.getRedHatUUID()
```
