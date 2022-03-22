import chalk from "chalk";
import { Browser } from "./browser";

export enum TestStatus {
  IDLE,
  RUNNING,
  PASSED,
  FAILED,
}

type ImportedTest = {
  name: string;
  run: (browser: Browser) => Promise<void>;
};

/**
 * Creates a logger for a test in order to keep track of the status.
 */
function createLogger(test: Test) {
  const draft = console.draft();

  const changeStatus = (status: TestStatus) => {
    const statusText = {
      [TestStatus.IDLE]: "idle",
      [TestStatus.RUNNING]: "runs",
      [TestStatus.PASSED]: "pass",
      [TestStatus.FAILED]: "fail",
    }[status];

    let badge = ` ${statusText} `.toUpperCase();
    if (status === TestStatus.IDLE) {
      badge = chalk.bgYellow.whiteBright.bold(badge);
    } else if (status === TestStatus.RUNNING) {
      badge = chalk.bgBlue.whiteBright.bold(badge);
    } else if (status === TestStatus.PASSED) {
      badge = chalk.bgGreen.whiteBright.bold(badge);
    } else if (status === TestStatus.FAILED) {
      badge = chalk.bgRed.whiteBright.bold(badge);
    }

    draft(
      chalk.cyan(test.driverName),
      badge,
      test.name,
      chalk.dim(test.shortFilePath)
    );
  };

  return {
    changeStatus,
  };
}

export class Test {
  name: string;

  shortFilePath: string;

  driverName: string;

  status: TestStatus;

  error?: Error;

  private callback: (browser: Browser) => Promise<void>;

  private logger;

  constructor(
    importedTest: ImportedTest,
    shortFilePath: string,
    driverName: string
  ) {
    this.name = importedTest.name;
    this.shortFilePath = shortFilePath;
    this.driverName = driverName;
    this.callback = importedTest.run;

    this.logger = createLogger(this);

    this.status = TestStatus.IDLE;
    this.setStatus(this.status);
  }

  async run(browser: Browser) {
    // In case the test ran before...
    if (this.status !== TestStatus.IDLE) {
      throw new Error("Can only run tests that are in IDLE state.");
    }

    this.setStatus(TestStatus.RUNNING);

    try {
      await this.callback(browser);
      this.setStatus(TestStatus.PASSED);
    } catch (error) {
      this.error = error as Error;
      this.setStatus(TestStatus.FAILED);
    }
  }

  private setStatus(status: TestStatus) {
    this.status = status;
    this.logger.changeStatus(status);
  }
}

export function createTest(
  filePath: string,
  shortFilePath: string,
  driverName: string
) {
  const importedTest = require(filePath) as ImportedTest;
  return new Test(importedTest, shortFilePath, driverName);
}
