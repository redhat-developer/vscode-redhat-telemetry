import { Uri } from "vscode";
import { exists, mkdir, readFile, writeFile } from './fsUtils';

export class FileSystemStorageService {

    private storagePath: Uri;

    constructor(storagePath: Uri) {
        this.storagePath = storagePath;
    }

    public async readFromFile(fileName: string): Promise<string | undefined> {
        try {
            const filePath = Uri.joinPath(this.storagePath, fileName);
            //Need to await here so if file doesn't exist, it's caught by the catch clause 
            //and we return undefined, instead of a Promise that will fail later
            return await readFile(filePath);
        } catch (e) {
            return undefined;
        }
    }

    public async writeToFile(filename: string, content: string): Promise<void> {
        await this.ensureStoragePathExists();
        const filePath = Uri.joinPath(this.storagePath, filename);
        return writeFile(filePath, content);
    }

    private async ensureStoragePathExists(): Promise<void> {
        if (!(await exists(this.storagePath))) {
            await mkdir(this.storagePath);
        }
    }

}