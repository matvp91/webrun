import { timeout as promiseTimeout } from "promise-timeout";

export function createWatcher<TArgument, TResult>(
  fn: (arg?: TArgument) => TResult,
  { timeout = 10 * 1000 } = {}
) {
  const wait = (arg?: TArgument) => {
    const check = async (): Promise<TResult> => {
      const result = await fn(arg);
      if (!result) {
        return check();
      }
      return result;
    };
    return promiseTimeout(check(), timeout);
  };

  return {
    wait,
  };
}
