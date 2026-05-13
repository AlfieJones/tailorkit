import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  TrashIcon,
  UserPlusIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@tailorkit/ui/components/avatar";
import { Badge } from "@tailorkit/ui/components/badge";
import { Button } from "@tailorkit/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@tailorkit/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tailorkit/ui/components/dropdown-menu";
import { DateAgo } from "@tailorkit/ui/date";
import { Frame } from "@tailorkit/ui/components/frame";
import { Input } from "@tailorkit/ui/components/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@tailorkit/ui/components/select";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@tailorkit/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tailorkit/ui/components/table";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { SetHeaderActions } from "@/components/header-actions";
import { client, orpc } from "@/utils/orpc";
import { roles } from "@tailorkit/auth/lib/permissions";

export const Route = createFileRoute("/(app)/$orgSlug/~/(org)/settings/members")({
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

function getRoleBadgeVariant(role: string): "info" | "warning" | "outline" {
  if (role === "owner") {
    return "info";
  }
  if (role === "admin") {
    return "warning";
  }
  return "outline";
}

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
      <DialogTrigger render={<Button size="sm" />}>
        <UserPlusIcon />
        Invite
      </DialogTrigger>
      <DialogPopup>
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>Invite members</DialogTitle>
            <DialogDescription>
              Send email invitations to add people to this organisation.
            </DialogDescription>
          </DialogHeader>

          <DialogPanel className="space-y-3">
            <div className="space-y-2">
              {invites.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    aria-label={`Email address ${i + 1}`}
                    className="flex-1"
                    placeholder="colleague@example.com"
                    type="email"
                    value={row.email}
                    onChange={(e) => updateRow(i, "email", e.target.value)}
                  />
                  <Select
                    value={row.role}
                    onValueChange={(value) => updateRow(i, "role", value as keyof typeof roles)}
                  >
                    <SelectTrigger aria-label={`Role for invite ${i + 1}`} className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {INVITABLE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  {invites.length > 1 && (
                    <Button
                      aria-label="Remove invite"
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      onClick={() => removeRow(i)}
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button size="sm" type="button" variant="ghost" onClick={addRow}>
              <PlusIcon />
              Add another
            </Button>

            {errors.length > 0 && (
              <div className="space-y-0.5">
                {errors.map((err, i) => (
                  <p key={i} className="text-destructive text-xs">
                    {err}
                  </p>
                ))}
              </div>
            )}
          </DialogPanel>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
            <Button
              disabled={invites.every((r) => !r.email.trim()) || mutation.isPending}
              type="submit"
            >
              {mutation.isPending ? "Sending…" : "Send invitations"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
  userId: string;
  isCurrentUser: boolean;
  isOwner: boolean;
}

function MembersTable({
  members,
  canManage,
  onRemove,
  removePending,
  search,
}: {
  members: MemberRow[];
  canManage: boolean;
  onRemove: (memberId: string) => void;
  removePending: boolean;
  search: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return members;
    }

    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(normalizedSearch) ||
        m.email.toLowerCase().includes(normalizedSearch),
    );
  }, [members, search]);

  const columns = useMemo<ColumnDef<MemberRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Member",
        size: 280,
        cell: ({ row }) => {
          const initials = row.original.name
            .split(" ")
            .map((w: string) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-sm leading-tight">
                  {row.original.name}
                  {row.original.isCurrentUser && (
                    <span className="ml-1.5 text-muted-foreground text-xs font-normal">(you)</span>
                  )}
                </p>
                <p className="truncate text-muted-foreground text-xs leading-tight">
                  {row.original.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 110,
        cell: ({ row }) => (
          <Badge variant={getRoleBadgeVariant(row.original.role)} size="lg">
            {row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1)}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Last Active",
        size: 140,
        sortingFn: "datetime",
        cell: ({ row }) => <DateAgo date={row.original.createdAt} />,
      },
      {
        id: "actions",
        size: 80,
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {canManage && !row.original.isCurrentUser && !row.original.isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Open member actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    disabled={removePending}
                    variant="destructive"
                    onClick={() => onRemove(row.original.id)}
                  >
                    <TrashIcon />
                    Remove member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ),
      },
    ],
    [canManage, onRemove, removePending],
  );

  const table = useReactTable({
    columns,
    data: filtered,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <Frame className="w-full">
      <Table variant="card" className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.getSize();
                return (
                  <TableHead
                    key={header.id}
                    style={columnSize ? { width: `${columnSize}px` } : undefined}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: (
                            <ChevronUpIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow data-state={row.getIsSelected() ? "selected" : undefined} key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Frame>
  );
}

interface InvitationRow {
  id: string;
  email: string;
  role: string | null;
  expiresAt: Date | string;
}

function InvitationsTable({
  invitations,
  canManage,
  onResend,
  onRevoke,
  resendPending,
  revokePending,
}: {
  invitations: InvitationRow[];
  canManage: boolean;
  onResend: (invitation: InvitationRow) => void;
  onRevoke: (invitationId: string) => void;
  resendPending: boolean;
  revokePending: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "email", desc: false }]);

  const columns = useMemo<ColumnDef<InvitationRow>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        size: 280,
        cell: ({ row }) => {
          const initials = row.original.email.slice(0, 2).toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <p className="truncate font-medium text-sm">{row.original.email}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 110,
        cell: ({ row }) => {
          const role = row.original.role ?? "member";
          return (
            <Badge variant={getRoleBadgeVariant(role)} size="lg">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        size: 140,
        sortingFn: "datetime",
        cell: ({ row }) => <DateAgo date={row.original.expiresAt} />,
      },
      {
        id: "actions",
        size: 80,
        enableSorting: false,
        header: () => null,
        cell: ({ row }) =>
          canManage ? (
            <div className="flex items-center justify-end gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Open invitation actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem disabled={resendPending} onClick={() => onResend(row.original)}>
                    <SendIcon />
                    Resend email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={revokePending}
                    variant="destructive"
                    onClick={() => onRevoke(row.original.id)}
                  >
                    <TrashIcon />
                    Revoke invite
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null,
      },
    ],
    [canManage, onResend, onRevoke, resendPending, revokePending],
  );

  const table = useReactTable({
    columns,
    data: invitations,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (invitations.length === 0) {
    return (
      <div className="rounded-lg border px-4 py-12 text-center text-muted-foreground text-sm">
        No pending invitations.
      </div>
    );
  }

  return (
    <Frame className="w-full">
      <Table variant="card" className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.getSize();
                return (
                  <TableHead
                    key={header.id}
                    style={columnSize ? { width: `${columnSize}px` } : undefined}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: (
                            <ChevronUpIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow data-state={row.getIsSelected() ? "selected" : undefined} key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Frame>
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

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => client.org.revokeInvitation({ orgSlug, invitationId }),
    onSuccess: () => {
      queryClient.invalidateQueries(
        orpc.org.getOrgInvitations.queryOptions({ input: { orgSlug } }),
      );
      toastManager.add({ title: "Invitation revoked", type: "success" });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to revoke invitation";
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  function invalidateAll() {
    queryClient.invalidateQueries(orpc.org.getMembers.queryOptions({ input: { orgSlug } }));
    queryClient.invalidateQueries(orpc.org.getOrgInvitations.queryOptions({ input: { orgSlug } }));
  }

  const [search, setSearch] = useState("");

  const memberRows = useMemo<MemberRow[]>(
    () =>
      members.map((m) => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        createdAt: m.createdAt,
        userId: m.user.id,
        isCurrentUser: m.user.id === session?.user?.id,
        isOwner: m.role === "owner",
      })),
    [members, session?.user?.id],
  );

  const handleRemoveMember = useCallback(
    (id: string) => {
      removeMutation.mutate(id);
    },
    [removeMutation.mutate],
  );

  const handleResendInvitation = useCallback(
    (inv: InvitationRow) => {
      resendMutation.mutate({ email: inv.email, role: inv.role ?? "member" });
    },
    [resendMutation.mutate],
  );

  const handleRevokeInvitation = useCallback(
    (id: string) => {
      revokeMutation.mutate(id);
    },
    [revokeMutation.mutate],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Members</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage who has access to this organisation.
        </p>
      </div>

      {canManage && (
        <SetHeaderActions>
          <InviteMembersDialog orgSlug={orgSlug} onSuccess={invalidateAll} />
        </SetHeaderActions>
      )}

      <Tabs defaultValue="members">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTab value="members">Members</TabsTab>
            <TabsTab value="invitations">
              Pending invitations
              {invitations.length > 0 && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums">
                  {invitations.length}
                </span>
              )}
            </TabsTab>
          </TabsList>

          <div className="relative max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsPanel value="members" className="mt-4">
          <MembersTable
            members={memberRows}
            canManage={canManage}
            onRemove={handleRemoveMember}
            removePending={removeMutation.isPending}
            search={search}
          />
        </TabsPanel>

        <TabsPanel value="invitations" className="mt-4">
          <InvitationsTable
            invitations={invitations}
            canManage={canManage}
            onResend={handleResendInvitation}
            onRevoke={handleRevokeInvitation}
            resendPending={resendMutation.isPending}
            revokePending={revokeMutation.isPending}
          />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
