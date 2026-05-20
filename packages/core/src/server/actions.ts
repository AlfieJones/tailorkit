import type { ImplementedAction } from "../schema";

export const flattenActionRouter = (
  router: unknown,
  prefix: string[] = [],
): Map<string, ImplementedAction> => {
  const actions = new Map<string, ImplementedAction>();

  if (router === undefined || router === null || typeof router !== "object") {
    return actions;
  }

  for (const [key, value] of Object.entries(router)) {
    if (value && typeof value === "object" && "$tailorkitAction" in value) {
      actions.set([...prefix, key].join("."), value as ImplementedAction);
      continue;
    }

    for (const [path, action] of flattenActionRouter(value, [...prefix, key])) {
      actions.set(path, action);
    }
  }

  return actions;
};
