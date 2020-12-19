"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telemetry = void 0;
const initialize_1 = require("./initialize");
var Telemetry;
(function (Telemetry) {
    function send(event) {
        initialize_1.initialize().then((vscodeCommons) => {
            const extensionIdentifier = "redhat.alice";
            const vscodeCommonsAPI = vscodeCommons === null || vscodeCommons === void 0 ? void 0 : vscodeCommons.exports;
            const telemetryService = vscodeCommonsAPI.getTelemetryService(extensionIdentifier);
            //   context.subscriptions.push(telemetryService);
            telemetryService.send(Object.assign({}, event));
        });
    }
    Telemetry.send = send;
})(Telemetry = exports.Telemetry || (exports.Telemetry = {}));
//# sourceMappingURL=telemetry.js.map