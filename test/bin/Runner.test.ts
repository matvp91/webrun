import { Runner } from "../../src/bin/Runner";
import { TestSpec } from "../../src/bin/TestSpec";
import { createDriver } from "../../src/bin/driver/createDriver";
import { Test } from "../../src/bin/Test";

TestSpec.prototype.run = jest.fn();

Test.prototype.run = jest.fn();

jest.mock("../../src/bin/TestSpec");

jest.mock("../../src/bin/driver/createDriver", () => ({
  ...jest.requireActual<object>("../../src/bin/driver/createDriver"),
  createDriver: jest.fn(() => ({
    start: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock("../../src/bin/Browser");

describe("Runner", () => {
  let runner: Runner;

  beforeEach(() => {
    runner = new Runner("browserName", [
      new TestSpec("", ""),
      new TestSpec("", ""),
    ]);
  });

  test("should create, start, stop driver", async () => {
    await runner.run();

    const mockCreateDriver = jest.mocked(createDriver, true);

    expect(mockCreateDriver).toHaveBeenCalled();

    const result = mockCreateDriver.mock.results[0].value;
    expect(result.start).toHaveBeenCalled();
    expect(result.stop).toHaveBeenCalled();
  });

  test("should run a test for each spec", async () => {
    await runner.run();

    expect(runner.tests[0].run).toHaveBeenCalled();
    expect(runner.tests[1].run).toHaveBeenCalled();
  });

  test("should emit runner events", async () => {
    const onStarted = jest.fn();
    runner.on("started", onStarted);

    const onStopped = jest.fn();
    runner.on("stopped", onStopped);

    await runner.run();

    expect(onStarted).toHaveBeenCalled();
    expect(onStopped).toHaveBeenCalled();
  });
});
