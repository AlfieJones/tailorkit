import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { CopyIcon, EyeIcon, EyeOffIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { DateAgo } from "@tailorkit/ui/date";
import { Button } from "@tailorkit/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@tailorkit/ui/components/dialog";
import { Field, FieldLabel } from "@tailorkit/ui/components/field";
import { Input } from "@tailorkit/ui/components/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@tailorkit/ui/components/select";
import { toastManager } from "@tailorkit/ui/components/toast";
import { client, orpc } from "@/utils/orpc";
import { getProjectApiKey, setProjectApiKey } from "@/utils/project-api-key-memory";

export const Route = createFileRoute("/(app)/$orgSlug/$projectSlug/settings/api-keys")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      context.orpc.project.apiKeys.queryOptions({
        input: { orgSlug: params.orgSlug, projectSlug: params.projectSlug },
      }),
    ),
  component: ProjectApiKeysPage,
});

const gracePeriodOptions = [
  { label: "Immediately", value: "0" },
  { label: "After 15 minutes", value: "900" },
  { label: "After 1 hour", value: "3600" },
  { label: "After 1 day", value: "86400" },
] as const;

function keyLabel(key: { id: string; prefix?: string | null; start?: string | null }) {
  return `${key.prefix ?? key.start ?? key.id}${"*".repeat(8)}`;
}

function maskSecretWithPrefix(value: string, prefix: string) {
  if (!value.startsWith(prefix)) {
    return `${prefix}${"*".repeat(8)}`;
  }

  return `${prefix}${"*".repeat(Math.max(8, value.length - prefix.length))}`;
}

function getApiKeyDisplayValue({
  activeKey,
  showStoredApiKey,
  storedApiKey,
}: {
  activeKey: { id: string; prefix?: string | null; start?: string | null };
  showStoredApiKey: boolean;
  storedApiKey: string | null;
}) {
  if (!storedApiKey) {
    return keyLabel(activeKey);
  }

  if (showStoredApiKey) {
    return storedApiKey;
  }

  return maskSecretWithPrefix(storedApiKey, activeKey.prefix ?? activeKey.start ?? "");
}

function ProjectApiKeysPage() {
  const { orgSlug, projectSlug } = Route.useParams();
  const queryClient = useQueryClient();
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState("3600");
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
  const [newApiKeyDialogOpen, setNewApiKeyDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showStoredApiKey, setShowStoredApiKey] = useState(false);
  const [storedApiKey, setStoredApiKey] = useState(() => getProjectApiKey(orgSlug, projectSlug));
  const { data: apiKeys } = useSuspenseQuery(
    orpc.project.apiKeys.queryOptions({ input: { orgSlug, projectSlug } }),
  );

  const rotateMutation = useMutation({
    mutationFn: () =>
      client.project.rotateApiKey({
        gracePeriodSeconds: Number(gracePeriodSeconds),
        orgSlug,
        projectSlug,
      }),
    onSuccess: async (result) => {
      setNewApiKey(result.apiKey.key);
      setStoredApiKey(result.apiKey.key);
      setShowStoredApiKey(false);
      setRotateDialogOpen(false);
      setNewApiKeyDialogOpen(true);
      setProjectApiKey(orgSlug, projectSlug, result.apiKey.key);
      await queryClient.invalidateQueries(
        orpc.project.apiKeys.queryOptions({ input: { orgSlug, projectSlug } }),
      );
      toastManager.add({ title: "API key rotated", type: "success" });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to rotate API key";
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  async function copyApiKey(value: string) {
    await navigator.clipboard.writeText(value);
    toastManager.add({ title: "API key copied", type: "success" });
  }

  const activeKey = apiKeys.active[0] ?? null;
  const expiringKeys = apiKeys.rotating;

  return (
    <div className="mx-auto max-w-3xl w-full space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">API keys</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage the secret key used to authenticate your backend with this project.
        </p>
      </div>

      {/* New key reveal dialog */}
      <Dialog open={newApiKeyDialogOpen} onOpenChange={setNewApiKeyDialogOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>New API key</DialogTitle>
            <DialogDescription>
              This key is only shown once. Copy it now — it won't be visible again after you close
              this dialog.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label="New API key"
                className="font-mono"
                readOnly
                value={newApiKey ?? ""}
              />
              <Button
                disabled={!newApiKey}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  if (newApiKey) {
                    copyApiKey(newApiKey);
                  }
                }}
              >
                <CopyIcon />
                Copy
              </Button>
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Done</DialogClose>
          </DialogFooter>
        </DialogPopup>
      </Dialog>

      {/* Rotate key dialog */}
      <Dialog open={rotateDialogOpen} onOpenChange={setRotateDialogOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Rotate API key</DialogTitle>
            <DialogDescription>
              Choose when the current key should stop working after the new key is created.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <Field>
              <FieldLabel>Current key stops working</FieldLabel>
              <Select
                items={gracePeriodOptions}
                value={gracePeriodSeconds}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    setGracePeriodSeconds(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {gracePeriodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button
              disabled={rotateMutation.isPending}
              type="button"
              onClick={() => rotateMutation.mutate()}
            >
              <RefreshCwIcon />
              {rotateMutation.isPending ? "Rotating…" : "Rotate key"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Project key</CardTitle>
          <CardDescription>Used to by your platform to integrate with Tailorkit.</CardDescription>
          <CardAction>
            <Button
              disabled={rotateMutation.isPending}
              size="sm"
              type="button"
              variant="destructive-outline"
              onClick={() => setRotateDialogOpen(true)}
            >
              <RefreshCwIcon />
              Rotate
            </Button>
          </CardAction>
        </CardHeader>

        <CardPanel className="pt-0">
          {activeKey ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex h-8 min-w-0 flex-1 items-center overflow-x-auto rounded-lg border bg-muted px-3 font-mono text-sm sm:h-7">
                <p className="whitespace-nowrap">
                  {getApiKeyDisplayValue({ activeKey, showStoredApiKey, storedApiKey })}
                </p>
              </div>
              {storedApiKey ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => copyApiKey(storedApiKey)}
                  >
                    <CopyIcon />
                    Copy
                  </Button>
                  <Button
                    aria-label={showStoredApiKey ? "Hide API key" : "Show API key"}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                    onClick={() => setShowStoredApiKey((value) => !value)}
                  >
                    {showStoredApiKey ? <EyeOffIcon /> : <EyeIcon />}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No API key yet.</p>
          )}
        </CardPanel>
      </Card>

      {expiringKeys.length > 0 ? (
        <div>
          <p className="mb-3 font-medium text-sm">Expiring keys</p>
          <div className="space-y-2">
            {expiringKeys.map((key) => (
              <Card key={key.id}>
                <CardPanel>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm">{keyLabel(key)}</p>
                    <p className="mt-0.5 text-muted-foreground text-xs">
                      Expires{" "}
                      {key.expiresAt ? (
                        <DateAgo className="inline" date={key.expiresAt} />
                      ) : (
                        "never"
                      )}
                    </p>
                  </div>
                </CardPanel>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
