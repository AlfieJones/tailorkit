import { randomUUID } from "node:crypto";
import { chmod, lstat, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { spawn as nodeSpawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { Readable } from "node:stream";
import type { HarnessV1NetworkSandboxSession, HarnessV1SandboxProvider } from "@ai-sdk/harness";

const ACP_PORT = 4000;
const WORKSPACE = "/workspace";
const DEFAULT_IMAGE = "node:22-bookworm-slim";

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}
interface CommandProcess {
  stdout: Readable;
  stderr: Readable;
  kill: () => void;
  once: ChildProcess["once"];
}
interface DockerExecutor {
  run: (args: string[], signal?: AbortSignal) => Promise<CommandResult>;
  spawn: (args: string[]) => CommandProcess;
}
type SandboxIO = Pick<
  HarnessV1NetworkSandboxSession,
  | "description"
  | "readFile"
  | "readBinaryFile"
  | "readTextFile"
  | "writeFile"
  | "writeBinaryFile"
  | "writeTextFile"
  | "spawn"
  | "run"
>;

export interface DockerSandboxProviderOptions {
  /** Docker image with /bin/sh and a sleep utility. Defaults to Node 22. */
  image?: string;
  /** Override the Docker executable, primarily useful for local installations. */
  dockerPath?: string;
  /** Test seam; production callers should use the default Docker CLI executor. */
  executor?: DockerExecutor;
  /** Test seam for the temporary workspace parent. */
  workspaceRoot?: string;
  /** Short-lived model relay capability; not a Gateway credential. */
  gatewayRelay?: { baseUrl: string; token: string };
}

function abortError(signal?: AbortSignal): Error | undefined {
  if (!signal?.aborted) {
    return undefined;
  }
  return signal.reason instanceof Error ? signal.reason : new Error("Operation aborted");
}

function throwIfAborted(signal?: AbortSignal): void {
  const error = abortError(signal);
  if (error) {
    throw error;
  }
}

function createDockerExecutor(dockerPath = "docker"): DockerExecutor {
  return {
    run(args, signal) {
      return new Promise((resolve, reject) => {
        const error = abortError(signal);
        if (error) {
          return reject(error);
        }
        const child = nodeSpawn(dockerPath, args, { stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";
        let settled = false;
        const finish = (fn: () => void) => {
          if (settled) {
            return;
          }
          settled = true;
          signal?.removeEventListener("abort", onAbort);
          fn();
        };
        const onAbort = () => {
          child.kill("SIGTERM");
          const reason = abortError(signal) ?? new Error("Operation aborted");
          finish(() => reject(reason));
          setTimeout(() => child.kill("SIGKILL"), 1000).unref();
        };
        signal?.addEventListener("abort", onAbort, { once: true });
        child.stdout.setEncoding("utf-8").on("data", (chunk: string) => (stdout += chunk));
        child.stderr.setEncoding("utf-8").on("data", (chunk: string) => (stderr += chunk));
        child.once("error", (cause) => finish(() => reject(cause)));
        child.once("close", (code) =>
          finish(() =>
            code === 0
              ? resolve({ exitCode: code, stdout, stderr })
              : reject(
                  new Error(`docker ${args[0]} failed (${code ?? "signal"}): ${stderr.trim()}`),
                ),
          ),
        );
      });
    },
    spawn(args) {
      const child = nodeSpawn(dockerPath, args, { stdio: ["ignore", "pipe", "pipe"] });
      if (!child.stdout || !child.stderr) {
        throw new Error("Docker process streams unavailable");
      }
      return {
        stdout: child.stdout,
        stderr: child.stderr,
        kill: () => {
          child.kill("SIGTERM");
          setTimeout(() => child.kill("SIGKILL"), 1000).unref();
        },
        once: child.once.bind(child),
      };
    },
  };
}

function mapWorkspacePath(workspace: string, sandboxPath: string): string {
  const normalized = isAbsolute(sandboxPath)
    ? resolve(sandboxPath)
    : resolve(WORKSPACE, sandboxPath);
  const rel = relative(WORKSPACE, normalized);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`Sandbox path must stay inside ${WORKSPACE}`);
  }
  return resolve(workspace, rel);
}

function assertSuccess(result: CommandResult, operation: string): void {
  if (result.exitCode !== 0) {
    throw new Error(`${operation} failed: ${result.stderr}`);
  }
}

function bytesStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

function decodeStream(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  return new Response(stream).arrayBuffer().then((arrayBuffer) => Buffer.from(arrayBuffer));
}

function dockerEnvironment(
  env?: Record<string, string>,
  gatewayRelay?: DockerSandboxProviderOptions["gatewayRelay"],
): string[] {
  if (!env) {
    return [];
  }
  return Object.entries(env).flatMap(([key, value]) => {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key)) {
      throw new Error(`Invalid environment variable name: ${key}`);
    }
    if (value.includes("\0")) {
      throw new Error(`Invalid value for environment variable ${key}`);
    }
    const gatewayCredential = [
      "AI_GATEWAY_API_KEY",
      "VERCEL_OIDC_TOKEN",
      "AI_SDK_ACP_GATEWAY_API_KEY",
    ].includes(key);
    if (gatewayCredential && !gatewayRelay) {
      throw new Error(`Secret environment variable ${key} cannot be forwarded to a Docker sandbox`);
    }
    if (/(?:API[_-]?KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/iu.test(key) && !gatewayCredential) {
      throw new Error(`Secret environment variable ${key} cannot be forwarded to a Docker sandbox`);
    }
    let forwardedValue = value;
    if (gatewayCredential) {
      if (!gatewayRelay) {
        throw new Error(
          `Secret environment variable ${key} cannot be forwarded to a Docker sandbox`,
        );
      }
      forwardedValue = gatewayRelay.token;
    } else if (key === "AI_GATEWAY_BASE_URL" && gatewayRelay) {
      forwardedValue = gatewayRelay.baseUrl;
    }
    return ["-e", `${key}=${forwardedValue}`];
  });
}

