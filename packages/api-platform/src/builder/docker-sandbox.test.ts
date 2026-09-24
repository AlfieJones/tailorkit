// oxlint-disable unicorn/prefer-event-target -- the provider contract listens to Node child-process close/error events.
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDockerSandboxProvider } from "./docker-sandbox";

class FakeProcess extends EventEmitter {
  stdout = Readable.from([Buffer.from("ok")]);
  stderr = Readable.from([]);
  kill = vi.fn(() => {
    this.emit("close", 143);
    return true;
  });

  constructor() {
    super();
    setTimeout(() => this.emit("close", 0), 0);
  }
}

describe("createDockerSandboxProvider", () => {
  let root = "";
  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true });
    }
    root = "";
  });

  it("creates a confined non-root container with loopback-only ACP and file/process APIs", async () => {
    root = await mkdtemp(join(tmpdir(), "docker-sandbox-test-"));
    const calls: string[][] = [];
    const spawnCalls: string[][] = [];
    const executor = {
      run: vi.fn((args: string[]) => {
        calls.push(args);
        return Promise.resolve(
          args[0] === "port"
            ? { exitCode: 0, stdout: "127.0.0.1:43127\n", stderr: "" }
            : { exitCode: 0, stdout: "", stderr: "" },
        );
      }),
      spawn: vi.fn((args: string[]) => {
        spawnCalls.push(args);
        return new FakeProcess();
      }),
    };
    const provider = createDockerSandboxProvider({
      executor: executor as never,
      workspaceRoot: root,
    });
    const session = await provider.createSession();

    expect(session.id).toMatch(/^tailorkit-builder-[0-9a-f-]{36}$/u);
    expect(session.defaultWorkingDirectory).toBe("/workspace");
    expect(await session.getPortEndpoint({ port: 4000 })).toEqual({
      url: "http://127.0.0.1:43127",
    });
    const createArgs = calls[0] ?? [];
    const userIndex = createArgs.indexOf("--user");
    expect(createArgs[userIndex + 1]).toMatch(/^\d+:\d+$/u);
    expect(createArgs[userIndex + 1]).not.toMatch(/^0:/u);
    expect(createArgs).toContain("--read-only");
    expect(createArgs).toContain("--cap-drop");
    expect(createArgs).toContain("127.0.0.1::4000");
    expect(createArgs).toContain("HOME=/home/builder");
    expect(createArgs).not.toContain("AI_GATEWAY_API_KEY");

    const sandbox = session.restricted();
    await sandbox.writeTextFile({ path: "/workspace/nested/app.ts", content: "export default 1" });
    const workspaceArgument = createArgs.find((argument) => argument.includes(",dst=/workspace"));
    const hostWorkspace = workspaceArgument?.match(/src=([^,]+)/u)?.[1];
    if (!hostWorkspace) {
      throw new Error("Docker workspace mount was not created.");
    }
    expect(await readFile(join(hostWorkspace, "nested/app.ts"), "utf-8")).toBe("export default 1");

    const result = await sandbox.run({ command: "printf ok", workingDirectory: "/workspace" });
    expect(result).toEqual({ exitCode: 0, stdout: "ok", stderr: "" });
    const execArgs = spawnCalls[0] ?? [];
    expect(execArgs).not.toContain("--env");
    expect(execArgs).not.toContain("HOST_SECRET");
    await expect(
      sandbox.run({ command: "env", env: { AI_GATEWAY_API_KEY: "never-forward" } }),
    ).rejects.toThrow("cannot be forwarded");
    await Promise.all([session.stop(), session.stop()]);
    await Promise.all([session.destroy(), session.destroy()]);
    expect(executor.run.mock.calls.filter(([args]) => args[0] === "rm")).toHaveLength(1);
  });

  it("rejects paths outside the bind workspace and kills an aborted process", async () => {
    root = await mkdtemp(join(tmpdir(), "docker-sandbox-test-"));
    const processes: FakeProcess[] = [];
    const executor = {
      run: vi.fn((args: string[]) =>
        Promise.resolve(
          args[0] === "port"
            ? { exitCode: 0, stdout: "127.0.0.1:40001\n", stderr: "" }
            : { exitCode: 0, stdout: "", stderr: "" },
        ),
      ),
      spawn: vi.fn(() => {
        const child = new FakeProcess();
        processes.push(child);
        return child;
      }),
    };
    const session = await createDockerSandboxProvider({
      executor: executor as never,
      workspaceRoot: root,
    }).createSession();
    await expect(session.restricted().readTextFile({ path: "/etc/passwd" })).rejects.toThrow(
      "must stay inside",
    );

    const controller = new AbortController();
    const process = await session
      .restricted()
      .spawn({ command: "sleep 60", abortSignal: controller.signal });
    controller.abort(new Error("cancelled"));
    await expect(process.wait()).rejects.toThrow("cancelled");
    expect(processes[0]?.kill).toHaveBeenCalledOnce();
    await session.destroy();
  });

  it("forwards only a relay capability and rewrites the Gateway URL", async () => {
    root = await mkdtemp(join(tmpdir(), "docker-sandbox-test-"));
    const calls: string[][] = [];
    const executor = {
      run: vi.fn((args: string[]) => {
        calls.push(args);
        return Promise.resolve(
          args[0] === "port"
            ? { exitCode: 0, stdout: "127.0.0.1:43127\n", stderr: "" }
            : { exitCode: 0, stdout: "", stderr: "" },
        );
      }),
      spawn: vi.fn((args: string[]) => {
        calls.push(args);
        return new FakeProcess();
      }),
    };
    const session = await createDockerSandboxProvider({
      executor: executor as never,
      workspaceRoot: root,
      gatewayRelay: { baseUrl: "http://host.docker.internal:1234", token: "one-run-relay-token" },
    }).createSession();
    await session.run({
      command: "true",
      env: {
        AI_GATEWAY_API_KEY: "real-host-key",
        AI_GATEWAY_BASE_URL: "https://ai-gateway.vercel.sh",
      },
    });
    const args = calls.at(-1) ?? [];
    expect(args).toContain("AI_GATEWAY_API_KEY=one-run-relay-token");
    expect(args).toContain("AI_GATEWAY_BASE_URL=http://host.docker.internal:1234");
    expect(args.join(" ")).not.toContain("real-host-key");
    expect(calls[0]).toContain("host.docker.internal:host-gateway");
    await session.destroy();
  });
});
