import { createFileRoute } from "@tanstack/react-router";
import { CheckSquareIcon, FileTextIcon, UsersIcon } from "lucide-react";

export const Route = createFileRoute("/(app)/$orgSlug/$projectSlug/")({
  component: ProjectHome,
});

function ProjectHome() {
  const { projectSlug } = Route.useParams();
  const projectName = projectSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">{projectName}</h1>
        <p className="mt-1 text-muted-foreground text-sm">Project overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(
          [
            { icon: CheckSquareIcon, label: "Open tasks", value: "—" },
            { icon: UsersIcon, label: "Contributors", value: "—" },
            { icon: FileTextIcon, label: "Docs", value: "—" },
          ] as const
        ).map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 rounded-lg border bg-card p-4">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg leading-none">{value}</p>
              <p className="mt-0.5 text-muted-foreground text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
