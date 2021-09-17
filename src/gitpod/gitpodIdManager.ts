import { IdManager } from "..";
import { UUID } from "../utils/uuid";

let userId: string;

export class GitpodIdManager implements IdManager {
    async getRedHatUUID(): Promise<string> {
        if (!userId) {
            userId = this.loadRedHatUUID();
        }
        return userId;
    }

    loadRedHatUUID(redhatDir?: string): string {
        try {
            const email = process.env.GITPOD_GIT_USER_EMAIL;
            if (email) {
                userId = UUID.generateUUID(email);
                const anonymousIdFile = UUID.getAnonymousIdFile(redhatDir);
                const existingId = UUID.readFile(anonymousIdFile);
                if (existingId !== userId) {
                    UUID.writeFile(anonymousIdFile, userId);
                }
                return userId;
            }
        } catch (error) {
            console.log('Failed to get user id from Gitpod', error);
        }
        //fall back to generating a random UUID
        console.log('fall back to generating a random UUID');
        return UUID.getRedHatUUID();
    }

}