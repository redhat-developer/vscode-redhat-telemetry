"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telemetry = void 0;
const checkStatus_1 = require("./checkStatus");
var Telemetry;
(function (Telemetry) {
    let telemetryServiceInstance = null;
    let clientExtensionName = "";
    function send(event) {
        const telemetryService = getTelemetryService();
        //   context.subscriptions.push(telemetryService);
        telemetryService.send(Object.assign({}, event));
    }
    Telemetry.send = send;
    function setExtensionName(extensionName) {
        if (extensionName) {
            clientExtensionName = extensionName;
        }
    }
    Telemetry.setExtensionName = setExtensionName;
    function getTelemetryService() {
        if (telemetryServiceInstance) {
            console.log("vscode-tele: inside telemetryServiceInstance");
            checkStatus_1.checkVscodeCommonsStatus().then((vscodeCommons) => __awaiter(this, void 0, void 0, function* () {
                const extensionIdentifier = clientExtensionName;
                const vscodeCommonsAPI = vscodeCommons === null || vscodeCommons === void 0 ? void 0 : vscodeCommons.exports;
                telemetryServiceInstance = yield vscodeCommonsAPI.getTelemetryService(extensionIdentifier);
            }));
        }
        return telemetryServiceInstance;
    }
})(Telemetry = exports.Telemetry || (exports.Telemetry = {}));
//# sourceMappingURL=telemetry.js.map