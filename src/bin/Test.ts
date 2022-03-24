import { EventEmitter } from "events";
import { TestSpec } from "./TestSpec";
import { Browser } from "./Browser";

export enum TestStatus {
  Idle,
  Running,
  Finished,
  Failed,
}

export class Test extends EventEmitter {
  spec: TestSpec;

  error?: Error;

  status: TestStatus = TestStatus.Idle;

  constructor(spec: TestSpec) {
    super();
    this.spec = spec;
  }

  get name() {
    return this.spec.name;
  }

  get shortPath() {
    return this.spec.shortPath;
  }

  async run(browser: Browser) {
    this.status = TestStatus.Running;
    this.emit("status-updated");

    try {
      await this.spec.run(browser);
      this.status = TestStatus.Finished;
      this.emit("status-updated");
    } catch (error) {
      if (error instanceof Error) {
        this.error = error;
      }
      this.status = TestStatus.Failed;
      this.emit("status-updated");
    }
  }
}
