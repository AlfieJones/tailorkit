import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { UseAppsResult } from "../hooks/use-apps";
import type { TailorKitApp } from "../tailor-kit";

export type AppListOrientation = "horizontal" | "vertical";

export interface RemoteScreenTailor {
  Screen: (props: {
    app: TailorKitApp;
    createWorker?: (url: URL, options: WorkerOptions) => Worker;
    workerUrl?: string | URL;
  }) => ReactNode;
}

export interface TailorRootContextValue {
  activeApp: TailorKitApp | null;
  activeAppId: string | null;
  apps: TailorKitApp[];
  closeAppScreen: () => void;
  contentId: string;
  isAppScreenOpen: boolean;
  orientation: AppListOrientation;
  registerTrigger: (appId: string, element: HTMLElement | null) => void;
  selectApp: (app: TailorKitApp) => void;
  setOrientation: (orientation: AppListOrientation) => void;
  tailor: RemoteScreenTailor;
  triggers: Map<string, HTMLElement>;
}

export interface RootTailor extends RemoteScreenTailor {
  useApps: () => UseAppsResult;
}

export const TailorRootContext = createContext<TailorRootContextValue | null>(null);

export function useTailorRootContext(component: string): TailorRootContextValue {
  const context = useContext(TailorRootContext);
  if (!context) {
    throw new Error(`${component} must be rendered inside tailor.Root.`);
  }
  return context;
}
