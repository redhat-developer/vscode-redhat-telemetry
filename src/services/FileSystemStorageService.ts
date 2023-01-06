import * as fs from "fs";
import path from "path";

export class FileSystemStorageService {
  //implements StorageService {

  private storagePath: string;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  public readFromFile(fileName: string): Promise<string | undefined> {
    const filePath = path.resolve(this.storagePath, fileName);
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        resolve(undefined);
        return;
      }
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          resolve(undefined);
          return;
        }
        resolve(data);
      });
    });
  }

  public writeToFile(filename: string, content: string): Promise<boolean> {
    const filePath = path.resolve(this.storagePath, filename);
    return new Promise((resolve, _reject) => {
      fs.writeFile(filePath, content, (err) => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }
}
