import expect from "expect";
import type { Expect, MatcherState } from "expect/build/types";

declare global {
  var expect: Expect<MatcherState>;
}

/**
 * Registers the following variables are global, can then
 * be used in the test files without explicit importing.
 * - expect - "Jest Matchers expect"
 */
export function registerGlobals() {
  global.expect = expect;
}
