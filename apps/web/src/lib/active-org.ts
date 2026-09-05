import { createIsomorphicFn } from "@tanstack/react-start";
import { deleteCookie, getCookie } from "@tanstack/react-start/server";

const activeOrgCookie = "active-org-id";

export const getActiveOrgSlug = createIsomorphicFn()
  .server(() => getCookie(activeOrgCookie) ?? "")
  .client(() => sessionStorage.getItem(activeOrgCookie) ?? "");

export const clearActiveOrg = createIsomorphicFn()
  .server(() => deleteCookie(activeOrgCookie, { path: "/" }))
  .client(async () => {
    sessionStorage.removeItem(activeOrgCookie);
    await window.cookieStore.delete({ name: activeOrgCookie, path: "/" });
  });
