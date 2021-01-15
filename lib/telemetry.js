"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telemetry = void 0;
const setExtensionName_1 = require("./setExtensionName");
const checkStatus_1 = require("./checkStatus");
var Telemetry;
(function (Telemetry) {
    function send(event) {
        checkStatus_1.checkVscodeCommonsStatus().then((vscodeCommons) => {
            const extensionIdentifier = setExtensionName_1.clientExtensionName;
            const vscodeCommonsAPI = vscodeCommons === null || vscodeCommons === void 0 ? void 0 : vscodeCommons.exports;
            const telemetryService = vscodeCommonsAPI.getTelemetryService(extensionIdentifier);
            //   context.subscriptions.push(telemetryService);
            telemetryService.send(Object.assign({}, event));
        });
    }
    Telemetry.send = send;
})(Telemetry = exports.Telemetry || (exports.Telemetry = {}));
//# sourceMappingURL=telemetry.js.map