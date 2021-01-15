interface TelemetryEvent {
    type?: string;
    name: string;
    properties?: any;
    measures?: any;
    traits?: any;
}
export declare namespace Telemetry {
    function send(event: TelemetryEvent): void;
    function setExtensionName(extensionName: string): void;
}
export {};
//# sourceMappingURL=telemetry.d.ts.map