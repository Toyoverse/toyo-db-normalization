import * as path from "path";
import * as fs from "fs";

export class MetadataRepository {
  private folder: string;
  constructor() {
    this.folder = process.env.LOCAL_FILES_FOLDER || "./files";
  }

  async save(filename: string, metadata: object) {
    if (!fs.existsSync(this.folder)) {
      fs.mkdirSync(this.folder);
    }

    const filePath = path.join(this.folder, filename + ".json");
    const json = JSON.stringify(metadata, null, 2);
    fs.writeFileSync(filePath, json, "utf-8");
  }
}
