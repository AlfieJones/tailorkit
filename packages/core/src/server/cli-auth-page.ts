import { cliAuthApprove, cliAuthDeny } from "@tailorkit/client-platform/client";
import type { Client as PlatformClient } from "@tailorkit/client-platform/client/client/index";

type HeaderInput = ConstructorParameters<typeof Headers>[0];

interface TailorKitRuntimeContext {
  scopeId: string;
}

export interface CliAuthApprovalPageOptions {
  authenticate: (
    request: Request,
  ) => TailorKitRuntimeContext | null | Promise<TailorKitRuntimeContext | null>;
  platform: PlatformClient;
  platformHeaders: HeaderInput;
  request: Request;
}

type ApprovalPageState =
  | { code: string; error?: string; status: "idle" }
  | { status: "approved" }
  | { status: "denied" };

export async function handleCliAuthApprovalPage({
  authenticate,
  platform,
  platformHeaders,
  request,
}: CliAuthApprovalPageOptions): Promise<Response> {
  if (request.method === "GET") {
    const url = new URL(request.url);
    return renderCliAuthApprovalPage({ code: url.searchParams.get("code") ?? "", status: "idle" });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      headers: { allow: "GET, POST" },
      status: 405,
    });
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const userCode = String(form.get("userCode") ?? "").trim();

  if (!userCode) {
    return renderCliAuthApprovalPage({
      code: userCode,
      error: "Enter the code shown in your terminal.",
      status: "idle",
    });
  }

  const tailorkit = await authenticate(request);
  if (!tailorkit) {
    return renderCliAuthApprovalPage({
      code: userCode,
      error: "You need to sign in before approving this CLI login.",
      status: "idle",
    });
  }

  try {
    if (intent === "approve") {
      await cliAuthApprove({
        body: {
          scopeId: tailorkit.scopeId,
          userCode,
        },
        client: platform,
        headers: platformHeaders,
      });

      return renderCliAuthApprovalPage({ status: "approved" });
    }

    if (intent === "deny") {
      await cliAuthDeny({
        body: {
          userCode,
        },
        client: platform,
        headers: platformHeaders,
      });

      return renderCliAuthApprovalPage({ status: "denied" });
    }
  } catch (error) {
    return renderCliAuthApprovalPage({
      code: userCode,
      error: error instanceof Error ? error.message : "Unable to finish this CLI login request.",
      status: "idle",
    });
  }

  return renderCliAuthApprovalPage({
    code: userCode,
    error: "Choose whether to approve or deny this CLI login.",
    status: "idle",
  });
}

