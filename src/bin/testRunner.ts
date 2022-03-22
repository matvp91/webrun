import * as path from "path";
import * as glob from "glob";
import chalk from "chalk";
import { createDriver } from "./createDriver";
import { createClient } from "./createClient";
import { createTest, TestStatus, Test } from "./createTest";
import { createBrowser } from "./browser";
import { findErrorLineNumbers, indentMultiLines } from "./helpers";

/**
 * Filters all failed tests and prints the error to stdout.
 */
function reportFailedTests(tests: Test[]) {
  const failedTests = tests.filter((test) => test.status === TestStatus.FAILED);
  if (!failedTests.length) {
    return;
  }

  console.log(chalk.redBright(`${failedTests.length} test(s) failed.`));
  console.log("");

  failedTests.forEach((test) => {
    if (!test.error) {
      return;
    }

    const lineNumbers = findErrorLineNumbers(test.error, "Test.run");
    console.log(
      chalk.underline(test.driverName),
      `${chalk.dim(test.shortFilePath)}${lineNumbers}`
    );

    console.log("");
    console.log(indentMultiLines(test.error.toString()));
    console.log("");
  });
}

/**
 * Runs a set of tests for the given path, hosted by a local webserver.
 * Must have a valid driver name in order to run.
 */
export async function runTests({
  driverName,
  path: basePath,
  url,
}: {
  driverName: string;
  path: string;
  url: string;
}): Promise<void> {
  const driver = await createDriver(driverName);

  await driver.start();

  const testsPath = path.join(basePath, "**/*.test.js");
  const filePaths = glob.sync(testsPath);

  console.log("");

  // Map each test into a {Test} reprensentation. Once we collected all tests
  // we can start running them later.
  const tests = filePaths.map((filePath) => {
    const shortFilePath = filePath.replace(path.join(basePath, "../"), "");
    return createTest(filePath, shortFilePath, driverName);
  });

  console.log("");

  for (let test of tests) {
    const client = await createClient(driver);
    await client.navigateTo(url);

    const browser = createBrowser(client);

    await test.run(browser);

    await client.deleteSession();
  }

  driver.stop();

  reportFailedTests(tests);
}
