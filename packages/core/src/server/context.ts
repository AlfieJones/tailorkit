import type { Client as PlatformClient } from "@tailorkit/client-platform/client/client/index";
import type { ImplementedAction, TailorKitSchema } from "../schema";
import type { TailorKitPlatformOptions } from "./types";

interface TailorKitRuntimeContext {
  actionContext?: unknown;
  scopeId: string;
}

export interface Context {
  actions: Map<string, ImplementedAction>;
  platform: PlatformClient;
  platformHeaders: Record<string, string>;
  request: Request;
  schema: TailorKitSchema;
  tailorkit?: TailorKitRuntimeContext;
  authenticate: (
    request: Request,
  ) => TailorKitRuntimeContext | null | Promise<TailorKitRuntimeContext | null>;
}

export interface CreateContextOptions {
  actions: Context["actions"];
  platform: PlatformClient;
  platformHeaders?: TailorKitPlatformOptions["headers"];
  request: Request;
  schema: TailorKitSchema;
  authenticate: (
    request: Request,
  ) => TailorKitRuntimeContext | null | Promise<TailorKitRuntimeContext | null>;
}

export async function createContext(options: CreateContextOptions): Promise<Context> {
  const configuredHeaders = await (typeof options.platformHeaders === "function"
    ? options.platformHeaders()
    : options.platformHeaders);

  const platformHeaders = Object.fromEntries(new Headers(configuredHeaders));

  return {
    actions: options.actions,
    platform: options.platform,
    platformHeaders,
    request: options.request,
    schema: options.schema,
    authenticate: options.authenticate,
  };
}
