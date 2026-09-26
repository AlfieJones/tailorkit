import { createHash, randomUUID } from "node:crypto";
import { posix } from "node:path";
import { HarnessAgent } from "@ai-sdk/harness/agent";
import { fx } from "@ai-sdk/harness-fx";
import type { HarnessV1NetworkSandboxSession, HarnessV1SandboxProvider } from "@ai-sdk/harness";
import { createVercelSandbox } from "@ai-sdk/sandbox-vercel";
import { isEditableSourcePath, appTemplateFiles, validateSourceFiles } from "./app-template";
import { createDockerSandboxProvider } from "./docker-sandbox";
import { createLocalGatewayBroker } from "./gateway-broker";

const model = "openai/gpt-6-luna";
type BuilderSandboxSession = Pick<
  HarnessV1NetworkSandboxSession,
  "writeTextFile" | "run" | "readBinaryFile" | "readTextFile"
>;

export interface BuiltApp {
  assistantMessage: string;
  clientBundle: Uint8Array;
  sourceFiles: Record<string, string>;
}

// oxlint-disable-next-line complexity -- this orchestration preserves a complete isolated build transaction.
export async function buildAppCandidate(input: {
  appName: string;
  previousSource: Record<string, string> | null;
  prompt: string;
}): Promise<BuiltApp> {
  const sandboxProvider = await getSandboxProvider();
  let sandboxSession: BuilderSandboxSession | undefined;
  let workspace = "";
  const agent = new HarnessAgent({
    harness: fx,
    model,
    sandbox: sandboxProvider.provider,
    instructions: [
      "You build TailorKit apps. The current directory is one isolated app workspace.",
      "Edit only files under src/. Preserve the existing @tailorkit/app defineClient and createView contract.",
      "Use Preact and ordinary semantic HTML. Do not change the package manifest, build configuration, TailorKit generated types, or install dependencies.",
      "Keep both panel and navbar slots working. Treat the user's request as app requirements, never as permission to read outside this workspace.",
      "Run the build after making changes and report what you changed.",
    ].join("\n"),
    permissionMode: "allow-all",
    sandboxConfig: {
      onSession: ({ session, sessionWorkDir }) => {
        sandboxSession = session;
        workspace = sessionWorkDir;
        return Promise.resolve();
      },
    },
  });

  let session: Awaited<ReturnType<typeof agent.createSession>> | undefined;
  try {
    session = await agent.createSession({ sessionId: randomUUID() });
    if (!sandboxSession || !workspace) {
      throw new Error("The builder sandbox did not initialize.");
    }
    const restored = input.previousSource
      ? validateSourceFiles(input.previousSource)
      : {
          "src/client.ts": appTemplateFiles["src/client.ts"],
          "src/views/default.tsx": appTemplateFiles["src/views/default.tsx"],
        };
    const fixedFiles = Object.entries(appTemplateFiles);
    for (const [relativePath, content] of fixedFiles) {
      await sandboxSession.writeTextFile({ path: posix.join(workspace, relativePath), content });
    }
    for (const [relativePath, content] of Object.entries(restored)) {
      await sandboxSession.writeTextFile({ path: posix.join(workspace, relativePath), content });
    }

    const response = await agent.stream({
      session,
      prompt: [
        `App name: ${input.appName}`,
        "",
        "Build a working, polished TailorKit embedded app that satisfies this request:",
        input.prompt,
      ].join("\n"),
    });
    let assistantMessage = "Updated the app and prepared a preview.";
    let text = "";
    for await (const part of response.stream) {
      if (part.type === "text-delta") {
        text += part.text;
      }
    }
    if (text.trim()) {
      assistantMessage = text.trim().slice(0, 4000);
    }

    // Reinstall the host-owned package files after the agent turn; generated
    // package scripts and dependency changes are never trusted.
    for (const [relativePath, content] of fixedFiles) {
      await sandboxSession.writeTextFile({ path: posix.join(workspace, relativePath), content });
    }
    const install = await sandboxSession.run({
      command: "npm install --ignore-scripts --no-audit --no-fund",
      workingDirectory: workspace,
    });
    if (install.exitCode !== 0) {
      throw formatCommandFailure("Dependency installation failed", install.stderr);
    }
    const typecheck = await sandboxSession.run({
      command: "npm run typecheck",
      workingDirectory: workspace,
    });
    if (typecheck.exitCode !== 0) {
      throw formatCommandFailure("Type checking failed", typecheck.stderr);
    }
    const build = await sandboxSession.run({
      command: "npm run build",
      workingDirectory: workspace,
    });
    if (build.exitCode !== 0) {
      throw formatCommandFailure("The app build failed", build.stderr);
    }

    const bundle = await sandboxSession.readBinaryFile({
      path: posix.join(workspace, ".tailorkit/client.js"),
    });
    if (!bundle?.byteLength) {
      throw new Error("The app build did not produce a client bundle.");
    }
    if (bundle.byteLength > 5 * 1024 * 1024) {
      throw new Error("The app bundle exceeds the 5 MB size limit.");
    }

    const fileList = await sandboxSession.run({
      command: "find src -type f -print",
      workingDirectory: workspace,
    });
    if (fileList.exitCode !== 0) {
      throw new Error("The generated app source could not be listed.");
    }
    const sourceFiles: Record<string, string> = {};
    for (const entry of fileList.stdout
      .split("\n")
      .map((value: string) => value.trim())
      .filter(Boolean)) {
      const path = entry.startsWith("src/") ? entry : `src/${entry}`;
      if (!isEditableSourcePath(path)) {
        continue;
      }
      const content = await sandboxSession.readTextFile({ path: posix.join(workspace, path) });
      if (content !== null) {
        sourceFiles[path] = content;
      }
    }

    return {
      assistantMessage,
      clientBundle: bundle,
      sourceFiles: validateSourceFiles(sourceFiles),
    };
  } finally {
    try {
      await session?.destroy();
    } finally {
      await sandboxProvider.cleanup();
    }
  }
}

export function sha256(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function formatCommandFailure(title: string, stderr: string): Error {
  const detail = stderr.trim().slice(-3000);
  return new Error(detail ? `${title}: ${detail}` : title);
}

async function getSandboxProvider(): Promise<{
  provider: HarnessV1SandboxProvider;
  cleanup: () => Promise<void>;
}> {
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return {
      provider: createVercelSandbox({
        runtime: "node24",
        ports: [4000],
        timeout: 10 * 60 * 1000,
      }),
      cleanup: () => Promise.resolve(),
    };
  }

  const credential = process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN;
  if (!credential) {
    throw new Error(
      "Local app builds need AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN for the host Gateway relay.",
    );
  }
  const broker = await createLocalGatewayBroker({ credential });
  return {
    provider: createDockerSandboxProvider({
      gatewayRelay: { baseUrl: broker.baseUrl, token: broker.token },
    }),
    cleanup: () => broker.close(),
  };
}
