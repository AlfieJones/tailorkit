const rootId = "tailorkit-demo-embed-root";
const scriptOrigin = new URL(import.meta.url).origin;

const defaultTheme = {
  tokens: {
    shadcn: {
      radius: "0.625rem",
      background: "#0b0b0d",
      foreground: "#f4f4f5",
      card: "#0f1012",
      "card-foreground": "#f4f4f5",
      popover: "#0b0b0d",
      "popover-foreground": "#f4f4f5",
      primary: "#ffffff",
      "primary-foreground": "#050506",
      secondary: "#161618",
      "secondary-foreground": "#f4f4f5",
      muted: "#111113",
      "muted-foreground": "#8b8b93",
      accent: "#161618",
      "accent-foreground": "#f4f4f5",
      destructive: "#ef4444",
      "destructive-foreground": "#ffffff",
      info: "#3b82f6",
      "info-foreground": "#ffffff",
      success: "#22c55e",
      "success-foreground": "#050506",
      warning: "#f59e0b",
      "warning-foreground": "#050506",
      border: "#242428",
      input: "#161618",
      ring: "#ffffff",
      sidebar: "#050506",
      "sidebar-foreground": "#f4f4f5",
      "sidebar-primary": "#ffffff",
      "sidebar-primary-foreground": "#050506",
      "sidebar-accent": "#111113",
      "sidebar-accent-foreground": "#f4f4f5",
      "sidebar-border": "#242428",
      "sidebar-ring": "#ffffff",
    },
  },
};

const defaultConfig = {
  customerLabel: "KYBER",
  defaultOpen: true,
  pushPage: true,
  railBorder: true,
  syncChannel: null,
  width: 360,
};

let state = null;
let revision = 0;
let syncSocket = null;
let originalBodyBoxSizing = null;
let originalBodyPaddingRight = null;
let originalBodyTransition = null;
let originalDocumentOverflowX = null;

export function openTailorKitDemo(config = {}) {
  const nextConfig = {
    ...defaultConfig,
    ...state?.config,
    ...config,
  };
  state = {
    config: nextConfig,
    open: nextConfig.defaultOpen !== false,
    selectedApp: state?.selectedApp ?? "todo",
    theme: mergeTheme(defaultTheme, config.theme ?? state?.theme ?? {}),
  };
  revision += 1;
  connectSync(nextConfig.syncChannel);
  render();
  return api;
}

function close() {
  if (!state) {
    return;
  }
  state.open = false;
  render();
}

function toggle() {
  if (!state) {
    openTailorKitDemo();
    return;
  }
  state.open = !state.open;
  render();
}

function destroy() {
  document.querySelector(`#${rootId}`)?.remove();
  disconnectSync();
  restorePageOffset();
  state = null;
}

const api = {
  close,
  destroy,
  open: openTailorKitDemo,
  toggle,
};

globalThis.TailorKitDemo = api;

