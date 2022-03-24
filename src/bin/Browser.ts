import WebDriver, { Client } from "webdriver";
import type { Driver } from "./types";

import { Element } from "./Element";

export class Browser {
  client?: Client;

  private driver: Driver;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  async start() {
    this.client = await WebDriver.newSession({
      logLevel: "error",
      port: this.driver.port,
      capabilities: {
        browserName: this.driver.browserName,
      },
    });

    await this.client.navigateTo("http://localhost:3000");
  }

  async stop() {
    await this.client?.deleteSession();
  }

  async sleep(time: number) {
    await new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }

  runFunction<TResult>(
    fn: Function,
    payload?: string | number | boolean | object
  ): Promise<TResult> | null {
    if (!this.client) {
      return null;
    }
    return this.client.executeScript(`return (${fn}).apply(null, arguments)`, [
      payload,
    ]);
  }

  getPageOffsets() {
    return this.runFunction<{
      pageX: number;
      pageY: number;
    }>(() => ({
      pageX: window.pageXOffset,
      pageY: window.pageYOffset,
    }));
  }

  async performActions(actions: object[]) {
    if (!this.client) {
      return;
    }
    await this.client.performActions(actions);
    await this.client.releaseActions();
  }

  async findElement(selector: string) {
    if (!this.client) {
      return null;
    }

    const WebDriverElementId = "element-6066-11e4-a52e-4f735466cecf";
    const SelectorType = "css selector";
    const element = await this.client.findElement(SelectorType, selector);

    return new Element(this, element[WebDriverElementId]);
  }
}
