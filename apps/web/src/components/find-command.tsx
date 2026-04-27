import { useEffect, useState } from "react";
import { FileIcon, FolderIcon, LifeBuoyIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { Button } from "@tailorkit/ui/components/button";
import { Kbd } from "@tailorkit/ui/components/kbd";
import {
  CommandDialog,
  CommandDialogBackdrop,
  CommandDialogPortal,
  CommandDialogTrigger,
  CommandDialogViewport,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@tailorkit/ui/components/command";
import { useNavigate } from "@tanstack/react-router";

interface FindCommandProps {
  orgSlug?: string;
}

export function FindCommand({ orgSlug }: FindCommandProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to } as Parameters<typeof navigate>[0]);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandDialogTrigger
        render={
          <Button
            className="w-full justify-start gap-2 font-normal text-muted-foreground"
            size="sm"
            variant="outline"
          />
        }
      >
        <SearchIcon className="size-3.5 shrink-0" />
        <span className="flex-1 text-left">Find anything…</span>
        <Kbd keys={["⌘", "K"]} />
      </CommandDialogTrigger>

      <CommandDialogPortal>
        <CommandDialogBackdrop />
        <CommandDialogViewport>
          <div className="w-full max-w-lg overflow-hidden rounded-xl border bg-popover shadow-xl">
            <CommandInput placeholder="Search…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {orgSlug && (
                <CommandGroup heading="Navigation">
                  <CommandItem onSelect={() => go(`/${orgSlug}`)}>
                    <FolderIcon />
                    Dashboard
                  </CommandItem>
                  <CommandItem onSelect={() => go(`/${orgSlug}/projects`)}>
                    <FileIcon />
                    Projects
                  </CommandItem>
                  <CommandItem onSelect={() => go(`/${orgSlug}/support`)}>
                    <LifeBuoyIcon />
                    Support
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem onSelect={() => go("/settings")}>
                  <SettingsIcon />
                  Account settings
                </CommandItem>
                {orgSlug && (
                  <CommandItem onSelect={() => go(`/${orgSlug}/settings`)}>
                    <SettingsIcon />
                    Org settings
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </div>
        </CommandDialogViewport>
      </CommandDialogPortal>
    </CommandDialog>
  );
}
