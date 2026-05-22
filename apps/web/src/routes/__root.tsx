import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AnchoredToastProvider, ToastProvider } from "@tailorkit/ui/toast";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

import { authClient } from "../lib/auth-client";
import { NotFound } from "../components/not-found";
import {
  fallbackTheme,
  getCachedThemeScript,
  getUserTheme,
  isAppTheme,
  themeCookieName,
  themeStorageKey,
} from "../lib/theme";
import { TanStackDevtools } from "@tanstack/react-devtools";

import appCss from "../index.css?url";
import type { orpc } from "@/lib/orpc";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  shellComponent: RootDocument,
  notFoundComponent: NotFound,

  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
      {
        href: "/favicon.svg",
        rel: "icon",
        type: "image/svg+xml",
      },
      {
        href: "/apple-touch-icon.png",
        rel: "apple-touch-icon",
        sizes: "180x180",
      },
      {
        href: "/favicon-32x32.png",
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
      },
      {
        href: "/favicon-16x16.png",
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
      },
      {
        href: "/site.webmanifest",
        rel: "manifest",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "TailorKit",
      },
    ],
  }),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getCachedThemeScript() }} />
        <HeadContent />
      </head>
      <body className="relative">
        <ThemeProvider
          attribute="class"
          defaultTheme={fallbackTheme}
          disableTransitionOnChange
          enableSystem
          storageKey={themeStorageKey}
        >
          <UserThemeSync />
          <div className="isolate relative flex min-h-svh flex-col">
            <ToastProvider>
              <AnchoredToastProvider>{children}</AnchoredToastProvider>
            </ToastProvider>
          </div>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: "Tanstack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function UserThemeSync() {
  const { setTheme, theme } = useTheme();
  const { data: session, isPending } = authClient.useSession();
  const lastSyncedTheme = useRef<string>(null);
  const cachedTheme = isAppTheme(theme) ? theme : fallbackTheme;
  const userTheme = session ? (getUserTheme(session.user) ?? fallbackTheme) : fallbackTheme;

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (lastSyncedTheme.current === userTheme) {
      return;
    }

    if (userTheme !== cachedTheme) {
      setTheme(userTheme);
    }

    localStorage.setItem(themeStorageKey, userTheme);
    void window.cookieStore?.set({
      name: themeCookieName,
      path: "/",
      sameSite: "lax",
      value: userTheme,
    });
    lastSyncedTheme.current = userTheme;
  }, [cachedTheme, isPending, setTheme, userTheme]);

  return null;
}
