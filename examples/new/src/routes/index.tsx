import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { tk } from "#/lib/tailorkit";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const worker = useMemo(
    () => () => new Worker(new URL("../worker.ts", import.meta.url), { type: "module" }),
    [],
  );

  const { UI, status, error } = tk.useRemoteUI({ worker });

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">TailorKit React Demo</h1>
      {status === "starting" && <p className="text-gray-500">Starting worker…</p>}
      {error !== null && (
        <pre className="rounded border border-red-200 bg-red-50 p-4 text-red-800">
          {error.message}
        </pre>
      )}
      <UI />
    </div>
  );
}
