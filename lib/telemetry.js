"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telemetry = void 0;
const setExtensionName_1 = require("./setExtensionName");
const checkStatus_1 = require("./checkStatus");
let telemetryServiceInstance = null;
var Telemetry;
(function (Telemetry) {
    function send(event) {
        const telemetryService = getTelemetryService();
        //   context.subscriptions.push(telemetryService);
        telemetryService.send(Object.assign({}, event));
    }
    Telemetry.send = send;
    function getTelemetryService() {
        if (telemetryServiceInstance) {
            console.log("vscode-tele: inside telemetryServiceInstance");
            checkStatus_1.checkVscodeCommonsStatus().then((vscodeCommons) => {
                const extensionIdentifier = setExtensionName_1.clientExtensionName;
                const vscodeCommonsAPI = vscodeCommons === null || vscodeCommons === void 0 ? void 0 : vscodeCommons.exports;
                telemetryServiceInstance = vscodeCommonsAPI.getTelemetryService(extensionIdentifier);
            });
        }
        return telemetryServiceInstance;
    }
})(Telemetry = exports.Telemetry || (exports.Telemetry = {}));
//# sourceMappingURL=telemetry.js.map