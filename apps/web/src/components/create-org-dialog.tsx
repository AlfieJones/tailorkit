import { useState } from "react";
import { Button } from "@tailorkit/ui/components/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogPopup,
  DialogPortal,
  DialogTrigger,
} from "@tailorkit/ui/components/dialog";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "@/utils/orpc";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function validateSlug(slug: string): string | null {
  if (!slug) {
    return "Slug is required";
  }
  if (slug.length < 2) {
    return "Slug must be at least 2 characters";
  }
  if (slug.length > 48) {
    return "Slug must be 48 characters or fewer";
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return "Slug may only contain lowercase letters, numbers, and hyphens";
  }
  return null;
}

interface CreateOrgDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateOrgDialog({ children, open: openProp, onOpenChange }: CreateOrgDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openInternal, setOpenInternal] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setOpenInternal;

  const derivedSlug = slugTouched ? slug : toSlug(name);

  const createMutation = useMutation({
    mutationFn: (input: { name: string; slug: string }) => client.user.createOrg(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries(orpc.user.getOrgs.queryOptions());
      const orgSlug = (data as { slug?: string })?.slug ?? derivedSlug;
      setOpen(false);
      setName("");
      setSlug("");
      setSlugTouched(false);
      setError(null);
      navigate({ params: { orgSlug }, to: "/$orgSlug" });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to create organisation";
      setError(message);
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateSlug(derivedSlug);
    if (validationError) {
      setError(validationError);
      return;
    }
    createMutation.mutate({ name: name.trim(), slug: derivedSlug });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children !== undefined && <DialogTrigger render={<span />}>{children}</DialogTrigger>}
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="w-full max-w-md rounded-xl border bg-popover p-6 shadow-xl">
          <DialogTitle className="font-semibold text-lg">Create organisation</DialogTitle>
          <DialogDescription className="mt-1 text-muted-foreground text-sm">
            Your organisation will get a unique URL based on its slug.
          </DialogDescription>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="font-medium text-sm">Name</label>
              <input
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Acme Corp"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) {
                    setError(null);
                  }
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-sm">Slug</label>
              <input
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="acme-corp"
                value={derivedSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
              {error ? (
                <p className="text-destructive text-xs">{error}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  tailorkit.com/{derivedSlug || "your-slug"}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button size="sm" type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button disabled={!name.trim() || createMutation.isPending} size="sm" type="submit">
                {createMutation.isPending ? "Creating…" : "Create organisation"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
