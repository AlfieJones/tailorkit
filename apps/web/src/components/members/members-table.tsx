import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@tailorkit/ui/components/avatar";
import { Badge } from "@tailorkit/ui/components/badge";
import { Button } from "@tailorkit/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tailorkit/ui/components/dropdown-menu";
import { DateAgo } from "@tailorkit/ui/date";
import { Frame } from "@tailorkit/ui/components/frame";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tailorkit/ui/components/table";
import { getRoleBadgeVariant, renderSortableHeader } from "./member-table-utils";

export interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
  userId: string;
  isCurrentUser: boolean;
  isOwner: boolean;
}

export function MembersTable({
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
      (member) =>
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch),
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
            .map((word: string) => word[0])
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
                    {renderSortableHeader(header)}
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
