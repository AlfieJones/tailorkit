export function getSameOriginPath(value: string | undefined, currentOrigin: string) {
  if (!value) {
    return;
  }

  try {
    const url = new URL(value, currentOrigin);
    if (url.origin !== currentOrigin) {
      return;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    // Invalid URLs are not safe redirect targets.
  }
}
