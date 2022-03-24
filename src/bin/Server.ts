import * as http from "http";
import { createHttpTerminator, HttpTerminator } from "http-terminator";
import serveHandler from "serve-handler";

export class Server {
  private port: number;

  private server: http.Server;

  private httpTerminator: HttpTerminator;

  constructor(port: number, redirectTo: string) {
    this.port = port;

    this.server = http.createServer((request, response) =>
      serveHandler(request, response, {
        redirects: [
          {
            type: 0,
            source: "/",
            destination: redirectTo,
          },
        ],
      })
    );

    this.httpTerminator = createHttpTerminator({
      server: this.server,
    });
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, resolve);
    });
  }

  async stop() {
    await this.httpTerminator.terminate();
  }
}
