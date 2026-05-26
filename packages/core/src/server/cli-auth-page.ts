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
    <p class="footer-link">Powered by <a href="https://tailorkit.dev/home">TailorKit</a></p>
  </main>
  ${state.status === "idle" ? `<script>${script}</script>` : ""}
</body>
</html>`;
}

function renderCard(state: ApprovalPageState): string {
  if (state.status === "approved") {
    return `<section class="card" aria-labelledby="title">
      <h1 id="title" class="status-title"><span class="status-icon success" aria-hidden="true">✓</span>CLI login approved</h1>
      <p class="description">You can close this tab and return to your terminal.</p>
    </section>`;
  }

  if (state.status === "denied") {
    return `<section class="card" aria-labelledby="title">
      <h1 id="title" class="status-title"><span class="status-icon denied" aria-hidden="true">×</span>CLI login denied</h1>
      <p class="description">You can close this tab and return to your terminal.</p>
    </section>`;
  }

  const code = normalizeCode(state.code);

  return `<section class="card" aria-labelledby="title">
    <h1 id="title">Approve CLI login</h1>
    <p class="description">Enter the code from your terminal.</p>
    ${state.error ? `<p class="error" role="alert">${escapeHtml(state.error)}</p>` : ""}
    <form method="post" novalidate>
      <fieldset>
        <legend>Confirmation code</legend>
        <div class="otp" role="group" aria-label="Confirmation code">
          ${renderOtpInputs(code)}
        </div>
        <input id="userCode" name="userCode" type="hidden" value="${escapeHtml(formatCode(code))}">
        <noscript>
          <label class="fallback-label" for="fallback-code">Code</label>
          <input id="fallback-code" class="fallback-input" name="userCode" value="${escapeHtml(formatCode(code))}" autocomplete="one-time-code">
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
    const separator =
      index === 2 || index === 5 ? `<span class="otp-separator" aria-hidden="true">-</span>` : "";

    return `<input class="otp-input" type="text" inputmode="text" autocomplete="${autocomplete}" maxlength="1" aria-label="Code character ${index + 1}" value="${escapeHtml(character)}">${separator}`;
  }).join("");
}

function normalizeCode(code: string): string {
  return code
    .replaceAll(/[^a-zA-Z0-9]/gu, "")
    .slice(0, 9)
    .toUpperCase();
}

function formatCode(code: string): string {
  return normalizeCode(code).replaceAll(/(.{3})(?=.)/gu, "$1-");
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
  --background: hsl(0, 0%, 96%);
  --card: hsl(0, 0%, 94.7%);
  --border: hsla(0, 0%, 80%, 50%);
  --foreground: hsl(0, 0%, 3.9%);
  --muted: hsl(0, 0%, 96.1%);
  --muted-foreground: hsl(0, 0%, 45.1%);
  --primary: hsl(0, 0%, 3.9%);
  --primary-foreground: hsl(0, 0%, 98%);
  --ring: hsl(0, 0%, 3.9%);
  --destructive: oklch(63.7% 0.237 25.331);
  --success: oklch(72.3% 0.219 149.579);
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --background: #111111;
    --card: #141414;
    --border: hsla(0, 0%, 40%, 20%);
    --foreground: hsl(0, 0%, 92%);
    --muted: hsl(0, 0%, 12.9%);
    --muted-foreground: hsla(0, 0%, 70%, 0.8);
    --primary: hsl(0, 0%, 100%);
    --primary-foreground: hsl(0, 0%, 9%);
    --ring: hsl(0, 0%, 100%);
    --destructive: oklch(63.7% 0.237 25.331);
    --success: oklch(72.3% 0.219 149.579);
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: "Geist Variable", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.page {
  display: grid;
  align-content: center;
  gap: 16px;
  min-height: 100vh;
  justify-items: center;
  padding: 24px;
}

.card {
  width: min(100%, 430px);
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  padding: 28px;
}

h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: 0;
}

.description {
  margin: 10px 0 0;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.55;
}

.error {
  margin: 18px 0 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--destructive);
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
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto repeat(3, minmax(0, 1fr)) auto repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.otp-separator {
  display: grid;
  place-items: center;
  color: var(--muted-foreground);
  font-size: 18px;
  line-height: 1;
}

.otp-input,
.fallback-input {
  width: 100%;
  min-width: 0;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 6px;
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
  border-radius: 6px;
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

.status-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.status-icon.success {
  color: var(--success);
}

.status-icon.denied {
  color: var(--destructive);
}

.footer-link {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 13px;
}

.footer-link a {
  color: var(--foreground);
  text-decoration: none;
}

.footer-link a:hover {
  text-decoration: underline;
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

function format(value) {
  return normalize(value).replace(/(.{3})(?=.)/g, "$1-");
}

function syncHidden() {
  hiddenInput.value = format(inputs.map((input) => input.value).join(""));
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

function focusInput(index) {
  const input = inputs[index];
  input?.focus();
  input?.select();
}

for (const [index, input] of inputs.entries()) {
  input.addEventListener("input", () => {
    const characters = normalize(input.value);
    if (characters.length > 1) {
      input.value = "";
      fill(characters, index);
      return;
    }

    input.value = characters;
    syncHidden();

    if (characters && index < inputs.length - 1) {
      focusInput(index + 1);
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      event.preventDefault();
      inputs[index - 1].value = "";
      syncHidden();
      focusInput(index - 1);
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }
    if (event.key === "ArrowRight" && index < inputs.length - 1) {
      event.preventDefault();
      focusInput(index + 1);
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
