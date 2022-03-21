import * as chromedriver from "chromedriver";
import { spawn, ChildProcess } from "child_process";
import findProcess from "find-process";
import { createWatcher } from "../runtime";

export type Driver = {
  browserName: string;
  port: number;
  start: () => Promise<void>;
  stop: () => void;
};

/**
 * Create a driver.
 * @param name - Canonical driver name. See support table below.
 *
 * - chrome - Uses `node-chromedriver`.
 * - safari - Uses the locally installed `usr/bin/safardriver`.
 */
export async function createDriver(name: string): Promise<Driver> {
  if (name === "chrome") {
    const port = 4444;

    const start = async () => {
      await chromedriver.start([`--port=${port}`], true);
    };

    const stop = () => chromedriver.stop();

    return {
      browserName: "chrome",
      port,
      start,
      stop,
    };
  }

  if (name === "safari") {
    const port = 4445;
    let child: ChildProcess | null = null;

    const start = async () => {
      child = spawn("/usr/bin/safaridriver", [`--port=${port}`]);
      await createWatcher<undefined, Promise<boolean>>(
        async () => !!(await findProcess("name", "safaridriver")).length
      ).wait();
    };

    const stop = () => {
      child?.kill();
      child = null;
    };

    return {
      browserName: "safari",
      port,
      start,
      stop,
    };
  }

  throw new Error(`No driver found with name "${name}"`);
}
