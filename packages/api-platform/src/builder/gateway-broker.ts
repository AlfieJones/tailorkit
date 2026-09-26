import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";

const gatewayOrigin = "https://ai-gateway.vercel.sh";
const acceptedPaths = new Set(["/v1/chat/completions", "/v1/responses"]);
const maxRequestBytes = 2 * 1024 * 1024;
const maxRequestsPerBuild = 30;

export function prepareLocalGatewayRequest(input: {
  authorization: string;
  expectedToken: string;
  method: string;
  path: string;
  body: Uint8Array;
  credential: string;
}): { url: URL; init: RequestInit } | { status: number; message: string } {
  const providedBuffer = Buffer.from(input.authorization);
  const expectedBuffer = Buffer.from(`Bearer ${input.expectedToken}`);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return { status: 401, message: "Unauthorized." };
  }
  if (input.method !== "POST" || !acceptedPaths.has(input.path)) {
    return { status: 404, message: "Not found." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(input.body).toString("utf-8"));
  } catch {
    return { status: 400, message: "Invalid Gateway request." };
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("model" in parsed) ||
    parsed.model !== "openai/gpt-6-luna"
  ) {
    return { status: 403, message: "This local relay is restricted to openai/gpt-6-luna." };
  }
  const boundedRequest = { ...parsed } as Record<string, unknown>;
  const outputLimitKeys = ["max_tokens", "max_completion_tokens", "max_output_tokens"];
  const requestedLimit = outputLimitKeys
    .map((key) => boundedRequest[key])
    .find((value): value is number => typeof value === "number");
  const selectedLimitKey = input.path === "/v1/responses" ? "max_output_tokens" : "max_tokens";
  boundedRequest[selectedLimitKey] = Math.min(requestedLimit ?? 4096, 4096);
  const headers = new Headers({
    authorization: `Bearer ${input.credential}`,
    "content-type": "application/json",
    "x-client-app": "tailorkit-builder",
  });
  return {
    url: new URL(input.path, gatewayOrigin),
    init: {
      method: "POST",
      headers,
      body: JSON.stringify(boundedRequest),
      redirect: "error",
      signal: AbortSignal.timeout(10 * 60 * 1000),
    },
  };
}

export interface LocalGatewayBroker {
  baseUrl: string;
  token: string;
  close(): Promise<void>;
}

/**
 * A per-run, model-restricted local relay. The host Gateway credential never
 * leaves this process; Docker receives only the short-lived relay capability.
 */
export async function createLocalGatewayBroker(input: {
  credential: string;
  listenHost?: string;
}): Promise<LocalGatewayBroker> {
  const token = randomBytes(32).toString("base64url");
  let requestCount = 0;
  const server = createServer(async (request, response) => {
    if (++requestCount > maxRequestsPerBuild) {
      response.writeHead(429).end("Gateway relay request limit exceeded.");
      return;
    }
    try {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of request) {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += bytes.byteLength;
        if (size > maxRequestBytes) {
          response.writeHead(413).end("Gateway request is too large.");
          request.destroy();
          return;
        }
        chunks.push(bytes);
      }
      const body = Buffer.concat(chunks);
      const prepared = prepareLocalGatewayRequest({
        authorization: request.headers.authorization ?? "",
        expectedToken: token,
        method: request.method ?? "",
        path: request.url ?? "",
        body,
        credential: input.credential,
      });
      if ("status" in prepared) {
        response.writeHead(prepared.status).end(prepared.message);
        return;
      }
      const upstream = await fetch(prepared.url, prepared.init);
      const headers = new Headers();
      for (const name of ["content-type", "cache-control", "x-request-id"]) {
        const value = upstream.headers.get(name);
        if (value) {
          headers.set(name, value);
        }
      }
      response.writeHead(upstream.status, Object.fromEntries(headers.entries()));
      if (upstream.body) {
        for await (const chunk of upstream.body) {
          response.write(chunk);
        }
      }
      response.end();
    } catch {
      if (!response.headersSent) {
        response.writeHead(502);
      }
      response.end("Gateway relay failed.");
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, input.listenHost ?? "0.0.0.0", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not start the local AI Gateway relay.");
  }
  const port = address.port;
  let closed = false;
  return {
    baseUrl: `http://host.docker.internal:${port}`,
    token,
    async close() {
      if (closed) {
        return;
      }
      closed = true;
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    },
  };
}
