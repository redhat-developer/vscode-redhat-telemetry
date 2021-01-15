# How to use

```
npm i vscode-tele
```

```
import { Telemetry, setExtensionName } from "vscode-tele";

```

```
// set your extension name
setExtensionName("redhat.alice");

let event = {
    type: "track",
    name: "Test Event",
};
Telemetry.send(event);
```
