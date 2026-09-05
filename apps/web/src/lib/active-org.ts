import { createIsomorphicFn } from "@tanstack/react-start";
import { deleteCookie, getCookie } from "@tanstack/react-start/server";

export const getActiveOrg = createIsomorphicFn()
  .server(() => getCookie("active-org-id"))
  .client(async () => {
    const cookie = await window.cookieStore.get("active-org-id");
    return cookie?.value || sessionStorage.getItem("active-org-id");
  });

export const clearActiveOrg = createIsomorphicFn()
  .server(() => deleteCookie("active-org-id", { path: "/" }))
  .client(async () => {
    await window.cookieStore.delete({ name: "active-org-id", path: "/" });
    sessionStorage.removeItem("active-org-id");
  });
