import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode, SubmitEvent } from "react";

export interface BuilderApp {
  id: string;
  name: string;
  description?: string | null;
  currentDeployment?: { id: string } | null;
}

export interface BuilderMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "complete" | "error";
}

export interface BuilderCandidate {
  app: BuilderApp;
  previewUrl: string;
  sourceRevision: string;
  deploymentId?: string;
  runId?: string;
}

export interface BuilderTransport {
  listApps(): Promise<BuilderApp[]>;
  createApp(input: { name: string; description?: string }): Promise<BuilderApp>;
  send(input: {
    appId: string;
    prompt: string;
    conversationId?: string;
  }): Promise<{ conversationId: string; messages: BuilderMessage[]; candidate?: BuilderCandidate }>;
  publish(candidate: BuilderCandidate): Promise<void>;
}

export interface BuilderContextValue {
  activePlacement: string | null;
  apps: BuilderApp[];
  addApp: (app: BuilderApp) => void;
  candidate: BuilderCandidate | null;
  conversationId: string | null;
  error: string | null;
  isOpen: boolean;
  isRunning: boolean;
  messages: BuilderMessage[];
  navigation: (placement: string | null) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  open: (placement?: string) => void;
  publish: () => Promise<void>;
  selectApp: (app: BuilderApp | null) => void;
  selectedApp: BuilderApp | null;
  setError: (error: string | null) => void;
  setOpen: (open: boolean) => void;
  submit: (prompt: string) => Promise<void>;
  transport?: BuilderTransport;
}

export const BuilderContext = createContext<BuilderContextValue | null>(null);
export const ComposerContext = createContext<{
  submit: (prompt: string) => Promise<void>;
  disabled: boolean;
} | null>(null);
export const PreviewContext = createContext<{
  candidate: BuilderCandidate | null;
  publish: () => Promise<void>;
  disabled: boolean;
} | null>(null);

const defaultApps: BuilderApp[] = [];

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("usePreview must be rendered inside PreviewPrimitive.Root.");
  }
  return context;
}

export function BuilderProvider({
  children,
  placements,
  navigation,
  transport,
  apps: appsProp = defaultApps,
}: {
  children: ReactNode;
  placements: readonly string[];
  navigation: (placement: string | null) => void;
  transport?: BuilderTransport;
  apps?: BuilderApp[];
}) {
  const [isOpen, setOpen] = useState(false);
  const [activePlacement, setActivePlacement] = useState<string | null>(null);
  const [apps, setApps] = useState(appsProp);
  const [selectedApp, setSelectedApp] = useState<BuilderApp | null>(null);
  const [messages, setMessages] = useState<BuilderMessage[]>([]);
  const [candidate, setCandidate] = useState<BuilderCandidate | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transport) {
      setApps(appsProp);
    }
  }, [appsProp, transport]);

  const choosePlacement = (placement: string | null) => {
    setActivePlacement(placement);
    navigation(placement);
  };
  const open = (placement?: string) => {
    const selectedPlacement =
      placement && placements.includes(placement) ? placement : (placements[0] ?? null);
    choosePlacement(selectedPlacement);
    setOpen(true);
    if (transport) {
      setError(null);
      void transport
        .listApps()
        .then((availableApps) => {
          setApps(availableApps);
          if (availableApps.length === 1 && !selectedApp) {
            setSelectedApp(availableApps[0] ?? null);
          }
        })
        .catch((error: unknown) => {
          setError(error instanceof Error ? error.message : String(error));
        });
    }
  };
  const selectApp = (app: BuilderApp | null) => {
    setSelectedApp(app);
    setConversationId(null);
    setMessages([]);
    setCandidate(null);
  };
  const addApp = (app: BuilderApp) => {
    setApps((current) => [app, ...current.filter((item) => item.id !== app.id)]);
    selectApp(app);
  };
  const submit = async (prompt: string) => {
    if (!selectedApp || !transport || isRunning || !prompt.trim()) {
      return;
    }
    setError(null);
    setIsRunning(true);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: prompt.trim(), status: "complete" },
    ]);
    try {
      const result = await transport.send({
        appId: selectedApp.id,
        prompt: prompt.trim(),
        conversationId: conversationId ?? undefined,
      });
      setConversationId(result.conversationId);
      setMessages(result.messages);
      setCandidate(result.candidate ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: message, status: "error" },
      ]);
    } finally {
      setIsRunning(false);
    }
  };
  const publish = async () => {
    if (!candidate || !transport || isRunning) {
      return;
    }
    setIsRunning(true);
    setError(null);
    try {
      await transport.publish(candidate);
      setCandidate(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRunning(false);
    }
  };
  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const prompt = form.get("prompt");
    if (typeof prompt === "string") {
      void submit(prompt);
    }
    event.currentTarget.reset();
  };
  const value: BuilderContextValue = {
    activePlacement,
    addApp,
    apps,
    candidate,
    conversationId,
    error,
    isOpen,
    isRunning,
    messages,
    navigation: choosePlacement,
    onSubmit,
    open,
    publish,
    selectApp,
    selectedApp,
    setError,
    setOpen,
    submit,
    transport,
  };
  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilderContext(name = "BuilderPrimitive") {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error(`${name} must be rendered inside BuilderProvider.`);
  }
  return context;
}

export function useConversation() {
  const { conversationId, isRunning, messages, submit } = useBuilderContext("useConversation");
  return { id: conversationId, messages, isRunning, sendMessage: submit };
}

export function useBuilderApp() {
  const { apps, selectedApp, selectApp } = useBuilderContext("useBuilderApp");
  return { apps, app: selectedApp, selectApp };
}
