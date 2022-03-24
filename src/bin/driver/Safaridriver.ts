import { spawn, ChildProcess } from "child_process";
import * as tcpPortUsed from "tcp-port-used";
import type { Driver } from "../types";

export class Safaridriver implements Driver {
  browserName = "safari";

  port = 4445;

  private child: ChildProcess | null = null;

  async start() {
    this.child = spawn("/usr/bin/safaridriver", [`--port=${this.port}`]);
    await tcpPortUsed.waitUntilUsed(this.port, 100, 10000);
  }

  stop() {
    this.child?.kill();
    this.child = null;
  }
}
