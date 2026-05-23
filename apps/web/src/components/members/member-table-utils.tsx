import { flexRender } from "@tanstack/react-table";
import type { Header } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export function renderSortableHeader<TData>(header: Header<TData, unknown>) {
  if (header.isPlaceholder) {
    return null;
  }

  if (!header.column.getCanSort()) {
    return flexRender(header.column.columnDef.header, header.getContext());
  }

  return (
    <button
      className="flex h-full w-full cursor-pointer select-none items-center justify-between gap-2 text-left"
      onClick={header.column.getToggleSortingHandler()}
      type="button"
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      {{
        asc: <ChevronUpIcon aria-hidden="true" className="size-4 shrink-0 opacity-80" />,
        desc: <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 opacity-80" />,
      }[header.column.getIsSorted() as string] ?? null}
    </button>
  );
}

export function getRoleBadgeVariant(role: string): "info" | "warning" | "outline" {
  if (role === "owner") {
    return "info";
  }
  if (role === "admin") {
    return "warning";
  }
  return "outline";
}
