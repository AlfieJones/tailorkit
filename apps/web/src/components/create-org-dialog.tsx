import { useState } from "react";
import { Button } from "@tailorkit/ui/components/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogHeading,
  DialogPopup,
  DialogPortal,
  DialogTrigger,
} from "@tailorkit/ui/components/dialog";
import { isOrgSlugReserved } from "@tailorkit/db/validate-org-slug";
import { useNavigate } from "@tanstack/react-router";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

interface CreateOrgDialogProps {
  children: React.ReactNode;
}

export function CreateOrgDialog({ children }: CreateOrgDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const derivedSlug = slugTouched ? slug : toSlug(name);

  function validateSlug(value: string): string | null {
    if (!value) {
      return "Slug is required.";
    }
    if (!SLUG_RE.test(value)) {
      return "Only lowercase letters, numbers, and hyphens allowed.";
    }
    if (value.length < 2) {
      return "Slug must be at least 2 characters.";
    }
    if (value.length > 48) {
      return "Slug must be at most 48 characters.";
    }
    if (isOrgSlugReserved(value)) {
      return `"${value}" is a reserved name and cannot be used.`;
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateSlug(derivedSlug);
    if (validationError) {
      setError(validationError);
      return;
    }
    // TODO: call API to create org
    document.cookie = `last-org=${derivedSlug}; path=/; max-age=${60 * 60 * 24 * 30}`;
    setOpen(false);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setError(null);
    navigate({ params: { orgSlug: derivedSlug }, to: "/$orgSlug" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span />}>{children}</DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="w-full max-w-md rounded-xl border bg-popover p-6 shadow-xl">
          <DialogHeading className="font-semibold text-lg">Create organisation</DialogHeading>
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
                  setError(validateSlug(e.target.value));
                }}
              />
              {error ? (
                <p className="text-destructive text-xs">{error}</p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  app.tailorkit.com/{derivedSlug || "your-slug"}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button size="sm" type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button disabled={!name.trim()} size="sm" type="submit">
                Create organisation
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