function makeSession(
  executor: DockerExecutor,
  containerId: string,
  workspace: string,
  hostPort: number,
  gatewayRelay?: DockerSandboxProviderOptions["gatewayRelay"],
): HarnessV1NetworkSandboxSession {
  let stopped = false;
  let destroyed = false;
  let stopPromise: Promise<void> | undefined;
  let destroyPromise: Promise<void> | undefined;
  const safeWorkspace = (path: string) => mapWorkspacePath(workspace, path);
  const assertNoSymlinkComponents = async (target: string) => {
    const rel = relative(workspace, target);
    let current = workspace;
    for (const part of rel.split(sep).filter(Boolean)) {
      current = resolve(current, part);
      try {
        const currentStat = await lstat(current);
        if (currentStat.isSymbolicLink()) {
          throw new Error("Sandbox file paths cannot traverse symbolic links");
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          break;
        }
        throw error;
      }
    }
  };
  const prepareDirectory = async (directory: string) => {
    await assertNoSymlinkComponents(directory);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await assertNoSymlinkComponents(directory);
    await chmod(directory, 0o700);
  };
  const dockerExecArgs = (options: {
    command: string;
    workingDirectory?: string;
    env?: Record<string, string>;
  }) => {
    const cwd = options.workingDirectory ?? WORKSPACE;
    // Keep execution and file APIs within the writable bind mount.
    safeWorkspace(cwd);
    return [
      "exec",
      "-i",
      "-w",
      cwd,
      ...dockerEnvironment(options.env, gatewayRelay),
      containerId,
      "/bin/sh",
      "-lc",
      options.command,
    ];
  };
  const spawn = (options: {
    command: string;
    workingDirectory?: string;
    env?: Record<string, string>;
    abortSignal?: AbortSignal;
  }) => {
    throwIfAborted(options.abortSignal);
    const child = executor.spawn(dockerExecArgs(options));
    let killed = false;
    const kill = () => {
      if (killed) {
        return Promise.resolve();
      }
      killed = true;
      child.kill();
      return Promise.resolve();
    };
    const onAbort = () => void kill();
    options.abortSignal?.addEventListener("abort", onAbort, { once: true });
    const exit = new Promise<{ exitCode: number }>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code) => {
        const error = abortError(options.abortSignal);
        if (error) {
          reject(error);
        } else {
          resolve({ exitCode: typeof code === "number" ? code : 1 });
        }
      });
    });
    const aborted = new Promise<never>((resolve, reject) => {
      void resolve;
      options.abortSignal?.addEventListener(
        "abort",
        () => reject(abortError(options.abortSignal)),
        { once: true },
      );
    });
    void aborted.catch(() => {});
    const wait = Promise.race([exit, aborted]).finally(() =>
      options.abortSignal?.removeEventListener("abort", onAbort),
    );
    return Promise.resolve({
      stdout: Readable.toWeb(child.stdout) as ReadableStream<Uint8Array>,
      stderr: Readable.toWeb(child.stderr) as ReadableStream<Uint8Array>,
      wait: () => wait,
      kill,
    });
  };
  const stop = (): Promise<void> => {
    if (stopPromise) {
      return stopPromise;
    }
    if (stopped || destroyed) {
      return Promise.resolve();
    }
    stopped = true;
    stopPromise = executor.run(["stop", "--time", "1", containerId]).then(
      () => {},
      () => {},
    );
    return stopPromise;
  };
  const destroy = (): Promise<void> => {
    if (destroyPromise) {
      return destroyPromise;
    }
    if (destroyed) {
      return Promise.resolve();
    }
    destroyed = true;
    destroyPromise = (async () => {
      await stop();
      destroyed = true;
      await executor.run(["rm", "--force", containerId]).catch(() => {});
      await rm(workspace, { recursive: true, force: true });
    })();
    return destroyPromise;
  };
  const sessionApis: SandboxIO = {
    description: `Isolated local Docker workspace at ${WORKSPACE}.`,
    readFile: async ({ path, abortSignal }) => {
      throwIfAborted(abortSignal);
      try {
        const target = safeWorkspace(path);
        await assertNoSymlinkComponents(target);
        return bytesStream(await readFile(target, { signal: abortSignal }));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }
        throw error;
      }
    },
    readBinaryFile: async ({ path, abortSignal }) => {
      throwIfAborted(abortSignal);
      try {
        const target = safeWorkspace(path);
        await assertNoSymlinkComponents(target);
        return await readFile(target, { signal: abortSignal });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }
        throw error;
      }
    },
    readTextFile: async ({ path, encoding = "utf-8", startLine, endLine, abortSignal }) => {
      throwIfAborted(abortSignal);
      try {
        const target = safeWorkspace(path);
        await assertNoSymlinkComponents(target);
        const text = await readFile(target, {
          encoding: encoding as BufferEncoding,
          signal: abortSignal,
        });
        if (startLine === undefined && endLine === undefined) {
          return text;
        }
        const lines = text.split(/\r?\n/u);
        return lines.slice(Math.max(0, (startLine ?? 1) - 1), endLine).join("\n");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }
        throw error;
      }
    },
    writeFile: async ({ path, content, abortSignal }) => {
      throwIfAborted(abortSignal);
      const target = safeWorkspace(path);
      await prepareDirectory(dirname(target));
      await assertNoSymlinkComponents(target);
      const chunks: Uint8Array[] = [];
      const reader = content.getReader();
      try {
        while (true) {
          throwIfAborted(abortSignal);
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      await writeFile(target, Buffer.concat(chunks), { signal: abortSignal, mode: 0o666 });
    },
    writeBinaryFile: async ({ path, content, abortSignal }) => {
      throwIfAborted(abortSignal);
      const target = safeWorkspace(path);
      await prepareDirectory(dirname(target));
      await assertNoSymlinkComponents(target);
      await writeFile(target, content, { signal: abortSignal, mode: 0o666 });
    },
    writeTextFile: async ({ path, content, encoding = "utf-8", abortSignal }) => {
      throwIfAborted(abortSignal);
      const target = safeWorkspace(path);
      await prepareDirectory(dirname(target));
      await assertNoSymlinkComponents(target);
      await writeFile(target, content, {
        encoding: encoding as BufferEncoding,
        signal: abortSignal,
        mode: 0o666,
      });
    },
    spawn,
    run: async (options) => {
      const process = await spawn(options);
      const [stdout, stderr, completion] = await Promise.all([
        decodeStream(process.stdout),
        decodeStream(process.stderr),
        process.wait(),
      ]);
      const result = {
        exitCode: completion.exitCode,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
      };
      return result;
    },
  };
  return {
    ...sessionApis,
    id: containerId,
    defaultWorkingDirectory: WORKSPACE,
    ports: [ACP_PORT],
    getPortEndpoint: ({ port, protocol = "http" }) => {
      if (port !== ACP_PORT) {
        throw new Error(`Port ${port} is not exposed by this sandbox`);
      }
      const transport = protocol === "ws" ? "ws" : protocol;
      return Promise.resolve({ url: `${transport}://127.0.0.1:${hostPort}` });
    },
    getPortUrl: ({ port, protocol = "http" }) => {
      if (port !== ACP_PORT) {
        throw new Error(`Port ${port} is not exposed by this sandbox`);
      }
      return Promise.resolve(`${protocol === "ws" ? "ws" : protocol}://127.0.0.1:${hostPort}`);
    },
    stop,
    destroy,
    restricted: () => sessionApis,
  };
}

