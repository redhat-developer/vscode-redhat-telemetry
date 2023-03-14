import { extensions } from 'vscode';
import { IdProvider } from '../../common/api/idProvider';
import { Logger } from '../../common/utils/logger';

let userId: string;
export class CheIdProvider implements IdProvider {

    constructor(private delegate: IdProvider) { };

    async getRedHatUUID(): Promise<string> {
        if (!userId) {
            userId = await this.loadRedHatUUID();
        }
        return userId;
    }

    async loadRedHatUUID(): Promise<string> {
        try {
            Logger.info('Reading user id from @eclipse-che.ext-plugin');
            const che = extensions.getExtension('@eclipse-che.ext-plugin');
            if (che) {
                Logger.info('Found Che API');
                // grab user
                const user = await che.exports.user?.getCurrentUser();

                if (user.id) {
                    Logger.info(`Found Che user id ${user.id}`);
                    return user.id;
                }
                Logger.info('No Che user id');

            } else {
                Logger.info('No @eclipse-che.ext-plugin');
            }
        } catch (error) {
            console.log('Failed to get user id from Che', error);
        }
        //fall back to generating a random UUID
        Logger.info('fall back to generating a random UUID');
        return this.delegate.getRedHatUUID();
    }
}