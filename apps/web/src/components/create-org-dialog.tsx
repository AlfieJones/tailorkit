import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@tailorkit/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogPopup,
  DialogTrigger,
} from "@tailorkit/ui/components/dialog";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useAppForm } from "@tailorkit/ui/form";
import { validateOrgSlug } from "@tailorkit/db/validate-org-slug";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { orpc, client } from "@/utils/orpc";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "");
}

const orgSchema = z.object({
  name: z.string().min(1, "Name is required."),
  slug: z.string().superRefine((value, ctx) => {
    const result = validateOrgSlug(value);
    if (!result.valid) {
      ctx.addIssue({
        code: "custom",
        message: result.reason ?? "This slug is reserved and cannot be used.",
      });
    }
  }),
});

interface CreateOrgDialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateOrgDialog({ children, open: openProp, onOpenChange }: CreateOrgDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openInternal, setOpenInternal] = useState(false);
  const slugTouched = useRef(false);

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setOpenInternal;

  const createMutation = useMutation({
    mutationFn: (input: { name: string; slug: string }) => client.user.createOrg(input),
    onSuccess: (data, input) => {
      queryClient.invalidateQueries(orpc.user.getOrgs.queryOptions());
      const orgSlug = (data as { slug?: string })?.slug ?? input.slug;
      setOpen(false);
      resetForm();
      navigate({ params: { orgSlug }, to: "/$orgSlug/~/projects" });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to create organisation";
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  const form = useAppForm({
    defaultValues: { name: "", slug: "" },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
      } catch {
        // The mutation onError handler displays the toast.
      }
    },
    validators: { onSubmit: orgSchema },
  });

  function resetForm() {
    slugTouched.current = false;
    form.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children !== undefined && <DialogTrigger render={<span />}>{children}</DialogTrigger>}
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create organisation</DialogTitle>
          <DialogDescription>
            Your organisation will get a unique URL based on its slug.
          </DialogDescription>
        </DialogHeader>

        <form
          className="contents"
          id="create-org-dialog-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogPanel className="flex flex-col gap-4">
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  autoComplete="organization"
                  label="Name"
                  placeholder="Acme Corp"
                  required
                  type="text"
                  onChange={(e) => {
                    if (!slugTouched.current) {
                      form.setFieldValue("slug", toSlug(e.target.value));
                    }
                  }}
                />
              )}
            </form.AppField>

            <form.AppField name="slug">
              {(field) => (
                <field.TextField
                  autoComplete="off"
                  description={`tailorkit.com/${field.state.value || "your-slug"}`}
                  label="Slug"
                  placeholder="acme-corp"
                  required
                  type="text"
                  onChange={(e) => {
                    slugTouched.current = true;
                    field.handleChange(toSlug(e.target.value));
                  }}
                />
              )}
            </form.AppField>
          </DialogPanel>

          <DialogFooter>
            <DialogClose render={<Button size="sm" type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <form.AppForm>
              <form.SubmitButton form="create-org-dialog-form" size="sm">
                Create organisation
              </form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}
