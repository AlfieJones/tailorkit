import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckSquareIcon, FileTextIcon, UsersIcon } from "lucide-react";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(app)/$orgSlug/$projectSlug/")({
  component: ProjectHome,
});

function ProjectHome() {
  const { orgSlug, projectSlug } = Route.useParams();
  const { data: project } = useSuspenseQuery(
    orpc.project.get.queryOptions({ input: { orgSlug, projectSlug } }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">{project.name}</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {project.description || "Project overview."}
        </p>
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
