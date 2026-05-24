export const normalizeHostUrl = (host: string): string => {
  const url = new URL(host);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/u, "");

  return url.toString().replace(/\/$/u, "");
};
