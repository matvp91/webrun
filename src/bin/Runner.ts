import { EventEmitter } from "events";
import { TestSpec } from "./TestSpec";
import { Test } from "./Test";
import { Browser } from "./Browser";
import { createDriver } from "./driver/createDriver";

export class Runner extends EventEmitter {
  browserName: string;

  tests: Test[];

  constructor(browserName: string, testSpecs: TestSpec[]) {
    super();

    this.browserName = browserName;

    this.tests = testSpecs.map((spec) => new Test(spec));
  }

  async run() {
    const driver = createDriver(this.browserName);
    if (!driver) {
      return;
    }

    await driver.start();

    this.emit("started");

    const browser = new Browser(driver);

    for (let test of this.tests) {
      await browser.start();
      await test.run(browser);
      await browser.stop();
    }

    driver.stop();

    this.emit("stopped");
  }
}
