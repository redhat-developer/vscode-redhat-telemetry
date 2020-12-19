# How to use

```
npm i vscode-tele
```

```
import {Telemetry} from "vscode-tele";
```

```
let event = {
    type: "track",
    name: "Test Event",
};
Telemetry.send(event);
```