function renderCliAuthApprovalPage(state: ApprovalPageState): Response {
  return new Response(`<!doctype html>${renderHtml(state)}`, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

function renderHtml(state: ApprovalPageState): string {
  return `<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Approve TailorKit CLI</title>
  <style>${styles}</style>
</head>
<body>
  <main class="page">
    ${renderCard(state)}
  </main>
  ${state.status === "idle" ? `<script>${script}</script>` : ""}
</body>
</html>`;
}

function renderCard(state: ApprovalPageState): string {
  if (state.status === "approved") {
    return `<section class="card" aria-labelledby="title">
      <div class="status-icon success" aria-hidden="true">✓</div>
      <h1 id="title">CLI login approved</h1>
      <p class="description">You can close this tab and return to your terminal.</p>
    </section>`;
  }

  if (state.status === "denied") {
    return `<section class="card" aria-labelledby="title">
      <div class="status-icon denied" aria-hidden="true">×</div>
      <h1 id="title">CLI login denied</h1>
      <p class="description">You can close this tab and return to your terminal.</p>
    </section>`;
  }

  const code = normalizeCode(state.code);

  return `<section class="card" aria-labelledby="title">
    <p class="eyebrow">TailorKit CLI</p>
    <h1 id="title">Approve CLI login</h1>
    <p class="description">Enter the code shown in your terminal to authorize this CLI for your account.</p>
    ${state.error ? `<p class="error" role="alert">${escapeHtml(state.error)}</p>` : ""}
    <form method="post" novalidate>
      <fieldset>
        <legend>Confirmation code</legend>
        <div class="otp" role="group" aria-label="Confirmation code">
          ${renderOtpInputs(code)}
        </div>
        <input id="userCode" name="userCode" type="hidden" value="${escapeHtml(code)}">
        <noscript>
          <label class="fallback-label" for="fallback-code">Code</label>
          <input id="fallback-code" class="fallback-input" name="userCode" value="${escapeHtml(code)}" autocomplete="one-time-code">
        </noscript>
      </fieldset>
      <div class="actions">
        <button class="button primary" name="intent" value="approve" type="submit">Approve</button>
        <button class="button secondary" name="intent" value="deny" type="submit">Deny</button>
      </div>
    </form>
  </section>`;
}

function renderOtpInputs(code: string): string {
  return Array.from({ length: 9 }, (_, index) => {
    const autocomplete = index === 0 ? "one-time-code" : "off";
    const character = code[index] ?? "";

    return `<input class="otp-input" type="text" inputmode="text" autocomplete="${autocomplete}" maxlength="1" aria-label="Code character ${index + 1}" value="${escapeHtml(character)}">`;
  }).join("");
}

function normalizeCode(code: string): string {
  return code
    .replaceAll(/[^a-zA-Z0-9]/gu, "")
    .slice(0, 9)
    .toUpperCase();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const styles = `
:root {
  color-scheme: light;
  --background: #f8fafc;
  --card: #ffffff;
  --border: #d7dde8;
  --foreground: #111827;
  --muted: #5f6b7a;
  --primary: #111827;
  --primary-foreground: #ffffff;
  --ring: #2563eb;
  --error: #b42318;
  --success: #067647;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --background: #0b1020;
    --card: #111827;
    --border: #2d3748;
    --foreground: #f8fafc;
    --muted: #a0aabe;
    --primary: #f8fafc;
    --primary-foreground: #111827;
    --ring: #60a5fa;
    --error: #f97066;
    --success: #32d583;
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
}

.card {
  width: min(100%, 430px);
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  padding: 28px;
  box-shadow: 0 18px 48px rgb(15 23 42 / 0.10);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
}

h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: 0;
}

.description {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.error {
  margin: 18px 0 0;
  border: 1px solid color-mix(in srgb, var(--error) 35%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--error) 8%, transparent);
  color: var(--error);
  font-size: 14px;
  padding: 10px 12px;
}

form {
  margin-top: 24px;
}

fieldset {
  margin: 0;
  min-width: 0;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}

.otp {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 6px;
}

.otp-input,
.fallback-input {
  width: 100%;
  min-width: 0;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--foreground);
  font: inherit;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
}

.otp-input:focus,
.fallback-input:focus,
.button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.fallback-label {
  display: block;
  margin-top: 14px;
  font-size: 14px;
  font-weight: 600;
}

.fallback-input {
  margin-top: 8px;
  text-align: left;
  padding: 0 12px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.button {
  appearance: none;
  display: inline-flex;
  flex: 1;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
}

.button.primary {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--primary-foreground);
}

.button.secondary {
  background: transparent;
  color: var(--foreground);
}

.status-icon {
  display: grid;
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
  place-items: center;
  border-radius: 999px;
  font-size: 28px;
  font-weight: 700;
}

.status-icon.success {
  background: color-mix(in srgb, var(--success) 12%, transparent);
  color: var(--success);
}

.status-icon.denied {
  background: color-mix(in srgb, var(--error) 12%, transparent);
  color: var(--error);
}

@media (max-width: 420px) {
  .card {
    padding: 22px;
  }

  .otp {
    gap: 4px;
  }

  .otp-input {
    height: 38px;
    border-radius: 7px;
    font-size: 16px;
  }

  .actions {
    flex-direction: column;
  }
}
`;

const script = `
const inputs = Array.from(document.querySelectorAll(".otp-input"));
const hiddenInput = document.getElementById("userCode");

function normalize(value) {
  return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, inputs.length).toUpperCase();
}

function syncHidden() {
  hiddenInput.value = inputs.map((input) => input.value).join("");
}

function fill(value, startIndex = 0) {
  const characters = normalize(value);
  for (let index = 0; index < characters.length; index += 1) {
    const input = inputs[startIndex + index];
    if (!input) break;
    input.value = characters[index];
  }
  syncHidden();
  const nextIndex = Math.min(startIndex + characters.length, inputs.length - 1);
  inputs[nextIndex]?.focus();
}

for (const [index, input] of inputs.entries()) {
  input.addEventListener("input", () => {
    fill(input.value, index);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs[index - 1].focus();
    }
    if (event.key === "ArrowRight" && index < inputs.length - 1) {
      event.preventDefault();
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    fill(event.clipboardData?.getData("text") ?? "", index);
  });
}

syncHidden();
inputs.find((input) => !input.value)?.focus();
`;
