import * as path from "path";
import * as fs from "fs";
import merge from "deepmerge";
import { Server } from "./Server";
import { Runner } from "./Runner";
import { registerGlobals } from "./registerGlobals";
import { collectTestSpecs } from "./helpers";
import { bindReporterToRunners } from "./reporter";

export type Config = {
  path: string;
  browserNames: string[];
  devServer: {
    port: number;
    path: string;
  };
};

const configName = "webrun.config.js";

function getConfig(basePath: string): Config {
  let config: Config = {
    path: "./",
    browserNames: [],
    devServer: {
      port: 3000,
      path: "./public",
    },
  };

  const filePath = path.join(basePath, configName);
  if (fs.existsSync(filePath)) {
    config = merge(config, require(filePath));
  }

  return config;
}

/**
 * Entry point, to be executed by `bin/webrun.js`.
 *
 * ```json
 * {
 *   "scripts": {
 *     "test": "webrun ./example"
 *   }
 * }
 * ```
 */
export async function entry(): Promise<void> {
  registerGlobals();

  const baseFolderName = process.argv[2];

  const basePath = path.join(process.cwd(), baseFolderName);
  if (!fs.existsSync(basePath)) {
    console.log(`Folder "${baseFolderName}" cannot be found.`);
    return;
  }

  const config = getConfig(basePath);

  const server = new Server(
    config.devServer.port,
    path.join(baseFolderName, config.devServer.path)
  );

  await server.start();

  const testSpecs = collectTestSpecs(path.join(basePath, config.path));

  const runners = config.browserNames.map(
    (browserName) => new Runner(browserName, testSpecs)
  );

  bindReporterToRunners(runners);

  for (let runner of runners) {
    await runner.run();
  }

  await server.stop();
}
