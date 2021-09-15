import { CacheService } from "../interfaces/cacheService";
import * as fs from 'fs';
import path from "path";

export class FileSystemCacheService implements CacheService {
    
    private memCache = new Map<string, string>();
    private storagePath: string;

    constructor(storagePath: string) {
        this.storagePath = storagePath;
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath, { recursive: true });
        }
    }

    async get(key: string): Promise<string | undefined> {
        if (this.memCache.has(key)) {
            return Promise.resolve(this.memCache.get(key));
        }
        const value_1 = await this.readFromFile(key);
        if (value_1) {
            this.memCache.set(key, value_1);
        }
        return value_1;
    }

    async put(key: string, value: string): Promise<boolean> {
        this.memCache.set(key, value);
        await this.writeToFile(key, value);
        return true;
    }

    private readFromFile(key: string): Promise<string | undefined> {
        const filePath = path.resolve(this.storagePath, `${key}.txt`);
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(filePath)) {
                resolve(undefined);
                return;
            }
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    resolve(undefined);
                    return;
                }
                resolve(data);
            });
        });
    }

    private writeToFile(key: string, value: string): Promise<boolean> {
        const filePath = path.resolve(this.storagePath, `${key}.txt`);
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, value, (err) => {
                if (err) {
                    resolve(false);
                }
                resolve(true);
            });
        });
    }

}