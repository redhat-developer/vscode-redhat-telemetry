import { CacheService } from "../interfaces/cacheService";
import { FileSystemStorageService } from "./FileSystemStorageService";

export class FileSystemCacheService
  extends FileSystemStorageService
  implements CacheService
{
  private memCache = new Map<string, string>();

  constructor(storagePath: string) {
    super(storagePath);
  }

  async get(key: string): Promise<string | undefined> {
    if (this.memCache.has(key)) {
      return Promise.resolve(this.memCache.get(key));
    }
    const value = await this.readFromFile(`${key}.txt`);
    if (value) {
      this.memCache.set(key, value);
    }
    return value;
  }

  async put(key: string, value: string): Promise<boolean> {
    this.memCache.set(key, value);
    await this.writeToFile(`${key}.txt`, value);
    return true;
  }
}
