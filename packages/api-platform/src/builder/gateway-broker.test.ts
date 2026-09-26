import { describe, expect, it } from "vitest";
import { prepareLocalGatewayRequest } from "./gateway-broker";

describe("local AI Gateway relay", () => {
  it("keeps host auth on the host and restricts relay requests to the selected model", () => {
    const common = {
      authorization: "Bearer one-run-token",
      expectedToken: "one-run-token",
      method: "POST",
      path: "/v1/chat/completions",
      credential: "host-secret",
    };
    expect(
      prepareLocalGatewayRequest({
        ...common,
        authorization: "Bearer wrong",
        body: new TextEncoder().encode("{}"),
      }),
    ).toEqual({ status: 401, message: "Unauthorized." });
    expect(
      prepareLocalGatewayRequest({
        ...common,
        body: new TextEncoder().encode('{"model":"openai/gpt-6"}'),
      }),
    ).toEqual({ status: 403, message: "This local relay is restricted to openai/gpt-6-luna." });

    const result = prepareLocalGatewayRequest({
      ...common,
      body: new TextEncoder().encode('{"model":"openai/gpt-6-luna","max_tokens":9000}'),
    });
    expect("status" in result).toBe(false);
    if (!("status" in result)) {
      expect(result.url.href).toBe("https://ai-gateway.vercel.sh/v1/chat/completions");
      expect(new Headers(result.init.headers).get("authorization")).toBe("Bearer host-secret");
      expect(JSON.parse(String(result.init.body))).toEqual({
        model: "openai/gpt-6-luna",
        max_tokens: 4096,
      });
    }
  });
});
