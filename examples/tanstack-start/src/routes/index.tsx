import { useWorkerUi } from "@tailorkit/sandbox/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { callbackDefinitions, tailorClient } from "../components";
import { getDefaultContext, getScreenContext, screenLabels, screenPathSchema } from "../schema";
import type { ScreenPath } from "../schema";

export const Route = createFileRoute("/")({
  component: Home,
});

const screens = screenPathSchema.options;

function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenPath>("/");
  const mount = useMemo(
    () => ({
      currentScreen,
      defaultContext: getDefaultContext(),
      screenContext: getScreenContext(currentScreen),
    }),
    [currentScreen],
  );
  const { error, node, revision, status } = useWorkerUi({
    callbackDefinitions,
    components: tailorClient.components,
    mount,
    url: "http://localhost:4174/worker.js",
  });

  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">TailorKit build + preview</p>
        <h1>Built worker UI rendered by the host app</h1>
        <p>
          The host loads <code>/tailorkit/worker.js</code>, passes screen context through the hook,
          and renders shared-schema Button and Input components from the UI package.
        </p>
      </section>

      <section className="demo-panel">
        <div className="screen-tabs" role="tablist" aria-label="TailorKit example screens">
          {screens.map((screen) => (
            <button
              aria-selected={screen === currentScreen}
              key={screen}
              role="tab"
              type="button"
              onClick={() => {
                setCurrentScreen(screen);
              }}
            >
              {screenLabels[screen]}
            </button>
          ))}
        </div>
        <div className="status-row">
          <span>Status: {status}</span>
          <span>Revision: {revision ?? "-"}</span>
        </div>
        {error === null ? node : <pre role="alert">{error.message}</pre>}
      </section>
    </main>
  );
}
