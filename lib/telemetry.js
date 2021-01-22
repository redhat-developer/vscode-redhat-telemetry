"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const vscode = __importStar(require("vscode"));
let clientExtensionId = "";
let telemetryService;
let REDHAT_UUID;
let vscodeCommonsAPI;
var Telemetry;
(function (Telemetry) {
    function send(event) {
        return __awaiter(this, void 0, void 0, function* () {
            //   context.subscriptions.push(telemetryService);
            console.log("vscode-redhat-telemetry: inside telemetryServiceInstance");
            yield ensureVSCodeCommonsActive();
            if (telemetryService) {
                telemetryService.send(Object.assign({}, event));
            }
        });
    }
    Telemetry.send = send;
    function setExtension(extensionId) {
        if (extensionId) {
            clientExtensionId = extensionId;
        }
    }
    Telemetry.setExtension = setExtension;
    function getRedHatUUID() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!REDHAT_UUID) {
                yield ensureVSCodeCommonsActive();
                REDHAT_UUID = yield vscodeCommonsAPI.getRedHatUUID();
            }
            return REDHAT_UUID;
        });
    }
    Telemetry.getRedHatUUID = getRedHatUUID;
    function initializeTelemetryService(vscodeCommonsAPI) {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscodeCommonsAPI) {
                const extensionId = clientExtensionId;
                telemetryService = yield vscodeCommonsAPI.getTelemetryService(extensionId);
            }
        });
    }
    function ensureVSCodeCommonsActive() {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscodeCommonsAPI) {
                return;
            }
            const vscodeCommons = vscode.extensions.getExtension("redhat.vscode-commons");
            if (vscodeCommons && !vscodeCommons.isActive) {
                yield vscodeCommons.activate().then(function () {
                    console.log("vscode-redhat-telemetry: redhat.vscode-commons activated");
                }, function () {
                    console.log("vscode-redhat-telemetry: redhat.vscode-commons activation failed");
                });
            }
            vscodeCommonsAPI = vscodeCommons === null || vscodeCommons === void 0 ? void 0 : vscodeCommons.exports;
            initializeTelemetryService(vscodeCommonsAPI);
        });
    }
})(Telemetry = exports.Telemetry || (exports.Telemetry = {}));
//# sourceMappingURL=telemetry.js.map