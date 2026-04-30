import { exposePreactWorker } from "@tailorkit/sandbox-ui/worker";
import { h } from "preact";
import { App } from "./app";

exposePreactWorker(self as unknown as MessagePort, () => h(App, null));
