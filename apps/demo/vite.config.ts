import { createHash } from "node:crypto";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import type { Plugin, ViteDevServer } from "vite";

function demoSyncPlugin(): Plugin {
  const channels = new Map<string, Set<import("node:net").Socket>>();

  function broadcast(channel: string, payload: string, sender?: import("node:net").Socket) {
    for (const socket of channels.get(channel) ?? []) {
      if (socket === sender || socket.destroyed) {
        continue;
      }
      socket.write(encodeFrame(payload));
    }
  }

  function remove(socket: import("node:net").Socket) {
    for (const sockets of channels.values()) {
      sockets.delete(socket);
    }
  }

  return {
    name: "demo-sync-websocket",
    configureServer(server: ViteDevServer) {
      return () => {
        const httpServer = server.httpServer;
        if (!httpServer) {
          return;
        }

        const viteUpgradeListeners = httpServer.listeners("upgrade");
        httpServer.removeAllListeners("upgrade");
        httpServer.on("upgrade", (request, socket, head) => {
          const url = new URL(request.url ?? "/", "http://localhost");
          if (url.pathname !== "/tailorkit-demo-sync") {
            for (const listener of viteUpgradeListeners) {
              listener.call(httpServer, request, socket, head);
            }
            return;
          }

          const key = request.headers["sec-websocket-key"];
          const channel = url.searchParams.get("channel") || "default";
          if (typeof key !== "string") {
            socket.destroy();
            return;
          }

          socket.write(
            [
              "HTTP/1.1 101 Switching Protocols",
              "Upgrade: websocket",
              "Connection: Upgrade",
              `Sec-WebSocket-Accept: ${createAcceptKey(key)}`,
              "",
              "",
            ].join("\r\n"),
          );

          let sockets = channels.get(channel);
          if (!sockets) {
            sockets = new Set();
            channels.set(channel, sockets);
          }
          sockets.add(socket);

          socket.on("data", (buffer: Buffer) => {
            for (const message of decodeFrames(buffer)) {
              broadcast(channel, message, socket);
            }
          });
          socket.on("close", () => remove(socket));
          socket.on("error", () => remove(socket));
        });
      };
    },
  };
}

function createAcceptKey(key: string) {
  return createHash("sha1").update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64");
}

function encodeFrame(payload: string) {
  const data = Buffer.from(payload);
  const length = data.length;
  if (length < 126) {
    return Buffer.concat([Buffer.from([0x81, length]), data]);
  }
  if (length < 65_536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
    return Buffer.concat([header, data]);
  }
  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(length), 2);
  return Buffer.concat([header, data]);
}

function decodeFrames(buffer: Buffer) {
  const messages: string[] = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    const opcode = first & 0x0f;
    let length = second & 0x7f;
    let cursor = offset + 2;

    if (length === 126) {
      if (cursor + 2 > buffer.length) {
        break;
      }
      length = buffer.readUInt16BE(cursor);
      cursor += 2;
    } else if (length === 127) {
      if (cursor + 8 > buffer.length) {
        break;
      }
      const nextLength = Number(buffer.readBigUInt64BE(cursor));
      if (!Number.isSafeInteger(nextLength)) {
        break;
      }
      length = nextLength;
      cursor += 8;
    }

    const masked = (second & 0x80) !== 0;
    const mask = masked ? buffer.subarray(cursor, cursor + 4) : null;
    cursor += masked ? 4 : 0;
    if (cursor + length > buffer.length) {
      break;
    }

    const data = Buffer.from(buffer.subarray(cursor, cursor + length));
    if (mask) {
      for (let index = 0; index < data.length; index += 1) {
        data[index] ^= mask[index % 4];
      }
    }
    if (opcode === 1) {
      messages.push(data.toString("utf-8"));
    }
    offset = cursor + length;
  }
  return messages;
}

export default defineConfig({
  plugins: [demoSyncPlugin(), tailwindcss(), tanstackStart(), viteReact()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    port: 3000,
  },
  preview: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
