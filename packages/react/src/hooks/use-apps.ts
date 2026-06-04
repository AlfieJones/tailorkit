import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { TailorKitApp, TailorKitAppsSnapshot, TailorKitStore } from "../tailor-kit";

export interface UseAppsResult {
  data: TailorKitApp[] | undefined;
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
  status: "error" | "idle" | "loading" | "ready";
}

export function createUseApps(store: TailorKitStore): () => UseAppsResult {
  return function useApps(): UseAppsResult {
    const snapshot = useSyncExternalStore(
      store.subscribe,
      store.getAppsSnapshot,
      store.getAppsSnapshot,
    );

    useEffect(() => {
      void store.fetchApps();
    }, []);

    const refetch = useCallback(() => store.fetchApps({ force: true }), []);

    return toUseAppsResult(snapshot, refetch);
  };
}

function toUseAppsResult(
  snapshot: TailorKitAppsSnapshot,
  refetch: () => Promise<void>,
): UseAppsResult {
  return {
    data: snapshot.status === "ready" ? snapshot.apps : undefined,
    error: snapshot.error,
    isError: snapshot.status === "error",
    isLoading: snapshot.status === "loading",
    isPending: snapshot.status === "idle" || snapshot.status === "loading",
    isSuccess: snapshot.status === "ready",
    refetch,
    status: snapshot.status,
  };
}
