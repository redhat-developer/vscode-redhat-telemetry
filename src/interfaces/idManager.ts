/**
 * Service providing the Red Hat anonymous user id. 
 */
export interface IdManager {
    /**
     * Returns the Red Hat' anonymous user id.
     */
    getRedHatUUID():Promise<string>;
}