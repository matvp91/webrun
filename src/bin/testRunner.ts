import * as path from "path";
import * as glob from "glob";
import { createDriver, Driver } from "./createDriver";
import { createClient, Client } from "./createClient";
import { createBrowser, Browser } from "./browser";

type TestDefinition = {
  name: string;
  run: (browser: Browser) => Promise<void>;
};

function createTest({
  driver,
  filePath,
}: {
  driver: Driver;
  filePath: string;
}): {
  startSession: () => Promise<void>;
  run: () => Promise<void>;
  stopSession: () => Promise<void>;
} {
  let client: Client | null = null;
  let definition: TestDefinition | null = null;
  let browser: Browser | null = null;

  const startSession = async () => {
    definition = require(filePath);

    client = await createClient(driver);
    await client.navigateTo("http://localhost:3000");

    browser = createBrowser(client);
  };

  const run = async () => {
    if (!definition || !browser) {
      return;
    }
    const { name, run } = definition;
    console.log(`Starting test: ${name}`);
    await run(browser);
    console.log(`Finished test: ${name}`);
  };

  const stopSession = async () => {
    await client?.deleteSession();
    client = null;
  };

  return {
    startSession,
    run,
    stopSession,
  };
}

export async function runTests({
  driverName,
  path: basePath,
}: {
  driverName: string;
  path: string;
}): Promise<void> {
  const driver = await createDriver(driverName);

  await driver.start();

  const testsPath = path.join(basePath, "**/*.test.js");
  const filePaths = glob.sync(testsPath);

  for (let filePath of filePaths) {
    const test = createTest({
      driver,
      filePath,
    });

    try {
      await test.startSession();

      await test.run();
    } catch (error) {
      console.error("An error occured when running the test");
    } finally {
      await test.stopSession();
    }
  }

  driver.stop();
}
