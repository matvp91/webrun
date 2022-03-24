import type { Driver } from "../types";
import { Chromedriver } from "./Chromedriver";

const BrowserNames = {
  Chrome: "chrome",
  Safari: "safari",
};

export function createDriver(browserName: string): Driver | null {
  if (browserName === BrowserNames.Chrome) {
    return new Chromedriver();
  }

  return null;
}
