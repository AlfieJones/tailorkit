import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useContext, useState } from "react";
import type { ReactNode } from "react";
import { BuilderProvider, ComposerContext, PreviewContext, useBuilderContext } from "./context";

type RenderTag = keyof React.JSX.IntrinsicElements;
type PartProps<T extends RenderTag> = useRender.ComponentProps<T> & { state?: string };

function usePart<T extends RenderTag>(
  tag: T,
  render: PartProps<T>["render"],
  props: Record<string, unknown>,
  state?: string,
) {
  const stateProps = state ? { "data-state": state } : {};
  return useRender({
    defaultTagName: tag,
    render,
    props: mergeProps<T>(stateProps as never, props as never),
  });
}

function BuilderTrigger({ render, className, onClick, ...props }: PartProps<"button">) {
  const builder = useBuilderContext();
  return usePart(
    "button",
    render,
    {
      ...props,
      className,
      type: "button",
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          builder.open();
        }
      },
      "aria-haspopup": "dialog",
    },
    builder.isOpen ? "open" : "closed",
  );
}

function BuilderLabel({ render, className, ...props }: PartProps<"span">) {
  return usePart("span", render, { ...props, className });
}

function AppList({ render, className, children, ...props }: PartProps<"div">) {
  const { apps, selectedApp, selectApp } = useBuilderContext();
  const content =
    children ??
    apps.map((app) => (
      <button
        key={app.id}
        type="button"
        aria-pressed={selectedApp?.id === app.id}
        data-state={selectedApp?.id === app.id ? "selected" : "unselected"}
        onClick={() => selectApp(app)}
      >
        {app.name}
      </button>
    ));
  return usePart("div", render, {
    ...props,
    className,
    children: content,
    "data-part": "app-list",
  });
}

function AppName({ render, className, children, ...props }: PartProps<"span">) {
  const { selectedApp } = useBuilderContext();
  return usePart("span", render, {
    ...props,
    className,
    children: children ?? selectedApp?.name ?? "Choose an app",
  });
}

function MessageList({ render, className, children, ...props }: PartProps<"div">) {
  const { messages } = useBuilderContext();
  const content =
    children ??
    messages.map((message) => (
      <div key={message.id} data-role={message.role} data-status={message.status ?? "complete"}>
        {message.content}
      </div>
    ));
  return usePart("div", render, {
    ...props,
    className,
    children: content,
    role: "log",
    "aria-live": "polite",
  });
}

function Progress({ render, className, children, ...props }: PartProps<"div">) {
  const { isRunning } = useBuilderContext();
  return usePart(
    "div",
    render,
    {
      ...props,
      className,
      hidden: !isRunning,
      role: "status",
      children: children ?? "Building your app…",
    },
    isRunning ? "running" : "idle",
  );
}

function ErrorMessage({ render, className, children, ...props }: PartProps<"p">) {
  const { error } = useBuilderContext();
  return usePart("p", render, {
    ...props,
    className,
    hidden: !error,
    role: "alert",
    children: children ?? error,
  });
}

function ComposerRoot({ render, className, children, onSubmit, ...props }: PartProps<"form">) {
  const builder = useBuilderContext();
  const context = { submit: builder.submit, disabled: builder.isRunning || !builder.selectedApp };
  return (
    <ComposerContext.Provider value={context}>
      {usePart("form", render, {
        ...props,
        className,
        onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => {
          onSubmit?.(event);
          if (!event.defaultPrevented) {
            builder.onSubmit(event);
          }
        },
        children,
      })}
    </ComposerContext.Provider>
  );
}

function ComposerInput({ render, className, ...props }: PartProps<"textarea">) {
  const context = useContext(ComposerContext);
  if (!context) {
    throw new Error("ComposerPrimitive.Input must be rendered inside ComposerPrimitive.Root.");
  }
  return usePart(
    "textarea",
    render,
    {
      ...props,
      className,
      name: "prompt",
      "aria-label": props["aria-label"] ?? "Describe the app changes",
      disabled: context.disabled,
      "data-part": "composer-input",
    },
    context.disabled ? "disabled" : "ready",
  );
}

