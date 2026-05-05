import { createContext } from "react";
import type { HostToWorkerPayload } from "@tailorkit/sandbox/protocol";
import type { NodeStore } from "./node-store";

export interface RemoteViewContext {
  components: Record<string, unknown>;
  dispatch: (payload: HostToWorkerPayload) => void;
  store: NodeStore;
}

export const RemoteUIContext = createContext<RemoteViewContext | null>(null);
