## Usage data being collected by Red Hat Extensions
Only anonymous data is being collected by Red Hat extensions using `vscode-redhat-telemetry` facilities. The IP address of telemetry requests is not even stored on Red Hat servers.
All telemetry events are automatically sanitized to anonymize all paths (best effort) and references to the username.

### Common data
Telemetry requests may contain:

* a random anonymous user id (UUID v4), that is stored locally on `~/.redhat/anonymousId`
* the client name (VS Code, VSCodium, Eclipse Che...) and its version
* the type of client (Desktop vs Web)
* the name and version of the extension sending the event (eg. `fabric8-analytics.fabric8-analytics-vscode-extension`)
* whether the extension runs remotely or not (eg. in WSL)
* the OS name and version (and distribution name, in case of Linux)
* the user locale (eg. en_US)
* the user timezone
* the country id ( as determined by the current timezone)

Common events are reported:

* when extension is started
* when extension is shutdown
    - duration of the session

### Other extensions
Red Hat extensions' specific telemetry collection details can be found there:

* [Dependency Analytics](https://github.com/fabric8-analytics/fabric8-analytics-vscode-extension/blob/master/Telemetry.md)
* [OpenShift Connector](https://github.com/redhat-developer/vscode-openshift-tools/blob/master/USAGE_DATA.md)
* [Project Initializer](https://github.com/redhat-developer/vscode-project-initializer/blob/master/USAGE_DATA.md)
* [Quarkus](https://github.com/redhat-developer/vscode-quarkus/blob/master/USAGE_DATA.md)
* [Red Hat Authentication](https://github.com/redhat-developer/vscode-redhat-account/blob/main/USAGE_DATA.md)
* [Red Hat OpenShift Application Services](https://github.com/redhat-developer/vscode-rhoas/blob/main/USAGE_DATA.md)
* [Remote Server Protocol](https://github.com/redhat-developer/vscode-rsp-ui/blob/master/USAGE_DATA.md)
* [Tekton Pipelines](https://github.com/redhat-developer/vscode-tekton/blob/master/USAGE_DATA.md)
* [Tooling for Apache Camel K](https://github.com/camel-tooling/vscode-camelk/blob/main/USAGE_DATA.md)
* [Language Support for Apache Camel](https://github.com/camel-tooling/camel-lsp-client-vscode/blob/main/USAGE_DATA.md)
* [Debug Adapter for Apache Camel](https://github.com/camel-tooling/camel-dap-client-vscode/blob/main/USAGE_DATA.md)
* [Tools for MicroProfile](https://github.com/redhat-developer/vscode-microprofile/blob/master/USAGE_DATA.md)
* [XML](https://github.com/redhat-developer/vscode-xml/blob/master/USAGE_DATA.md)
* [YAML](https://github.com/redhat-developer/vscode-yaml/blob/main/USAGE_DATA.md)
