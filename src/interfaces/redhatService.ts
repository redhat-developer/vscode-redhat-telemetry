import { IdManager, TelemetryService } from "..";

/**
 * Umbrella for Red Hat services.
 */
 export interface RedHatService {
     /**
      * Returns a Telemetry service
      */
     getTelemetryService():Promise<TelemetryService>;
     /**
      * Returns the Red Hat Id manager
      */
     getIdManager():Promise<IdManager>;
}