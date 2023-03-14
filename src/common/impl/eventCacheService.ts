import { CacheService } from '../api/cacheService';

import {FileSystemStorageService } from '../vscode/fileSystemStorageService';

export class EventCacheService implements CacheService {

  private memCache = new Map<string, string>();

  constructor(private fileService: FileSystemStorageService){}

  async get(key: string): Promise<string | undefined> {
    if (this.memCache.has(key)) {
      return this.memCache.get(key);
    }
    const value = await this.fileService.readFromFile(`${key}.txt`);
    if (value) {
        this.memCache.set(key, value);
    }
    return value; 
  }
  
  async put(key: string, value: string): Promise<boolean> {
    this.memCache.set(key, value);
    await this.fileService.writeToFile(`${key}.txt`, value);
    return true;
  }

}