import * as path from "path";
import * as glob from "glob";
import chalk from "chalk";
import { createDriver } from "./createDriver";
import { createClient } from "./createClient";
import { createTest, TestStatus } from "./createTest";
import { createBrowser } from "./browser";

function findErrorLineNumbers(error?: Error) {
  if (!error?.stack) {
    return null;
  }
  let lineNumbers = null;

  const stackFrame = error.stack
    ?.split("\n")
    .find((line) => line.includes("Test.run"));

  const arr = stackFrame?.match(/\(([^)]+)\)/)?.[1]?.split(":");
  arr?.shift();

  if (arr?.length === 2) {
    lineNumbers = `:${arr.join(":")}`;
  }
  return lineNumbers;
}

function indentMultiLines(lines: string) {
  const arr = lines.split("\n");
  for (let idx in arr) {
    arr[idx] = `  ${arr[idx]}`;
  }
  return arr.join("\n");
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
      const lineNumbers = findErrorLineNumbers(test.error) ?? "";
      console.log(test.name, `${chalk.dim(test.shortFilePath)}${lineNumbers}`);

      if (test.error) {
        console.log("");
        console.log(indentMultiLines(test.error.toString()));
      }

      console.log("");
    });
  }
}
