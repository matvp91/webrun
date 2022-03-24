import chalk from "chalk";
import logUpdate from "log-update";
import parseError from "parse-error";
import { createBindListeners } from "./helpers";
import { Runner } from "./Runner";
import { TestStatus } from "./Test";

function multiLineIndention(lines: string, indention: number = 4) {
  const indent = new Array(indention).join(" ");
  return lines
    .split("\n")
    .map((line) => `${indent}${line}`)
    .join("\n");
}

export function bindReporterToRunners(runners: Runner[]) {
  const update = () => {
    let text = "";

    let hasAtleastOneError = false;

    for (let runner of runners) {
      for (let test of runner.tests) {
        if (test.error) {
          hasAtleastOneError = true;

          const parsedError = parseError(test.error);
          const lineNumbers = `:${parsedError.row}:${parsedError.line}`;
          text += `${chalk.red("FAIL")} ${chalk.bold(runner.browserName)} ${
            test.name
          } ${chalk.dim(test.shortPath)}${lineNumbers}\n`;
          text += "\n";
          text += `${multiLineIndention(test.error.toString())}\n`;
        }
      }
    }

    if (hasAtleastOneError) {
      text += "\n";
    }

    for (let runner of runners) {
      text += `${chalk.bold(runner.browserName)}\n`;
      text += "\n";
      for (let test of runner.tests) {
        let statusBadge = chalk.bgYellow.whiteBright.bold(" IDLE ");
        if (test.status === TestStatus.Running) {
          statusBadge = chalk.bgBlue.whiteBright.bold(" RUNS ");
        } else if (test.status === TestStatus.Failed) {
          statusBadge = chalk.bgRed.whiteBright.bold(" FAIL ");
        } else if (test.status === TestStatus.Finished) {
          statusBadge = chalk.bgGreen.whiteBright.bold(" PASS ");
        }
        text += `  ${statusBadge} ${test.name} ${chalk.dim(test.shortPath)}\n`;
      }
    }

    logUpdate(text);
  };

  const listeners = createBindListeners();
  for (let runner of runners) {
    listeners.add(runner, ["started", "stopped"], update);

    runner.tests.forEach((test) => {
      listeners.add(test, ["status-updated"], update);
    });
  }
}
