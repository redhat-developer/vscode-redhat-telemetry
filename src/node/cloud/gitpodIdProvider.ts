import { IdProvider } from "../../common/api/idProvider";
import env from "../../common/envVar";
import { FileSystemIdProvider } from "../fileSystemIdManager";
import { generateUUID } from "../../common/utils/uuid";
import { Logger } from "../../common/utils/logger";

let userId: string;

export class GitpodIdProvider implements IdProvider {

    constructor(private delegate: FileSystemIdProvider) { };

    async getRedHatUUID(): Promise<string> {
        if (!userId) {
            userId = await this.loadRedHatUUID();
        }
        return userId;
    }

    async loadRedHatUUID(): Promise<string> {
        try {
            const email = env.GITPOD_GIT_USER_EMAIL;
            if (email) {
                userId = generateUUID(email);
                const anonymousIdFile = this.delegate.getAnonymousIdFile();
                const existingId = this.delegate.readFile(anonymousIdFile);
                if (existingId !== userId) {
                    this.delegate.writeFile(anonymousIdFile, userId);
                }
                return userId;
            }
        } catch (error) {
            console.log('Failed to get user id from Gitpod', error);
        }
        //fall back to generating a random UUID
        Logger.info('fall back to generating a random UUID');
        return this.delegate.getRedHatUUID();
    }

}