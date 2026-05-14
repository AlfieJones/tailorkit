import type { Client as PlatformClient } from "@tailorkit/client-platform/client/client/index";
import type { ActionDefinition, Schema } from "../schema";
import type { ImplementedAction } from "./actions";
import type { TailorKitHandlerContext, TailorKitPlatformOptions } from "./types";

export interface Context {
  actions: Map<string, ImplementedAction<ActionDefinition, unknown>>;
  platform: PlatformClient;
  platformHeaders: Headers;
  requestContextSchema?: Schema;
  tailorkit: TailorKitHandlerContext;
}

export interface CreateContextOptions {
  actions: Context["actions"];
  platform: PlatformClient;
  platformHeaders?: TailorKitPlatformOptions["headers"];
  request: Request;
  requestContextSchema?: Schema;
  tailorkit: TailorKitHandlerContext;
}

export async function createContext(options: CreateContextOptions): Promise<Context> {
  const configuredHeaders = await (typeof options.platformHeaders === "function"
    ? options.platformHeaders()
    : options.platformHeaders);

  const platformHeaders = new Headers(configuredHeaders);
  const authorization = options.request.headers.get("authorization");

  if (authorization) {
    platformHeaders.set("authorization", authorization);
  }

  return {
    actions: options.actions,
    platform: options.platform,
    platformHeaders,
    requestContextSchema: options.requestContextSchema,
    tailorkit: options.tailorkit,
  };
}
