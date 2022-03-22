import chalk from "chalk";
import { Browser } from "./browser";

type ImportedTest = {
  name: string;
  run: (browser: Browser) => Promise<void>;
};

export enum TestStatus {
  IDLE,
  RUNNING,
  PASSED,
  FAILED,
}

type TestLogger = {
  changeStatus: (status: TestStatus) => void;
};

function createLogger({
  name,
  shortFilePath,
}: {
  name: string;
  shortFilePath: string;
}): TestLogger {
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

    draft(badge, name, chalk.dim(shortFilePath));
  };

  return {
    changeStatus,
  };
}

class Test {
  name: string;

  shortFilePath: string;

  status: TestStatus;

  error?: Error;

  private callback: (browser: Browser) => Promise<void>;

  private logger;

  constructor(shortFilePath: string, importedTest: ImportedTest) {
    this.name = importedTest.name;
    this.shortFilePath = shortFilePath;
    this.callback = importedTest.run;

    this.logger = createLogger({
      name: this.name,
      shortFilePath,
    });

    this.status = TestStatus.IDLE;
    this.setStatus(this.status);
  }

  async run(browser: Browser) {
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

export function createTest(filePath: string, shortFilePath: string) {
  const importedTest = require(filePath) as ImportedTest;
  return new Test(shortFilePath, importedTest);
}
