import { useWorkerUi } from "@tailorkit/sandbox/react";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { tailorkitSchema } from "../tailorkit-schema";

export const Route = createFileRoute("/")({ component: Home });

const workerUrl = new URL("../remote-worker.tsx", import.meta.url).href;

const Button = ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
  <button className="remote-button" onClick={onClick} type="button">
    {children}
  </button>
);

const Text = ({ children }: { children?: ReactNode }) => (
  <div className="remote-text">{children}</div>
);

function Home() {
  const remoteUi = useWorkerUi({
    componentValidation: tailorkitSchema.$internal.components,
    components: {
      Button,
      Text,
    },
    url: workerUrl,
  });

  return (
    <main className="app-shell">
      <section className="app-panel">
        <div>
          <p className="eyebrow">Worker-rendered TailorKit UI</p>
          <h1>Basic remote UI</h1>
        </div>

        <div className="remote-surface">
          {remoteUi.status === "starting" ? <p className="muted">Starting worker...</p> : null}
          {remoteUi.error ? <pre className="error">{remoteUi.error.message}</pre> : remoteUi.node}
        </div>

        <p className="muted">Revision: {remoteUi.revision ?? "pending"}</p>
      </section>
    </main>
  );
}
