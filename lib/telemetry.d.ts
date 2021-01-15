interface TelemetryEvent {
    type?: string;
    name: string;
    properties?: any;
    measures?: any;
    traits?: any;
}
export declare namespace Telemetry {
    function send(event: TelemetryEvent): Promise<void>;
    function setExtensionName(extensionName: string): void;
    function getRedHatUUID(): Promise<string>;
}
export {};
//# sourceMappingURL=telemetry.d.ts.map