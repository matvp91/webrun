import { createWatcher } from "../src/runtime";

describe("runtime", () => {
  describe("createWatcher", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test("should watch", async () => {
      let couldHaveChangedInput = "doNotMatchMe";

      const watcher = createWatcher<string, boolean>((input) => {
        return input === couldHaveChangedInput;
      });

      setTimeout(() => {
        couldHaveChangedInput = "matchMe";
      }, 500);

      const promise = watcher.wait("matchMe");
      jest.advanceTimersByTime(1000);

      expect(promise).resolves.toBe(true);
    });
  });
});
