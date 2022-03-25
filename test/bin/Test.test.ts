import { TestSpec } from "../../src/bin/TestSpec";
import { Test, TestStatus } from "../../src/bin/Test";
import { Browser } from "../../src/bin/Browser";

jest.mock("../../src/bin/TestSpec");
jest.mock("../../src/bin/Browser");

describe("Test", () => {
  let t: Test;
  let browser: Browser;

  beforeEach(() => {
    browser = new Browser({
      port: 1111,
      browserName: "browserName",
      start: jest.fn(),
      stop: jest.fn(),
    });

    const spec = new TestSpec("", "");
    spec.run = jest.fn();

    t = new Test(spec);
  });

  test("should run spec with browser", async () => {
    await t.run(browser);
    expect(t.spec.run).toHaveBeenCalledWith(browser);
  });

  test("should emit status updates", async () => {
    const statuses: TestStatus[] = [];
    const onStatusUpdated = jest.fn(() => {
      statuses.push(t.status);
    });

    t.on("status-updated", onStatusUpdated);
    await t.run(browser);

    expect(onStatusUpdated).toHaveBeenCalledTimes(2);
    expect(statuses).toEqual([TestStatus.Running, TestStatus.Finished]);
  });

  test("should emit and set a failed test", async () => {
    const error = new Error("I fail this spec on purpose...");

    const statuses: TestStatus[] = [];
    const onStatusUpdated = jest.fn(() => {
      statuses.push(t.status);
    });

    t.on("status-updated", onStatusUpdated);

    jest.mocked(t.spec.run, true).mockImplementationOnce(() => {
      throw error;
    });
    await t.run(browser);

    expect(onStatusUpdated).toHaveBeenCalledTimes(2);
    expect(statuses).toEqual([TestStatus.Running, TestStatus.Failed]);
    expect(t.error).toBe(error);
  });
});
