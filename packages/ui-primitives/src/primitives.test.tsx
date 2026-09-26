import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, forwardRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BuilderPrimitive,
  BuilderProvider,
  ComposerPrimitive,
  MessagePrimitive,
  PreviewPrimitive,
} from "./index";

const transport = {
  createApp: vi.fn(({ name }: { name: string }) => Promise.resolve({ id: "app-1", name })),
  listApps: vi.fn(() => Promise.resolve([{ id: "app-1", name: "CRM helper" }])),
  publish: vi.fn(() => Promise.resolve()),
  send: vi.fn(() =>
    Promise.resolve({
      conversationId: "conv-1",
      messages: [{ id: "message-1", role: "assistant" as const, content: "Ready" }],
    }),
  ),
};

afterEach(cleanup);

function Harness({
  children,
  builderTransport = transport,
}: {
  children: React.ReactNode;
  builderTransport?: typeof transport;
}) {
  return (
    <BuilderProvider
      apps={[{ id: "app-1", name: "CRM helper" }]}
      navigation={vi.fn()}
      placements={["panel", "navbar"]}
      transport={builderTransport}
    >
      {children}
    </BuilderProvider>
  );
}

describe("builder primitives", () => {
  it("accepts a host button through render and retains builder behavior and refs", () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const HostButton = forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
      (props, forwardedRef) => <button {...props} ref={forwardedRef} />,
    );
    render(
      <Harness>
        <BuilderPrimitive.Trigger
          render={<HostButton ref={ref} onClick={onClick} />}
          className="host-class"
        >
          Build
        </BuilderPrimitive.Trigger>
      </Harness>,
    );
    const button = screen.getByRole("button", { name: "Build" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(ref.current).toBe(button);
    expect(button.getAttribute("data-state")).toBe("open");
  });

  it("composes the composer input with a host textarea and merges refs and change handlers", () => {
    const ref = createRef<HTMLTextAreaElement>();
    const onChange = vi.fn();
    const HostTextarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
      (props, forwardedRef) => <textarea {...props} ref={forwardedRef} />,
    );
    render(
      <Harness>
        <BuilderPrimitive.AppList />
        <ComposerPrimitive.Root>
          <ComposerPrimitive.Input render={<HostTextarea ref={ref} onChange={onChange} />} />
        </ComposerPrimitive.Root>
      </Harness>,
    );
    fireEvent.click(screen.getByRole("button", { name: "CRM helper" }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Find open tickets" } });
    expect(ref.current).toBe(input);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("marks composer parts disabled until an app is selected", () => {
    render(
      <Harness>
        <ComposerPrimitive.Root>
          <ComposerPrimitive.Input />
          <ComposerPrimitive.Send />
        </ComposerPrimitive.Root>
      </Harness>,
    );
    expect(
      (screen.getByRole("textbox", { name: "Describe the app changes" }) as HTMLTextAreaElement)
        .disabled,
    ).toBe(true);
    expect((screen.getByRole("button", { name: "Working…" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("uses Base UI dialog keyboard dismissal and restores trigger focus", async () => {
    render(
      <Harness>
        <BuilderPrimitive.Dialog>
          <BuilderPrimitive.DialogTrigger>Open builder</BuilderPrimitive.DialogTrigger>
          <BuilderPrimitive.DialogPopup>
            <p>Builder content</p>
          </BuilderPrimitive.DialogPopup>
        </BuilderPrimitive.Dialog>
      </Harness>,
    );
    const trigger = screen.getByRole("button", { name: "Open builder" });
    fireEvent.click(trigger);
    expect(await screen.findByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("lets the host choose an app and preserves custom message content", () => {
    render(
      <Harness>
        <BuilderPrimitive.AppList />
        <MessagePrimitive.List>
          <p>Host message layout</p>
        </MessagePrimitive.List>
      </Harness>,
    );
    expect(screen.getByRole("button", { name: "CRM helper" })).toBeTruthy();
    expect(screen.getByText("Host message layout")).toBeTruthy();
  });

  it("creates an app, previews a successful candidate, and publishes only on selection", async () => {
    const candidate = {
      app: { id: "app-1", name: "CRM helper" },
      previewUrl: "about:blank",
      sourceRevision: "rev-2",
    };
    const builderTransport = {
      ...transport,
      createApp: vi.fn(({ name }: { name: string }) => Promise.resolve({ id: "app-new", name })),
      send: vi.fn(() =>
        Promise.resolve({
          conversationId: "conv-2",
          messages: [{ id: "message-2", role: "assistant" as const, content: "Preview ready" }],
          candidate,
        }),
      ),
      publish: vi.fn(() => Promise.resolve()),
    };
    render(
      <Harness builderTransport={builderTransport}>
        <BuilderPrimitive.CreateApp />
        <BuilderPrimitive.AppList />
        <ComposerPrimitive.Root>
          <ComposerPrimitive.Input />
          <ComposerPrimitive.Send />
        </ComposerPrimitive.Root>
        <MessagePrimitive.List />
        <PreviewPrimitive.Root>
          <PreviewPrimitive.Frame />
          <PreviewPrimitive.Publish />
        </PreviewPrimitive.Root>
      </Harness>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create a new app" }));
    expect(await screen.findByRole("button", { name: "App 2" })).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Add a dashboard" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Preview ready")).toBeTruthy();
    expect((screen.getByTitle("App candidate preview") as HTMLIFrameElement).src).toBe(
      candidate.previewUrl,
    );
    expect(builderTransport.publish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() => expect(builderTransport.publish).toHaveBeenCalledOnce());
  });

  it("exposes a running state and disables the composer until a build finishes", async () => {
    let completeRun: ((value: Awaited<ReturnType<typeof transport.send>>) => void) | undefined;
    const builderTransport = {
      ...transport,
      send: vi.fn(
        () =>
          new Promise<Awaited<ReturnType<typeof transport.send>>>((resolve) => {
            completeRun = resolve;
          }),
      ),
    };
    render(
      <Harness builderTransport={builderTransport}>
        <BuilderPrimitive.AppList />
        <ComposerPrimitive.Root>
          <ComposerPrimitive.Input />
          <ComposerPrimitive.Send />
        </ComposerPrimitive.Root>
        <MessagePrimitive.Progress />
      </Harness>,
    );
    fireEvent.click(screen.getByRole("button", { name: "CRM helper" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Add search" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    const sendButton = screen.getByRole("button", { name: "Working…" }) as HTMLButtonElement;
    expect(sendButton.disabled).toBe(true);
    expect(sendButton.dataset.state).toBe("disabled");
    expect(screen.getByRole("status").hidden).toBe(false);
    completeRun?.({ conversationId: "conv-3", messages: [] });
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });
});
