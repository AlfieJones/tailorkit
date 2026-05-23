import { rewrite } from "@vercel/functions";

export const config = {
  runtime: "edge",
  matcher: "/",
};

export default function middleware(request: Request) {
  const url = new URL(request.url);

  // if (url.pathname !== "/") {
  //   return;
  // }

  // const cookie = request.headers.get("cookie") ?? "";
  // const hasCookie = cookie
  //   .split(";")
  //   .some((part) => part.trim().startsWith("tailorkit.session_token"));

  // if (hasCookie) {
  //   return;
  // }

  url.pathname = "/home";

  return rewrite(url);
}
