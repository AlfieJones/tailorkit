import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import type { ReactNode } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { FolderIcon, FolderPlusIcon } from "lucide-react";
import { Button } from "@tailorkit/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tailorkit/ui/components/empty";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogPopup,
  DialogTrigger,
} from "@tailorkit/ui/components/dialog";
import { toastManager } from "@tailorkit/ui/components/toast";
import { useAppForm } from "@tailorkit/ui/form";
import { validateProjectSlug } from "@tailorkit/db/validate-project-slug";
import { z } from "zod";
import { SetHeaderActions } from "@/components/header-actions";
import { client, orpc } from "@/utils/orpc";
import { setProjectApiKey } from "@/utils/project-api-key-memory";

export const Route = createFileRoute("/(app)/$orgSlug/~/(org)/projects")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      context.orpc.project.list.queryOptions({ input: { orgSlug: params.orgSlug } }),
    ),
  component: ProjectsPage,
});

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

const projectSchema = z.object({
  name: z.string().min(1, "Name is required."),
  slug: z.string().superRefine((value, ctx) => {
    const result = validateProjectSlug(value);
    if (!result.valid) {
      ctx.addIssue({
        code: "custom",
        message: result.reason ?? "Enter a valid slug.",
      });
    }
  }),
});

interface CreateProjectDialogProps {
  children: ReactNode;
  orgSlug: string;
}

function CreateProjectDialog({ children, orgSlug }: CreateProjectDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const slugTouched = useRef(false);

  const createMutation = useMutation({
    mutationFn: (input: { name: string; slug: string }) =>
      client.project.create({
        name: input.name.trim(),
        orgSlug,
        slug: input.slug,
      }),
    onSuccess: (project) => {
      queryClient.invalidateQueries(orpc.project.list.queryOptions({ input: { orgSlug } }));
      setProjectApiKey(orgSlug, project.slug, project.apiKey.key);
      form.reset();
      slugTouched.current = false;
      navigate({
        params: { orgSlug, projectSlug: project.slug },
        to: "/$orgSlug/$projectSlug",
      });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to create project";
      toastManager.add({ title: "Error", description: message, type: "error" });
    },
  });

  const form = useAppForm({
    defaultValues: { name: "", slug: "" },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
      } catch {
        // The mutation onError handler displays the toast.
      }
    },
    validators: { onSubmit: projectSchema },
  });

  function resetForm() {
    slugTouched.current = false;
    form.reset();
  }

  return (
    <Dialog onOpenChange={(open) => !open && resetForm()}>
      <DialogTrigger render={<span />}>{children}</DialogTrigger>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Projects keep work scoped inside this organisation.</DialogDescription>
        </DialogHeader>

        <form
          className="contents"
          id="create-project-dialog-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogPanel className="flex flex-col gap-4">
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  autoComplete="off"
                  label="Name"
                  placeholder="Amazing project"
                  type="text"
                  onChange={(event) => {
                    if (!slugTouched.current) {
                      form.setFieldValue("slug", toSlug(event.target.value));
                    }
                  }}
                />
              )}
            </form.AppField>

            <form.AppField name="slug">
              {(field) => (
                <field.TextField
                  autoComplete="off"
                  description={`tailorkit.com/${orgSlug}/${field.state.value || "project-slug"}`}
                  label="Slug"
                  placeholder="amazing-project"
                  type="text"
                  onChange={(event) => {
                    slugTouched.current = true;
                    field.handleChange(toSlug(event.target.value));
                  }}
                />
              )}
            </form.AppField>
          </DialogPanel>

          <DialogFooter>
            <DialogClose render={<Button size="sm" type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <form.AppForm>
              <form.SubmitButton form="create-project-dialog-form" size="sm">
                Create project
              </form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

function ProjectsPage() {
  const { orgSlug } = Route.useParams();
  const { data: projects } = useSuspenseQuery(
    orpc.project.list.queryOptions({ input: { orgSlug } }),
  );

  return (
    <div className="space-y-6">
      <SetHeaderActions>
        <CreateProjectDialog orgSlug={orgSlug}>
          <Button size="sm">
            <FolderPlusIcon />
            New project
          </Button>
        </CreateProjectDialog>
      </SetHeaderActions>

      <div>
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Projects</h1>
          <p className="mt-1 text-muted-foreground text-sm">All projects in this organisation.</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Empty className="mx-auto max-w-md rounded-lg border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderPlusIcon />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Create a project to start building inside this organisation.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateProjectDialog orgSlug={orgSlug}>
              <Button size="sm">
                <FolderPlusIcon />
                Create project
              </Button>
            </CreateProjectDialog>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              className="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
              params={{ orgSlug, projectSlug: project.slug }}
              to="/$orgSlug/$projectSlug"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-muted">
                  <FolderIcon className="size-3.5 text-muted-foreground" />
                </span>
                <span className="font-medium text-sm">{project.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
