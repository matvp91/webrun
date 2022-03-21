import type { Client } from "../createClient";
import { createElement, Element } from "./createElement";

export type Browser = {
  client: Client;
  sleep: (ms: number) => Promise<void>;
  runFunction: <TPayload, TResult>(
    fn: Function,
    payload?: TPayload
  ) => Promise<TResult>;
  getPageCoords: () => Promise<{
    pageX: number;
    pageY: number;
  }>;
  findElement: (selector: string) => Promise<Element>;
  performActions: (actions: object[]) => Promise<void>;
};

const ELEMENT_ID = "element-6066-11e4-a52e-4f735466cecf";

export function createBrowser(client: Client): Browser {
  const browser: Browser = {
    client,

    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

    runFunction: (fn, payload) => {
      const wrapper = `return (${fn}).apply(null, arguments)`;
      return client.executeScript(wrapper, [payload as {}]);
    },

    getPageCoords: () =>
      browser.runFunction<
        undefined,
        {
          pageX: number;
          pageY: number;
        }
      >(() => ({
        pageX: window.pageXOffset,
        pageY: window.pageYOffset,
      })),

    findElement: async (selector) => {
      const element = await client.findElement("css selector", selector);
      return createElement({
        browser,
        id: element[ELEMENT_ID],
      });
    },

    performActions: async (actions) => {
      await client.performActions(actions);
      await client.releaseActions();
    },
  };

  return browser;
}
