import * as path from "path";
import * as glob from "glob";
import chalk from "chalk";
import { createDriver } from "./createDriver";
import { createClient } from "./createClient";
import { createTest, TestStatus } from "./createTest";
import { createBrowser } from "./browser";

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

  console.log("");

  const tests = filePaths.map((filePath) => {
    const shortFilePath = filePath.replace(path.join(basePath, "../"), "");
    return createTest(filePath, shortFilePath);
  });

  console.log("");

  const failedTests = [];

  for (let test of tests) {
    const client = await createClient(driver);
    await client.navigateTo("http://localhost:3000");

    const browser = createBrowser(client);

    await test.run(browser);

    await client.deleteSession();

    if (test.status === TestStatus.FAILED) {
      failedTests.push(test);
    }
  }

  driver.stop();

  if (failedTests.length) {
    console.log(
      chalk.redBright(`Looks like ${failedTests.length} test(s) failed.`)
    );
    console.log("");

    failedTests.forEach((test) => {
      let lineNumbers = "";
      const stackFrame = test.error?.stack
        ?.split("\n")
        .find((line) => line.includes("Test.run"));
      const arr = stackFrame?.match(/\(([^)]+)\)/)?.[1]?.split(":");
      arr?.shift();
      if (arr?.length === 2) {
        lineNumbers = `:${arr.join(":")}`;
      }

      console.log(test.name, `${chalk.dim(test.shortFilePath)}${lineNumbers}`);

      if (test.error) {
        console.log("");

        let lines = test.error.toString().split("\n");
        for (let idx in lines) {
          lines[idx] = `  ${lines[idx]}`;
        }
        console.log(lines.join("\n"));
      }
    });
  }

  console.log("");
}
