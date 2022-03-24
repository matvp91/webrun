import type { Driver } from "../types";
import { Chromedriver } from "./Chromedriver";
import { Safaridriver } from "./Safaridriver";

const BrowserNames = {
  Chrome: "chrome",
  Safari: "safari",
};

export function createDriver(browserName: string): Driver | null {
  if (browserName === BrowserNames.Chrome) {
    return new Chromedriver();
  }
  if (browserName === BrowserNames.Safari) {
    return new Safaridriver();
  }

  return null;
}
