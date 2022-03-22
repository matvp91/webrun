export function findErrorLineNumbers(
  error: Error,
  name: string
): string | null {
  if (!error.stack) {
    return null;
  }
  let lineNumbers = null;

  const stackFrame = error.stack
    ?.split("\n")
    .find((line) => line.includes(name));

  const arr = stackFrame?.match(/\(([^)]+)\)/)?.[1]?.split(":");
  arr?.shift();

  if (arr?.length === 2) {
    lineNumbers = `:${arr.join(":")}`;
  }
  return lineNumbers;
}

export function indentMultiLines(lines: string): string {
  const arr = lines.split("\n");
  for (let idx in arr) {
    arr[idx] = `  ${arr[idx]}`;
  }
  return arr.join("\n");
}
