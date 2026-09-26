"use client";

import {
  BuilderPrimitive,
  BuilderProvider,
  ComposerPrimitive,
  MessagePrimitive,
  PreviewPrimitive,
  usePreview,
} from "@tailorkit/ui-primitives";
import type { BuilderApp, BuilderCandidate, BuilderTransport } from "@tailorkit/ui-primitives";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { Button } from "@tailorkit/ui/button";
import type { ReactNode } from "react";

export function createBuilderTransport(
  input: {
    afterPublish?: () => Promise<void> | void;
    baseUrl?: string;
    fetch?: typeof fetch;
  } = {},
): BuilderTransport {
  const link = new RPCLink({
    method: "POST",
    url: input.baseUrl ?? "/api/tailorkit",
    fetch: input.fetch,
  });
  const client = createORPCClient(link) as {
    builder: {
      apps(): Promise<BuilderApp[]>;
      createApp(input: { name: string; description?: string }): Promise<BuilderApp>;
      send(input: { appId: string; prompt: string; conversationId?: string }): Promise<{
        conversationId: string;
        messages: BuilderTransportSendMessage[];
        candidate?: BuilderCandidate;
      }>;
      publish(input: { runId: string }): Promise<{ published: boolean }>;
    };
  };
  return {
    listApps: () => client.builder.apps(),
    createApp: (createInput) => client.builder.createApp(createInput),
    send: (sendInput) => client.builder.send(sendInput),
    async publish(candidate) {
      if (!candidate.runId) {
        throw new Error("This preview is missing its builder run id.");
      }
      await client.builder.publish({ runId: candidate.runId });
      await input.afterPublish?.();
    },
  };
}

interface BuilderTransportSendMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "complete" | "error";
}

export function BuilderExample({
  apps,
  navigation,
  placements,
  renderCandidate,
  transport,
}: {
  apps: BuilderApp[];
  navigation: (placement: string | null) => void;
  placements: readonly string[];
  renderCandidate?: (candidate: BuilderCandidate) => ReactNode;
  transport?: BuilderTransport;
}) {
  return (
    <BuilderProvider
      apps={apps}
      navigation={navigation}
      placements={placements}
      transport={transport}
    >
      <BuilderPrimitive.Dialog>
        <BuilderPrimitive.DialogTrigger render={<Button variant="outline" />}>
          Build an app
        </BuilderPrimitive.DialogTrigger>
        <BuilderPrimitive.DialogPopup
          backdropClassName="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          className="fixed inset-y-4 right-4 z-50 flex w-[min(460px,calc(100vw-2rem))] flex-col overflow-auto rounded-xl border bg-background p-5 text-foreground shadow-2xl"
        >
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg">App builder</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create an app or ask for a change.
              </p>
            </div>
            <BuilderPrimitive.DialogClose
              render={<Button variant="ghost" size="sm" />}
              aria-label="Close builder"
            >
              Close
            </BuilderPrimitive.DialogClose>
          </header>
          <BuilderPrimitive.AppList className="mb-4 flex flex-wrap gap-2 [&_button]:rounded-md [&_button]:border [&_button]:px-3 [&_button]:py-1.5 [&_button]:text-sm [&_button[data-state=selected]]:border-primary [&_button[data-state=selected]]:bg-primary/10" />
          <BuilderPrimitive.CreateApp
            render={<Button variant="outline" size="sm" />}
            className="mb-4 self-start"
          />
          <div className="mb-2 text-sm font-medium">
            <BuilderPrimitive.AppName />
          </div>
          <MessagePrimitive.List className="flex min-h-36 flex-1 flex-col gap-3 overflow-auto rounded-lg bg-muted/40 p-3 text-sm [&_[data-role=user]]:ml-8 [&_[data-role=user]]:rounded-lg [&_[data-role=user]]:bg-primary [&_[data-role=user]]:p-3 [&_[data-role=user]]:text-primary-foreground [&_[data-role=assistant]]:mr-8 [&_[data-role=assistant]]:rounded-lg [&_[data-role=assistant]]:border [&_[data-role=assistant]]:bg-background [&_[data-role=assistant]]:p-3" />
          <MessagePrimitive.Progress className="mt-3 text-sm text-muted-foreground" />
          <MessagePrimitive.Error className="mt-2 text-sm text-destructive" />
          <ComposerPrimitive.Root className="mt-4 flex flex-col gap-2 rounded-lg border p-2 focus-within:ring-2 focus-within:ring-ring">
            <ComposerPrimitive.Input
              className="min-h-24 resize-y border-0 bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="What should the app do?"
            />
            <ComposerPrimitive.Send render={<Button />} className="self-end" />
          </ComposerPrimitive.Root>
          <PreviewPrimitive.Root className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Candidate preview</h3>
              <PreviewPrimitive.Publish render={<Button size="sm" />} />
            </div>
            <PreviewCandidate renderCandidate={renderCandidate} />
          </PreviewPrimitive.Root>
        </BuilderPrimitive.DialogPopup>
      </BuilderPrimitive.Dialog>
    </BuilderProvider>
  );
}

function PreviewCandidate({
  renderCandidate,
}: {
  renderCandidate?: (candidate: BuilderCandidate) => ReactNode;
}) {
  const { candidate } = usePreview();
  if (candidate && renderCandidate) {
    return (
      <PreviewPrimitive.Content className="min-h-72 w-full overflow-hidden rounded-lg border bg-white">
        {renderCandidate(candidate)}
      </PreviewPrimitive.Content>
    );
  }
  return <PreviewPrimitive.Frame className="h-72 w-full rounded-lg border bg-white" />;
}
