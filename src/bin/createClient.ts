import WebDriver, { Client as WebDriverClient } from "webdriver";
import type { Driver } from "./createDriver";

export type Client = WebDriverClient;

export async function createClient(driver: Driver): Promise<Client> {
  const client = await WebDriver.newSession({
    logLevel: "error",
    port: driver.port,
    capabilities: {
      browserName: driver.browserName,
    },
  });
  return client;
}