function render() {
  if (!state) {
    return;
  }
  applyPageOffset();
  let host = document.querySelector(`#${rootId}`);
  if (!host) {
    host = document.createElement("div");
    host.id = rootId;
    document.documentElement.append(host);
  }
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const vars = toCssVars(state.theme);
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      *, *::before, *::after { box-sizing: border-box; }
      .rail {
        position: fixed;
        inset: 0 0 0 auto;
        z-index: 2147483647;
        width: 56px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        justify-content: center;
        padding: 16px 7px;
        ${state.open || state.config.railBorder ? `border-left: 1px solid ${vars["sidebar-border"]};` : ""}
        background: ${vars.sidebar};
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      }
      .icon {
        width: 40px;
        height: 40px;
        border-radius: ${vars.radius};
        display: grid;
        place-items: center;
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 0;
      }
      .panel {
        position: fixed;
        inset: 0 56px 0 auto;
        z-index: 2147483646;
        width: min(${Number(state.config.width) || 360}px, calc(100vw - 56px));
        display: ${state.open ? "flex" : "none"};
        flex-direction: column;
        border-left: 1px solid ${vars.border};
        background: ${vars.background};
        color: ${vars.foreground};
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        box-shadow: 0 20px 50px color-mix(in srgb, ${vars.border} 44%, transparent);
      }
      .panel-frame {
        width: 100%;
        height: 100%;
        border: 0;
        background: ${vars.background};
      }
    </style>
    <aside class="rail">
      <button class="icon" data-app="todo" style="background:${vars.card};color:${state.selectedApp === "todo" && state.open ? vars.foreground : vars["muted-foreground"]};border:1px solid ${vars.border}">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
          <path d="m3 17 2 2 4-4"/><rect x="3" y="4" width="6" height="6" rx="1"/>
        </svg>
      </button>
      <button class="icon" data-app="messages" style="background:${vars.card};color:${state.selectedApp === "messages" && state.open ? vars.foreground : vars["muted-foreground"]};border:1px solid ${vars.border}">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/>
        </svg>
      </button>
    </aside>
    <aside class="panel"><iframe class="panel-frame" src="${escapeHtml(createPanelUrl())}" title="TailorKit demo panel"></iframe></aside>
  `;
  shadow.querySelectorAll("[data-app]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextApp = button.dataset.app;
      if (state.selectedApp === nextApp && state.open) {
        state.open = false;
        render();
        return;
      }
      state.selectedApp = button.dataset.app;
      state.open = true;
      render();
    });
  });
  shadow.querySelector('[data-action="close"]')?.addEventListener("click", close);
}

globalThis.addEventListener("message", (event) => {
  if (event.data?.source === "tailorkit-demo" && event.data.type === "close") {
    close();
  }
});

function connectSync(channel) {
  if (!channel || syncSocket?.readyState === WebSocket.OPEN) {
    return;
  }

  disconnectSync();
  syncSocket = new WebSocket(createSyncUrl(channel));
  syncSocket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type !== "handoff" || !message.handoff || !state) {
        return;
      }
      state.config = {
        ...state.config,
        ...message.handoff.embedConfig,
        syncChannel: channel,
      };
      state.selectedApp = message.handoff.selectedApp ?? state.selectedApp;
      state.theme = mergeTheme(defaultTheme, message.handoff.tailorkitTheme ?? {});
      revision += 1;
      render();
    } catch {
      // Ignore malformed demo sync messages.
    }
  });
}

function disconnectSync() {
  syncSocket?.close();
  syncSocket = null;
}

function createSyncUrl(channel) {
  const url = new URL("/tailorkit-demo-sync", scriptOrigin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("channel", channel);
  return url.toString();
}

function applyPageOffset() {
  if (!state?.config.pushPage || !document.body) {
    restorePageOffset();
    return;
  }

  if (originalBodyPaddingRight === null) {
    originalBodyBoxSizing = document.body.style.boxSizing;
    originalBodyPaddingRight = document.body.style.paddingRight;
    originalBodyTransition = document.body.style.transition;
    originalDocumentOverflowX = document.documentElement.style.overflowX;
  }

  const offset = 56;
  const basePadding = originalBodyPaddingRight || "0px";

  document.body.style.boxSizing = "border-box";
  document.body.style.paddingRight = `calc(${basePadding} + ${offset}px)`;
  document.body.style.transition = mergeTransition(
    originalBodyTransition,
    "padding-right 180ms ease",
  );
  document.documentElement.style.overflowX = "hidden";
}

function restorePageOffset() {
  if (originalBodyPaddingRight === null || !document.body) {
    return;
  }

  document.body.style.boxSizing = originalBodyBoxSizing;
  document.body.style.paddingRight = originalBodyPaddingRight;
  document.body.style.transition = originalBodyTransition;
  document.documentElement.style.overflowX = originalDocumentOverflowX;
  originalBodyBoxSizing = null;
  originalBodyPaddingRight = null;
  originalBodyTransition = null;
  originalDocumentOverflowX = null;
}

function mergeTransition(existing, addition) {
  if (!existing) {
    return addition;
  }
  if (existing.includes("padding-right")) {
    return existing;
  }
  return `${existing}, ${addition}`;
}

function mergeTheme(base, patch) {
  return {
    ...base,
    ...patch,
    tokens: {
      shadcn: { ...getShadcnTokens(base), ...getShadcnTokens(patch) },
    },
  };
}

function createPanelUrl() {
  const payload = {
    embedConfig: state.config,
    selectedApp: state.selectedApp,
    tailorkitTheme: resolveThemeVars(state.theme),
  };
  const encoded = globalThis.btoa(encodeURIComponent(JSON.stringify(payload)));
  return `${scriptOrigin}/embed-panel?demo=${encoded}&revision=${revision}`;
}

function resolveThemeVars(theme) {
  const tokens = getShadcnTokens(theme);
  const style = getComputedStyle(document.documentElement);
  const resolved = Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => {
      if (typeof value === "string" && value.startsWith("var(")) {
        const varName = value.match(/^var\(\s*(--[^,)]+)/)?.[1];
        const computed = varName ? style.getPropertyValue(varName).trim() : "";
        return [key, computed || value];
      }
      return [key, value];
    }),
  );
  return { ...theme, tokens: { shadcn: resolved } };
}

function toCssVars(theme) {
  return getShadcnTokens(theme);
}

function getShadcnTokens(theme) {
  const tokens = theme?.tokens ?? {};
  return {
    ...defaultTheme.tokens.shadcn,
    ...tokens.shadcn,
  };
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[char];
  });
}

openTailorKitDemo();