/** Local Docker implementation of the AI SDK 7 Harness sandbox contract. */
export function createDockerSandboxProvider(
  options: DockerSandboxProviderOptions = {},
): HarnessV1SandboxProvider {
  const executor = options.executor ?? createDockerExecutor(options.dockerPath);
  const image = options.image ?? DEFAULT_IMAGE;
  return {
    specificationVersion: "harness-sandbox-v1",
    providerId: "tailorkit-docker",
    async createSession({ abortSignal, onFirstCreate } = {}) {
      throwIfAborted(abortSignal);
      const workspace = await mkdtemp(
        resolve(options.workspaceRoot ?? tmpdir(), "tailorkit-builder-"),
      );
      const uid = process.getuid?.() || 1000;
      const gid = process.getgid?.() || 1000;
      const containerUser = uid === 0 || gid === 0 ? "1000:1000" : `${uid}:${gid}`;
      await chmod(workspace, 0o700);
      const containerName = `tailorkit-builder-${randomUUID()}`;
      try {
        const create = await executor.run(
          [
            "run",
            "--detach",
            "--rm",
            "--init",
            "--name",
            containerName,
            "--user",
            containerUser,
            "--env",
            "HOME=/home/builder",
            "--read-only",
            "--cap-drop",
            "ALL",
            "--security-opt",
            "no-new-privileges",
            "--tmpfs",
            `/tmp:rw,nosuid,nodev,noexec,size=256m,uid=${containerUser.split(":")[0]},gid=${containerUser.split(":")[1]},mode=1777`,
            "--tmpfs",
            `/home/builder:rw,nosuid,nodev,size=64m,uid=${containerUser.split(":")[0]},gid=${containerUser.split(":")[1]},mode=0755`,
            "--mount",
            `type=bind,src=${workspace},dst=${WORKSPACE}`,
            "--publish",
            `127.0.0.1::${ACP_PORT}`,
            ...(options.gatewayRelay ? ["--add-host", "host.docker.internal:host-gateway"] : []),
            image,
            "/bin/sh",
            "-lc",
            "while :; do sleep 3600; done",
          ],
          abortSignal,
        );
        assertSuccess(create, "Create Docker sandbox");
        const port = await executor.run(["port", containerName, `${ACP_PORT}/tcp`], abortSignal);
        const match = port.stdout.trim().match(/^127\.0\.0\.1:(\d+)$/u);
        if (!match) {
          throw new Error(`Docker did not return a loopback ACP port: ${port.stdout.trim()}`);
        }
        const session = makeSession(
          executor,
          containerName,
          workspace,
          Number(match[1]),
          options.gatewayRelay,
        );
        if (onFirstCreate) {
          await onFirstCreate(session.restricted(), { abortSignal });
        }
        return session;
      } catch (error) {
        await executor.run(["rm", "--force", containerName]).catch(() => {});
        await rm(workspace, { recursive: true, force: true });
        throw error;
      }
    },
  };
}
