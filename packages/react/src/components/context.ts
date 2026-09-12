import { createContext, useContext } from "react";

import type { TailorKitApp, TailorKitStore, TailorKitInstance } from "../tailor-kit";

export interface TailorRootContextValue {
  apps: TailorKitApp[];
  store: TailorKitStore;
  client: TailorKitInstance;
}

export const TailorRootContext = createContext<TailorRootContextValue | null>(null);

export function useTailorRootContext(component: string): TailorRootContextValue {
  const context = useContext(TailorRootContext);
  if (!context) {
    throw new Error(`${component} must be rendered inside Root.`);
  }
  return context;
}
