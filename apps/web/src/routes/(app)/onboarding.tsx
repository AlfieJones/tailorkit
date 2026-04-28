import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Card,
  CardFrame,
  CardFrameFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import { Button } from "@tailorkit/ui/components/button";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useAppForm } from "@tailorkit/ui/form";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { validateOrgSlug } from "@tailorkit/db/validate-org-slug";
import { z } from "zod";
import { orpc, client } from "@/utils/orpc";

export const Route = createFileRoute("/(app)/onboarding")({
  component: Onboarding,
  loader: async ({ context }) => {
    const [orgs] = await Promise.all([
      context.queryClient.ensureQueryData(context.orpc.user.getOrgs.queryOptions()),
      context.queryClient.ensureQueryData(context.orpc.user.getPendingInvitations.queryOptions()),
    ]);

    if (orgs.length > 0) {
      throw redirect({ to: "/" });
    }
  },
});

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

const orgSchema = z.object({
  name: z.string().min(1, "Name is required."),
  slug: z.string().superRefine((v, ctx) => {
    const res = validateOrgSlug(v);
    if (!res.valid) {
      ctx.addIssue({
        code: "custom",
        message: res.reason ?? "This slug is reserved and cannot be used.",
      });
    }
  }),
});

interface Invitation {
  id: string;
  role?: string | null;
  organization: { name: string } | null;
}

interface PendingInvitationsCardProps {
  invitations: Invitation[];
  onDismiss: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

function PendingInvitationsCard({
  invitations,
  onDismiss,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: PendingInvitationsCardProps) {
  return (
    <CardFrame>
      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
        </CardHeader>

        <CardPanel className="space-y-2">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{inv.organization?.name}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  Invited as {inv.role ?? "member"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  disabled={isRejecting || isAccepting}
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(inv.id)}
                >
                  Decline
                </Button>
                <Button
                  disabled={isAccepting || isRejecting}
                  size="sm"
                  onClick={() => onAccept(inv.id)}
                >
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </CardPanel>
      </Card>

      <CardFrameFooter>
        <button
          className="text-muted-foreground text-xs hover:text-foreground transition-colors"
          type="button"
          onClick={onDismiss}
        >
          Skip invitations
        </button>
      </CardFrameFooter>
    </CardFrame>
  );
}

interface CreateOrgCardProps {
  onSubmit: (values: { name: string; slug: string }) => Promise<void>;
}

function CreateOrgCard({ onSubmit }: CreateOrgCardProps) {
  const slugTouched = useRef(false);

  const form = useAppForm({
    defaultValues: { name: "", slug: "" },
    validators: { onSubmit: orgSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <CardFrame className="max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create an organisation</CardTitle>
        </CardHeader>

        <form
          id="create-org-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardPanel className="flex flex-col gap-4">
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Name"
                  placeholder="Acme Corp"
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
                  description={`tailorkit.com/${field.state.value || "your-slug"}`}
                  label="Slug"
                  placeholder="acme-corp"
                  onChange={(e) => {
                    slugTouched.current = true;
                    const sanitized = toSlug(e.target.value);
                    field.handleChange(sanitized);
                  }}
                />
              )}
            </form.AppField>
          </CardPanel>
        </form>
      </Card>

      <CardFrameFooter className="flex gap-4 justify-end">
        <Button render={<Link to="/account/settings" />} variant={"ghost"}>
          Skip for now
        </Button>

        <form.AppForm>
          <form.SubmitButton form="create-org-form" size="sm">
            Create organisation
          </form.SubmitButton>
        </form.AppForm>
      </CardFrameFooter>
    </CardFrame>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dismissedInvites, setDismissedInvites] = useState(false);

  const { data: invitations } = useSuspenseQuery(orpc.user.getPendingInvitations.queryOptions());

  const acceptMutation = useMutation({
    mutationFn: (invitationId: string) => client.user.acceptInvitation({ invitationId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(orpc.user.getOrgs.queryOptions());
      const slug = (data as { organization?: { slug?: string } })?.organization?.slug;
      if (slug) {
        navigate({ params: { orgSlug: slug }, to: "/$orgSlug" });
      } else {
        navigate({ to: "/" });
      }
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to accept invitation";
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (invitationId: string) => client.user.rejectInvitation({ invitationId }),
    onSuccess: () => {
      queryClient.invalidateQueries(orpc.user.getPendingInvitations.queryOptions());
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to decline invitation";
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  async function handleCreateOrg(values: { name: string; slug: string }) {
    const data = await client.user.createOrg({ name: values.name.trim(), slug: values.slug });
    queryClient.invalidateQueries(orpc.user.getOrgs.queryOptions());
    const orgSlug = (data as { slug?: string })?.slug ?? values.slug;
    navigate({ params: { orgSlug }, to: "/$orgSlug" });
  }

  const pendingInvitations = invitations ?? [];
  const showInvitations = pendingInvitations.length > 0 && !dismissedInvites;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        {showInvitations && (
          <PendingInvitationsCard
            invitations={pendingInvitations}
            isAccepting={acceptMutation.isPending}
            isRejecting={rejectMutation.isPending}
            onAccept={(id) => acceptMutation.mutate(id)}
            onDismiss={() => setDismissedInvites(true)}
            onReject={(id) => rejectMutation.mutate(id)}
          />
        )}

        <CreateOrgCard onSubmit={handleCreateOrg} />
      </div>
    </div>
  );
}
