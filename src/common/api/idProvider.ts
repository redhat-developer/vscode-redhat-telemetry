/**
 * Service providing the Red Hat anonymous user id. 
 */
export interface IdProvider {
    /**
     * Returns the Red Hat' anonymous user id.
     */
    getRedHatUUID():Promise<string>;
}