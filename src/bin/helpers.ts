import * as glob from "glob";
import * as path from "path";
import { EventEmitter } from "events";
import { TestSpec } from "./TestSpec";

export function collectTestSpecs(basePath: string): TestSpec[] {
  const files = glob.sync(path.join(basePath, "**/*.test.js"));
  return files.map((filePath) => new TestSpec(filePath, basePath));
}

export function createBindListeners() {
  let listeners: {
    target: EventEmitter;
    name: string;
    callback: () => void;
  }[] = [];

  return {
    add: (
      target: EventEmitter,
      names: string | string[],
      callback: () => void
    ) => {
      if (!Array.isArray(names)) {
        names = [names];
      }
      names.forEach((name) => {
        target.on(name, callback);
        listeners.push({
          target,
          name,
          callback,
        });
      });
    },
    removeAll: () => {
      listeners.forEach(({ target, name, callback }) => {
        target.off(name, callback);
      });
      listeners = [];
    },
  };
}
