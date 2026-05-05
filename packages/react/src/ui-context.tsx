import { useCallback, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { RemoteViewContext } from "./remote-context";
import { RemoteView } from "./remote-view";

interface UIRootProps {
  store: RemoteViewContext["store"];
}

export function UIRoot({ store }: UIRootProps): ReactNode {
  const subscribe = useCallback((l: () => void) => store.subscribeRoot(l), [store]);
  const getSnapshot = useCallback(() => store.getRootId(), [store]);

  const rootId = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (rootId === null) {
    return null;
  }

  return <RemoteView nodeId={rootId} />;
}
