import { AppView, Root, useApps, useView } from "tailorkit/react";
import type { DemoUser } from "@examples/shared";
import { createBuilderTransport, BuilderExample } from "@examples/shared";
import { Button } from "@tailorkit/ui/button";
import { SidebarInset, SidebarProvider } from "@tailorkit/ui/sidebar";
import { XIcon } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { TailorKitApp } from "tailorkit/react";
import { AppSidebar } from "#components/app-sidebar";
import tailor from "#lib/tailorkit-client";

type Apps = NonNullable<ReturnType<typeof useApps>["data"]>;

function TailorKitShellWithApps({
  children,
  user,
  signOut,
}: {
  children: ReactNode;
  signOut: () => Promise<void>;
  user: DemoUser;
}) {
  const { data: apps, refetch } = useApps();
  const [currentApp, setCurrentApp] = useState<TailorKitApp | null>(null);

  return (
    <TailorKitShellContent
      apps={apps ?? []}
      currentApp={currentApp}
      refreshApps={refetch}
      onSelectApp={setCurrentApp}
      signOut={signOut}
      user={user}
    >
      {children}
    </TailorKitShellContent>
  );
}

function TailorKitShellContent({
  apps,
  children,
  currentApp,
  onSelectApp,
  refreshApps,
  signOut,
  user,
}: {
  apps: Apps;
  children: ReactNode;
  currentApp: TailorKitApp | null;
  onSelectApp: (app: TailorKitApp | null) => void;
  refreshApps: () => Promise<void>;
  signOut: () => Promise<void>;
  user: DemoUser;
}) {
  useView("/", { context: { user } });
  const [builderSlot, setBuilderSlot] = useState<"panel" | "navbar">("panel");

  return (
    <SidebarProvider>
      <AppSidebar signOut={signOut} user={user} />
      <SidebarInset className="me-12">
        <main className="mx-auto w-full max-w-6xl p-6">{children}</main>
      </SidebarInset>
      <TailorKitAppView app={currentApp} onClose={() => onSelectApp(null)} slot={builderSlot} />
      <BuilderExample
        apps={[]}
        navigation={(placement) => {
          if (placement === "panel" || placement === "navbar") {
            setBuilderSlot(placement);
          }
        }}
        placements={["panel", "navbar"]}
        transport={createBuilderTransport({ afterPublish: refreshApps })}
        renderCandidate={(candidate) => {
          const app = {
            ...candidate.app,
            description: candidate.app.description ?? undefined,
            clientPath: candidate.previewUrl,
            currentDeployment: null,
          };
          return builderSlot === "navbar" ? (
            <AppView app={app} slot="navbar" />
          ) : (
            <AppView app={app} slot="panel" />
          );
        }}
      />
      <TailorKitAppList apps={apps} currentApp={currentApp} onSelect={onSelectApp} />
    </SidebarProvider>
  );
}

function TailorKitAppList({
  apps,
  currentApp,
  onSelect,
}: {
  apps: Apps;
  currentApp: TailorKitApp | null;
  onSelect: (app: TailorKitApp | null) => void;
}) {
  return (
    <aside className="pr-2">
      <div aria-label="Apps" className="flex h-full flex-col items-center justify-center gap-2">
        {apps.map((app) => {
          const label = app.name ?? app.id;
          const isSelected = currentApp?.id === app.id;

          return (
            <Button
              aria-expanded={isSelected}
              aria-pressed={isSelected}
              data-state={isSelected ? "open" : "closed"}
              key={app.id}
              onClick={() => onSelect(isSelected ? null : app)}
              title={label}
              type="button"
              variant="outline"
            >
              {label.charAt(0)}
            </Button>
          );
        })}
      </div>
    </aside>
  );
}

function TailorKitAppView({
  app,
  onClose,
  slot,
}: {
  app: TailorKitApp | null;
  onClose: () => void;
  slot: "panel" | "navbar";
}) {
  if (!app) {
    return null;
  }

  return (
    <aside
      className="fixed top-4 right-16 bottom-4 z-40 flex w-[min(420px,calc(100vw-5rem))] flex-col overflow-hidden rounded-lg border bg-background shadow-lg"
      data-app-id={app.id}
    >
      <header className="flex items-center justify-between border-b p-3">
        <span className="truncate font-medium text-sm">{app.name ?? app.id}</span>
        <Button
          aria-label="Close app panel"
          onClick={onClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <XIcon aria-hidden="true" />
        </Button>
      </header>
      <main className="min-h-0 flex-1 overflow-auto p-4">
        {slot === "navbar" ? (
          <AppView slot="navbar" app={app} />
        ) : (
          <AppView slot="panel" app={app} />
        )}
      </main>
    </aside>
  );
}

export function TailorKitShell(props: Parameters<typeof TailorKitShellWithApps>[0]) {
  return (
    <Root client={tailor}>
      <TailorKitShellWithApps {...props} />
    </Root>
  );
}
