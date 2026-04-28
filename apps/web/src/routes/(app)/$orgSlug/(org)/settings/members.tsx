import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlusIcon, TrashIcon, PlusIcon, SendIcon } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@tailorkit/ui/components/avatar";
import { toastManager } from "@tailorkit/ui/components/toast";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@tailorkit/ui/components/tabs";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { roles } from "@tailorkit/auth/lib/permissions";
import { SetHeaderActions } from "@/components/header-actions";

export const Route = createFileRoute("/(app)/$orgSlug/(org)/settings/members")({
  component: OrgSettingsMembers,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.orpc.org.getMembers.queryOptions({ input: { orgSlug: params.orgSlug } }),
      ),
      context.queryClient
        .ensureQueryData(
          context.orpc.org.getOrgInvitations.queryOptions({
            input: { orgSlug: params.orgSlug },
          }),
        )
        .catch(() => null),
    ]);
  },
});

interface InviteRow {
  email: string;
  role: keyof typeof roles;
}

const INVITABLE_ROLES = Object.keys(roles).filter((r) => r !== "owner") as (keyof typeof roles)[];

function InviteMembersDialog({ orgSlug, onSuccess }: { orgSlug: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState<InviteRow[]>([{ email: "", role: "member" }]);
  const [errors, setErrors] = useState<string[]>([]);

  function addRow() {
    setInvites((prev) => [...prev, { email: "", role: "member" }]);
  }

  function removeRow(index: number) {
    setInvites((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof InviteRow, value: string) {
    setInvites((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  const mutation = useMutation({
    mutationFn: async (rows: InviteRow[]) => {
      const results = await Promise.allSettled(
        rows.map((row) =>
          client.org.inviteMember({
            orgSlug,
            email: row.email.trim(),
            role: row.role as "member" | "admin",
          }),
        ),
      );
      const failed = results
        .map((r, i) =>
          r.status === "rejected"
            ? `${rows[i].email}: ${r.reason instanceof Error ? r.reason.message : "Failed"}`
            : null,
        )
        .filter(Boolean) as string[];
      if (failed.length > 0) {
        throw new Error(failed.join("\n"));
      }
    },
    onSuccess: () => {
      setOpen(false);
      setInvites([{ email: "", role: "member" }]);
      setErrors([]);
      toastManager.add({ title: "Invitations sent", type: "success" });
      onSuccess();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Some invitations failed";
      setErrors(message.split("\n"));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = invites.filter((row) => row.email.trim());
    if (valid.length === 0) {
      return;
    }
    setErrors([]);
    mutation.mutate(valid);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setInvites([{ email: "", role: "member" }]);
      setErrors([]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<span />}>
        <Button size="sm">
          <UserPlusIcon />
          Invite members
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="w-full max-w-lg rounded-xl border bg-popover p-6 shadow-xl">
          <DialogTitle className="font-semibold text-lg">Invite members</DialogTitle>
          <DialogDescription className="mt-1 text-muted-foreground text-sm">
            Send email invitations to add people to this organisation.
          </DialogDescription>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2">
              {invites.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    aria-label={`Email address ${i + 1}`}
                    className="flex h-9 min-w-0 flex-1 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="colleague@example.com"
                    type="email"
                    value={row.email}
                    onChange={(e) => updateRow(i, "email", e.target.value)}
                  />
                  <select
                    aria-label={`Role for invite ${i + 1}`}
                    className="flex h-9 rounded-md border bg-transparent px-2 py-1 text-sm capitalize shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={row.role}
                    onChange={(e) => updateRow(i, "role", e.target.value)}
                  >
                    {INVITABLE_ROLES.map((r) => (
                      <option key={r} value={r} className="capitalize">
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                  {invites.length > 1 && (
                    <button
                      aria-label="Remove invite"
                      className="rounded p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      type="button"
                      onClick={() => removeRow(i)}
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground focus-visible:outline-none"
              type="button"
              onClick={addRow}
            >
              <PlusIcon className="size-3.5" />
              Add another
            </button>

            {errors.length > 0 && (
              <div className="space-y-0.5">
                {errors.map((err, i) => (
                  <p key={i} className="text-destructive text-xs">
                    {err}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button size="sm" type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                disabled={invites.every((r) => !r.email.trim()) || mutation.isPending}
                size="sm"
                type="submit"
              >
                {mutation.isPending ? "Sending…" : "Send invitations"}
              </Button>
            </div>
          </form>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}

function OrgSettingsMembers() {
  const { orgSlug } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { data: members } = useSuspenseQuery(
    orpc.org.getMembers.queryOptions({ input: { orgSlug } }),
  );
  const { data: invitations } = useSuspenseQuery(
    orpc.org.getOrgInvitations.queryOptions({ input: { orgSlug } }),
  );

  const currentMember = members.find((m) => m.user.id === session?.user?.id);
  const canManage = currentMember?.role === "owner" || currentMember?.role === "admin";

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => client.org.removeMember({ orgSlug, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries(orpc.org.getMembers.queryOptions({ input: { orgSlug } }));
      toastManager.add({ title: "Member removed", type: "success" });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to remove member";
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  const resendMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      client.org.inviteMember({ orgSlug, email, role: role as "member" | "admin" }),
    onSuccess: () => {
      toastManager.add({ title: "Invitation resent", type: "success" });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to resend invitation";
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  function invalidateAll() {
    queryClient.invalidateQueries(orpc.org.getMembers.queryOptions({ input: { orgSlug } }));
    queryClient.invalidateQueries(orpc.org.getOrgInvitations.queryOptions({ input: { orgSlug } }));
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <SetHeaderActions>
          <InviteMembersDialog orgSlug={orgSlug} onSuccess={invalidateAll} />
        </SetHeaderActions>
      )}

      <Tabs defaultValue="members">
        <TabsList variant="underline">
          <TabsTab value="members">
            Members
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
              {members.length}
            </span>
          </TabsTab>
          <TabsTab value="invitations">
            Pending invitations
            {invitations.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
                {invitations.length}
              </span>
            )}
          </TabsTab>
        </TabsList>

        <TabsPanel value="members" className="mt-4">
          <div className="rounded-lg border divide-y">
            {members.map((member) => {
              const initials = member.user.name
                .split(" ")
                .map((w: string) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const isCurrentUser = member.user.id === session?.user?.id;
              const isOwner = member.role === "owner";

              return (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">
                      {member.user.name}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-muted-foreground text-xs">(you)</span>
                      )}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">{member.user.email}</p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-xs capitalize">
                    {member.role}
                  </span>
                  {canManage && !isCurrentUser && !isOwner && (
                    <button
                      aria-label={`Remove ${member.user.name}`}
                      className="ml-1 rounded p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      disabled={removeMutation.isPending}
                      type="button"
                      onClick={() => removeMutation.mutate(member.id)}
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsPanel>

        <TabsPanel value="invitations" className="mt-4">
          {invitations.length === 0 ? (
            <div className="rounded-lg border px-4 py-12 text-center text-muted-foreground text-sm">
              No pending invitations.
            </div>
          ) : (
            <div className="rounded-lg border divide-y">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {invitation.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{invitation.email}</p>
                    <p className="text-muted-foreground text-xs">
                      Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-xs capitalize">
                    {invitation.role ?? "member"}
                  </span>
                  {canManage && (
                    <button
                      aria-label={`Resend invitation to ${invitation.email}`}
                      className="ml-1 flex items-center gap-1.5 rounded px-2 py-1 text-muted-foreground text-xs hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      disabled={resendMutation.isPending}
                      type="button"
                      onClick={() =>
                        resendMutation.mutate({
                          email: invitation.email,
                          role: invitation.role ?? "member",
                        })
                      }
                    >
                      <SendIcon className="size-3" />
                      Resend
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsPanel>
      </Tabs>
    </div>
  );
}
