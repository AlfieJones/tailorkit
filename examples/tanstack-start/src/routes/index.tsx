import { useWorkerUi } from "@tailorkit/sandbox-ui/react";
import { createFileRoute } from "@tanstack/react-router";

// oxlint-disable-next-line import/default
import demoWorker from "../demo.worker?worker";

import { RemoteButton } from "../remote-button";
import { handlerDefinitions } from "../tailorkit.config";

export const Route = createFileRoute("/")({
  component: Home,
});

const components = {
  Button: RemoteButton,
};

const createWorker = () => new demoWorker();

function Home() {
  const { error, node, revision, status } = useWorkerUi({
    callbackDefinitions: handlerDefinitions,
    components,
    worker: createWorker,
  });

  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">TailorKit SDK + sandbox-ui</p>
        <h1>Worker-rendered UI with typed callbacks</h1>
        <p>
          The Preact worker renders the tree, the React host renders the custom Button, and the SDK
          supplies callback schemas for client-side input/output validation.
        </p>
      </section>

      <section className="demo-panel">
        <div className="status-row">
          <span>Status: {status}</span>
          <span>Revision: {revision ?? "-"}</span>
        </div>
        {error === null ? node : <pre role="alert">{error.message}</pre>}
      </section>
    </main>
  );
}
