import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const getPreferredLocale = createIsomorphicFn()
  .server(() => getRequest().headers.get("accept-language")?.split(",")[0]?.split(";")[0] ?? "en")
  .client(() => navigator.language);
