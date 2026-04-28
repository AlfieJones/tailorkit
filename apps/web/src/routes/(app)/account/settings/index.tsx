"use client";

import {
  Card,
  CardFrame,
  CardFrameFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tailorkit/ui/components/card";
import { Field, FieldError, FieldLabel } from "@tailorkit/ui/components/field";
import { Textarea } from "@tailorkit/ui/components/textarea";
import { toastManager } from "@tailorkit/ui/components/toast";
import { formatFieldErrors, useAppForm, useFieldContext } from "@tailorkit/ui/form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(app)/account/settings/")({
  component: SettingsProfile,
});

function TextAreaField({ label, placeholder }: { label: string; placeholder?: string }) {
  const field = useFieldContext<string>();
  const errors = field.state.meta.errors;
  const isError = errors.length > 0;

  return (
    <Field invalid={isError}>
      <FieldLabel>{label}</FieldLabel>
      <Textarea
        aria-invalid={isError || undefined}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        value={field.state.value}
      />
      {isError && <FieldError>{formatFieldErrors(errors)}</FieldError>}
    </Field>
  );
}

function SettingsProfile() {
  const { data: session } = authClient.useSession();

  const form = useAppForm({
    defaultValues: {
      bio: (session?.user as unknown as { bio?: string | null })?.bio ?? "",
      email: session?.user.email ?? "",
      name: session?.user.name ?? "",
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.updateUser({
        bio: value.bio,
        email: value.email,
        name: value.name,
      } as Parameters<typeof authClient.updateUser>[0]);

      if (result.error) {
        toastManager.add({
          description: result.error.message || "Failed to update profile",
          title: "Error",
          type: "error",
        });
        return;
      }

      toastManager.add({
        description: "Your profile has been updated.",
        title: "Profile updated",
        type: "success",
      });
    },
    validators: {
      onSubmit: z.object({
        bio: z.string(),
        email: z.string().email("Invalid email address"),
        name: z.string().min(1, "Name is required"),
      }),
    },
  });

  return (
    <div className="space-y-6 max-w-5xl w-full mx-auto">
      <CardFrame className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>

          <form
            id="profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <CardPanel className="flex flex-col gap-4 max-w-lg">
              <form.AppField name="name">
                {(field) => <field.TextField label="Display name" placeholder="Your name" />}
              </form.AppField>

              <form.AppField name="email">
                {(field) => <field.TextField label="Email" placeholder="you@example.com" />}
              </form.AppField>

              <form.AppField name="bio">
                {() => <TextAreaField label="Bio" placeholder="Tell us a bit about yourself" />}
              </form.AppField>
            </CardPanel>
          </form>
        </Card>

        <CardFrameFooter className="flex justify-end">
          <form.AppForm>
            <form.SubmitButton form="profile-form" size="sm">
              Save changes
            </form.SubmitButton>
          </form.AppForm>
        </CardFrameFooter>
      </CardFrame>
    </div>
  );
}