function ComposerSend({ render, className, children, ...props }: PartProps<"button">) {
  const context = useContext(ComposerContext);
  if (!context) {
    throw new Error("ComposerPrimitive.Send must be rendered inside ComposerPrimitive.Root.");
  }
  return usePart(
    "button",
    render,
    {
      ...props,
      className,
      type: "submit",
      disabled: context.disabled,
      children: children ?? (context.disabled ? "Working…" : "Send"),
      "data-part": "composer-send",
    },
    context.disabled ? "disabled" : "ready",
  );
}

function PreviewRoot({ render, className, children, ...props }: PartProps<"section">) {
  const { candidate, publish, isRunning } = useBuilderContext();
  return (
    <PreviewContext.Provider value={{ candidate, publish, disabled: !candidate || isRunning }}>
      {usePart("section", render, {
        ...props,
        className,
        hidden: !candidate,
        "data-part": "preview",
        children,
      })}
    </PreviewContext.Provider>
  );
}

function PreviewFrame({ render, className, ...props }: PartProps<"iframe">) {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("PreviewPrimitive.Frame must be rendered inside PreviewPrimitive.Root.");
  }
  return usePart(
    "iframe",
    render,
    {
      ...props,
      className,
      src: context.candidate?.previewUrl,
      title: props.title ?? "App candidate preview",
      sandbox: "allow-scripts",
      referrerPolicy: "no-referrer",
    },
    context.candidate ? "ready" : "empty",
  );
}

function PreviewContent({ render, className, children, ...props }: PartProps<"div">) {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("PreviewPrimitive.Content must be rendered inside PreviewPrimitive.Root.");
  }
  return usePart(
    "div",
    render,
    { ...props, className, hidden: !context.candidate, children, "data-part": "preview-content" },
    context.candidate ? "ready" : "empty",
  );
}

function PublishButton({ render, className, children, onClick, ...props }: PartProps<"button">) {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("PreviewPrimitive.Publish must be rendered inside PreviewPrimitive.Root.");
  }
  return usePart(
    "button",
    render,
    {
      ...props,
      className,
      type: "button",
      disabled: context.disabled,
      children: children ?? "Publish",
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented && !context.disabled) {
          void context.publish();
        }
      },
      "data-part": "publish",
    },
    context.disabled ? "disabled" : "ready",
  );
}

function BuilderDialog({ children }: { children: ReactNode }) {
  const { isOpen, setOpen } = useBuilderContext();
  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      {children}
    </Dialog.Root>
  );
}

function BuilderDialogTrigger(props: React.ComponentProps<typeof Dialog.Trigger>) {
  const { open } = useBuilderContext();
  return (
    <Dialog.Trigger
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          open();
        }
      }}
    />
  );
}

function BuilderDialogClose(props: React.ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close {...props} />;
}

function BuilderDialogPopup({
  children,
  className,
  backdropClassName,
  ...props
}: React.ComponentProps<typeof Dialog.Popup> & { backdropClassName?: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className={backdropClassName} />
      <Dialog.Popup className={className} {...props}>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

function CreateAppButton({ render, className, children, ...props }: PartProps<"button">) {
  const { transport, apps, addApp, setError } = useBuilderContext();
  const [creating, setCreating] = useState(false);
  return usePart(
    "button",
    render,
    {
      ...props,
      className,
      type: "button",
      disabled: creating || !transport,
      children: children ?? "Create a new app",
      onClick: async () => {
        if (!transport || creating) {
          return;
        }
        setCreating(true);
        try {
          const app = await transport.createApp({ name: `App ${apps.length + 1}` });
          addApp(app);
        } catch (error) {
          setError(error instanceof Error ? error.message : String(error));
        } finally {
          setCreating(false);
        }
      },
    },
    creating ? "running" : "ready",
  );
}

export const BuilderPrimitive = {
  Provider: BuilderProvider,
  Trigger: BuilderTrigger,
  Label: BuilderLabel,
  Dialog: BuilderDialog,
  DialogTrigger: BuilderDialogTrigger,
  DialogClose: BuilderDialogClose,
  DialogPopup: BuilderDialogPopup,
  AppList,
  AppName,
  CreateApp: CreateAppButton,
  useBuilder: useBuilderContext,
};
export const ComposerPrimitive = { Root: ComposerRoot, Input: ComposerInput, Send: ComposerSend };
export const MessagePrimitive = { List: MessageList, Progress, Error: ErrorMessage };
export const PreviewPrimitive = {
  Root: PreviewRoot,
  Frame: PreviewFrame,
  Content: PreviewContent,
  Publish: PublishButton,
};
export { BuilderProvider };
