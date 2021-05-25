import { extensions } from 'vscode';
import { IdManager } from '../interfaces/idManager';
import { UUID } from '../utils/uuid';

let userId: string;
export class CheIdManager implements IdManager {
    async getRedHatUUID(): Promise<string> {
        if (!userId) {
            userId = await this.loadRedHatUUID();
        }
        return userId;
    }

    async loadRedHatUUID(): Promise<string> {
        try {
            console.log('Reading user id from @eclipse-che.ext-plugin');
            const che = extensions.getExtension('@eclipse-che.ext-plugin');
            if (che) {
                console.log('Found Che API');
                // grab user
                const user = await che.exports.user?.getCurrentUser();

                if (user.id) {
                    console.log(`Found Che user id ${user.id}`);
                    return user.id;
                }
                console.log('No Che user id');

            } else {
                console.log('No @eclipse-che.ext-plugin');
            }
        } catch (error) {
            console.log('Failed to get user id from Che', error);
        }
        //fall back to generating a random UUID
        console.log('fall back to generating a random UUID');
        return UUID.getRedHatUUID();
    }
}