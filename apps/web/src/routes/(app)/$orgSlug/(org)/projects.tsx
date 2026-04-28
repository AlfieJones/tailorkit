import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderIcon, FolderPlusIcon } from "lucide-react";
import { Button } from "@tailorkit/ui/components/button";

export const Route = createFileRoute("/(app)/$orgSlug/(org)/projects")({
  component: ProjectsPage,
});

const MOCK_PROJECTS = [
  {
    description: "Redesign the marketing site",
    name: "Website Redesign",
    slug: "website-redesign",
  },
  { description: "iOS and Android app", name: "Mobile App", slug: "mobile-app" },
  { description: "Next generation API", name: "API v2", slug: "api-v2" },
];

function ProjectsPage() {
  const { orgSlug } = Route.useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Projects</h1>
          <p className="mt-1 text-muted-foreground text-sm">All projects in this organisation.</p>
        </div>
        <Button size="sm">
          <FolderPlusIcon />
          New project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_PROJECTS.map((project) => (
          <Link
            key={project.slug}
            className="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            params={{ orgSlug, projectSlug: project.slug }}
            to="/$orgSlug/$projectSlug"
          >
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                <FolderIcon className="size-3.5 text-muted-foreground" />
              </div>
              <span className="font-medium text-sm">{project.name}</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">{project.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
