import { IdManager } from "../interfaces/idManager";
import { UUID } from "../utils/uuid";

/**
 * Service providing the Red Hat anonymous user id, read/stored from the `~/.redhat/anonymousId` file. 
 */
export class FileSystemIdManager implements IdManager {
    getRedHatUUID(): string {
        return UUID.getRedHatUUID();
    }
    
}