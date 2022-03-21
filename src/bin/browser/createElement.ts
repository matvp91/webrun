import type { Browser } from "./createBrowser";

export type Element = {
  getSize: () => Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  click: () => Promise<void>;
};

export function createElement({
  browser,
  id,
}: {
  browser: Browser;
  id: string;
}): Element {
  const element: Element = {
    getSize: () => browser.client.getElementRect(id),

    click: async () => {
      const { x, y, width, height } = await element.getSize();
      const { pageX, pageY } = await browser.getPageCoords();

      const midXOffset = Math.floor(x - pageX + width / 2);
      const midYOffset = Math.floor(y - pageY + height / 2);

      await browser.performActions([
        {
          type: "pointer",
          id: "moveToSelectorAndClick",
          parameters: {
            pointerType: "mouse",
          },
          actions: [
            {
              type: "pointerMove",
              duration: 0,
              x: midXOffset,
              y: midYOffset,
            },
            {
              type: "pointerDown",
              button: 0,
            },
            {
              type: "pointerUp",
              button: 0,
            },
          ],
        },
      ]);
    },
  };

  return element;
}
