export async function proxyAppAsset(clientUrl: string): Promise<Response> {
  const upstream = await fetch(clientUrl);
  const headers = new Headers(upstream.headers);

  headers.set("cache-control", upstream.ok ? "no-store" : "no-cache");
  headers.set("content-type", headers.get("content-type") ?? "text/javascript; charset=utf-8");

  return new Response(upstream.body, {
    headers,
    status: upstream.status,
    statusText: upstream.statusText,
  });
}
