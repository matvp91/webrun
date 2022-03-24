declare module "parse-error" {
  type ParsedErrorResult = {
    filename: string;
    line: number;
    row: number;
    message: string;
    type: string;
    stack: string;
    arguments: object[];
  };

  function parseError(error: Error): ParsedErrorResult;

  export = parseError;
}
