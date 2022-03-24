import * as path from "path";
import { Browser } from "./Browser";

export class TestSpec {
  name: string;

  run: (browser: Browser) => void;

  shortPath: string;

  constructor(filePath: string, basePath: string) {
    const task = require(filePath) as {
      name: string;
      run: (browser: Browser) => void;
    };

    this.name = task.name;
    this.run = task.run;

    this.shortPath = filePath.replace(path.join(basePath, "../"), "");
  }
}
