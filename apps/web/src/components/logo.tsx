import { cn } from "@tailorkit/ui/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-6 items-center justify-center rounded-md bg-primary">
        <svg
          aria-hidden="true"
          className="size-3.5 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 3h12M6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3M9 9h6M9 12h6M9 15h4"
          />
        </svg>
      </div>
      <span className="font-semibold text-sm tracking-tight">TailorKit</span>
    </div>
  );
}
