/**
 * This is where it all starts.
 * @module
 */

import * as path from "path";
import * as fs from "fs";
import merge from "deepmerge";
import * as http from "http";
import { createHttpTerminator } from "http-terminator";
import serveHandler from "serve-handler";
import { registerGlobals } from "./registerGlobals";
import { runTests } from "./testRunner";

const configName = "webrun.config.js";

export type Config = {
  path: string;
  devServer: {
    path: string;
  };
};

export type Server = {
  stop: () => Promise<void>;
};

function getConfig(basePath: string): Config {
  let config: Config = {
    path: "./",
    devServer: {
      path: "./public",
    },
  };

  const filePath = path.join(basePath, configName);
  if (fs.existsSync(filePath)) {
    config = merge(config, require(filePath));
  }

  return config;
}

function createServer({ redirectTo }: { redirectTo: string }): Promise<Server> {
  const server = http.createServer((request, response) =>
    serveHandler(request, response, {
      redirects: [
        {
          type: 0,
          source: "/",
          destination: redirectTo,
        },
      ],
    })
  );

  const terminator = createHttpTerminator({ server });

  return new Promise((resolve) => {
    server.listen(3000, () => {
      resolve({
        stop: () => terminator.terminate(),
      });
    });
  });
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

  const server = await createServer({
    redirectTo: path.join(baseFolderName, config.devServer.path),
  });

  await runTests({
    driverName: "chrome",
    path: path.join(basePath, config.path),
  });

  await server.stop();
}
