import { Browser } from "./Browser";

export class Element {
  private browser: Browser;

  private id: string;

  constructor(browser: Browser, id: string) {
    this.browser = browser;
    this.id = id;
  }

  async getSize() {
    const { client } = this.browser;
    if (!client) {
      return null;
    }
    return client.getElementRect(this.id);
  }

  async click() {
    const size = await this.getSize();
    const pageOffsets = await this.browser.getPageOffsets();

    if (!size || !pageOffsets) {
      return null;
    }

    const midXOffset = Math.floor(size.x - pageOffsets.pageX + size.width / 2);
    const midYOffset = Math.floor(size.y - pageOffsets.pageY + size.height / 2);

    await this.browser.performActions([
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
  }
}
