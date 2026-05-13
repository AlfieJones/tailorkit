import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CopyIcon, EyeIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@tailorkit/ui/components/button";
import { Input } from "@tailorkit/ui/components/input";
import { toastManager } from "@tailorkit/ui/components/toast";
import { orpc } from "@/utils/orpc";
import { getProjectApiKey } from "@/utils/project-api-key-memory";

export const Route = createFileRoute("/(app)/$orgSlug/$projectSlug/")({
  component: ProjectHome,
});

function maskSecret(value: string) {
  return `${"•".repeat(Math.max(12, value.length - 4))}${value.slice(-4)}`;
}

function ProjectHome() {
  const { orgSlug, projectSlug } = Route.useParams();
  const { data: project } = useSuspenseQuery(
    orpc.project.get.queryOptions({ input: { orgSlug, projectSlug } }),
  );
  const [showKey, setShowKey] = useState(false);
  const [storedApiKey] = useState(() => getProjectApiKey(orgSlug, projectSlug));

  async function copyApiKey() {
    if (!storedApiKey) {
      return;
    }

    await navigator.clipboard.writeText(storedApiKey);
    toastManager.add({ title: "API key copied", type: "success" });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted font-medium text-sm">
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-semibold text-2xl tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground text-sm">Overview</p>
        </div>
      </div>

      {storedApiKey ? (
        <section className="rounded-lg border bg-card">
          <div className="flex items-center gap-3 border-b px-5 py-4">
            <div className="flex size-8 items-center justify-center rounded-md bg-muted">
              <KeyRoundIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="font-medium text-sm">Project API key</h2>
              <p className="text-muted-foreground text-xs">
                This key is only available in this browser session.
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label="Project API key"
                className="font-mono"
                readOnly
                value={showKey ? storedApiKey : maskSecret(storedApiKey)}
              />
              <div className="flex gap-2">
                <Button size="sm" type="button" variant="outline" onClick={copyApiKey}>
                  <CopyIcon />
                  Copy
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setShowKey((value) => !value)}
                >
                  {showKey ? <EyeOffIcon /> : <EyeIcon />}
                  {showKey ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            <Button
              render={
                <Link
                  params={{ orgSlug, projectSlug }}
                  to="/$orgSlug/$projectSlug/settings/api-keys"
                />
              }
              size="sm"
              variant="link"
            >
              Manage API keys
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
