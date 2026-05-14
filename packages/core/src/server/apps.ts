export function normalizeBasePath(basePath: string): string {
  const prefixed = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return prefixed.length > 1 ? prefixed.replace(/\/+$/u, "") : prefixed;
}
