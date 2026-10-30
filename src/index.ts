//For legacy compatibility purposes, expose the node bits as default API

import type { IdProvider, RedHatService, TelemetryEvent, TelemetryOptions, TelemetryService } from './node';
import { getRedHatService } from './node';

export type { IdProvider, RedHatService, TelemetryEvent, TelemetryOptions, TelemetryService };
export { getRedHatService };
