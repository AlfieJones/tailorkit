import { createContext, useContext } from "react";
import type { UseAppsResult } from "../hooks/use-apps";
import type { TailorKitApp } from "../tailor-kit";

export interface TailorRootContextValue {
  apps: TailorKitApp[];
}

export interface RootTailor {
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
