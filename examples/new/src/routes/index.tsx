import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { tk } from "#/lib/tailorkit";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const appUrl = useMemo(() => new URL("http://127.0.0.1:4175/client.js"), []);
  const props = useMemo(
    () => ({
      context: {
        page: {
          title: "TailorKit client screen",
        },
        user: {
          id: "user_example",
          name: "Example user",
        },
      },
    }),
    [],
  );

  const { UI, status, error } = tk.useRemoteUI({ appUrl, props });

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
