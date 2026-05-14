import type { CreateClientConfig } from "./client/client";

export const createClientConfig: CreateClientConfig = (config = {}) => ({
  ...config,
  baseUrl: config.baseUrl ?? "https://tailorkit.dev/api/platform",
});
