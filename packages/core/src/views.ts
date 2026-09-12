export type ViewStatus = "ready" | "loading" | "error";

export interface ViewLayer {
  path: string;
  context: unknown;
  status: ViewStatus;
}

export interface ActiveView {
  view: string;
  layers: ViewLayer[];
}

/** Includes the requested path, followed by its parents through the root. */
export function getViewHierarchy(path: string): string[] {
  const hierarchy = [path];
  let current = path;
  while (current !== "/") {
    const separator = current.lastIndexOf("/");
    current = separator <= 0 ? "/" : current.slice(0, separator);
    hierarchy.push(current);
  }
  return hierarchy;
}

export function isViewAncestor(ancestor: string, path: string): boolean {
  return ancestor === "/" || ancestor === path || path.startsWith(`${ancestor}/`);
}

export function getViewDepth(path: string): number {
  return path.split("/").filter(Boolean).length;
}
