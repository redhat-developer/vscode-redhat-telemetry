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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVscodeCommonsStatus = void 0;
const vscode = __importStar(require("vscode"));
function checkVscodeCommonsStatus() {
    // To get an instance of "redhat.vscode-commons"
    const vscodeCommons = vscode.extensions.getExtension("redhat.vscode-commons");
    // To get segmentKey of client extension
    if (vscodeCommons === null || vscodeCommons === void 0 ? void 0 : vscodeCommons.isActive) {
        console.log("vscode-tele: redhat.vscode-commons is active");
        return true;
    }
    else {
        console.log("vscode-tele: redhat.vscode-commons is not active");
        return false;
    }
}
exports.checkVscodeCommonsStatus = checkVscodeCommonsStatus;
//# sourceMappingURL=checkStatus.js.map