import * as chromedriver from "chromedriver";
import { spawn, ChildProcess } from "child_process";
import * as tcpPortUsed from "tcp-port-used";
import type { Driver } from "../types";

export class Chromedriver implements Driver {
  browserName = "chrome";

  port = 4444;

  private child: ChildProcess | null = null;

  async start() {
    this.child = spawn(chromedriver.path, [`--port=${this.port}`]);
    await tcpPortUsed.waitUntilUsed(this.port, 100, 10000);
  }

  stop() {
    this.child?.kill();
    this.child = null;
  }
}
