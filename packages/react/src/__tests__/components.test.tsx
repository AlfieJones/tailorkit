import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { UseAppsResult } from "../hooks/use-apps";
import type { TailorKitApp } from "../tailor-kit";
import { Root } from "../components/root";
import { AppList } from "../components/app-list";
import { AppTrigger } from "../components/app-trigger";
import { AppContent, AppHeader, AppScreen, AppScreenClose } from "../components/app-screen";

const apps: TailorKitApp[] = [
  { clientPath: "/apps/todo.js", id: "todo", name: "Todo" },
  {
    clientPath: "/apps/messages.js",
    description: "Team inbox",
    id: "messages",
    name: "Messages",
  },
];

interface TestTailor {
  Screen: (props: { app: TailorKitApp }) => ReactNode;
  useApps: () => UseAppsResult;
}

const createTailor = (): TestTailor =>
  ({
    Screen: ({ app }) => <div>Screen:{app.id}</div>,
    useApps: () => ({
      data: apps,
      error: null,
      isError: false,
      isLoading: false,
      isPending: false,
      isSuccess: true,
      refetch: async () => {},
      status: "ready",
    }),
  }) satisfies TestTailor;

describe("TailorKit components", () => {
  afterEach(() => {
    cleanup();
  });

  it("selects apps and renders the selected app screen", () => {
    const onValueChange = vi.fn();

    render(
      <Root apps={apps} onValueChange={onValueChange} tailor={createTailor()}>
        <AppList>
          {apps.map((app) => (
            <AppTrigger app={app} key={app.id}>
              {app.name}
            </AppTrigger>
          ))}
        </AppList>
        <AppScreen>
          <AppHeader>
            <h2>Selected app</h2>
          </AppHeader>
          <AppContent />
        </AppScreen>
      </Root>,
    );

    expect(screen.queryByText("Screen:todo")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Messages" }));

    expect(onValueChange).toHaveBeenCalledWith(apps[1]);
    expect(screen.getByText("Screen:messages")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Messages" }).getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  it("supports controlled open and selected value", () => {
    render(
      <Root apps={apps} open tailor={createTailor()} value="todo">
        <AppScreen>
          <h2>Selected app</h2>
          <AppContent />
        </AppScreen>
      </Root>,
    );

    expect(screen.getByRole("heading", { name: "Selected app" })).toBeTruthy();
    expect(screen.getByText("Screen:todo")).toBeTruthy();
  });

  it("renders header and closes the app screen", () => {
    const onOpenChange = vi.fn();

    render(
      <Root
        apps={apps}
        defaultOpen
        onOpenChange={onOpenChange}
        tailor={createTailor()}
        value="todo"
      >
        <AppScreen>
          <AppHeader>
            <h2>Selected app</h2>
            <AppScreenClose>Close</AppScreenClose>
          </AppHeader>
        </AppScreen>
      </Root>,
    );

    expect(screen.getByRole("heading", { name: "Selected app" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("moves trigger focus with arrow keys", () => {
    const view = render(
      <Root apps={apps} tailor={createTailor()}>
        <AppList>
          {apps.map((app) => (
            <AppTrigger app={app} key={app.id}>
              {app.name}
            </AppTrigger>
          ))}
        </AppList>
      </Root>,
    );

    const todo = within(view.container).getByRole("button", { name: "Todo" });
    const messages = within(view.container).getByRole("button", { name: "Messages" });

    todo.focus();
    fireEvent.keyDown(todo, { key: "ArrowDown" });

    expect(document.activeElement).toBe(messages);
  });

  it("does not open the app screen when moving trigger focus with arrow keys", () => {
    render(
      <Root apps={apps} tailor={createTailor()}>
        <AppList>
          {apps.map((app) => (
            <AppTrigger app={app} key={app.id}>
              {app.name}
            </AppTrigger>
          ))}
        </AppList>
        <AppScreen>
          <AppContent />
        </AppScreen>
      </Root>,
    );

    const todo = screen.getByRole("button", { name: "Todo" });
    todo.focus();
    fireEvent.keyDown(todo, { key: "ArrowDown" });

    expect(screen.queryByText("Screen:messages")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Messages" }));
    expect(screen.getByText("Screen:messages")).toBeTruthy();
  });

  it("opens rendered non-button triggers with space or enter", () => {
    render(
      <Root apps={apps} tailor={createTailor()}>
        <AppTrigger app={apps[0] as TailorKitApp} render={<a href="#todo" />}>
          Todo
        </AppTrigger>
        <AppScreen>
          <AppContent />
        </AppScreen>
      </Root>,
    );

    const trigger = screen.getByRole("link", { name: "Todo" });
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(screen.getByText("Screen:todo")).toBeTruthy();

    fireEvent.click(trigger);
    expect(screen.queryByText("Screen:todo")).toBeNull();

    fireEvent.keyDown(trigger, { key: " " });
    expect(screen.getByText("Screen:todo")).toBeTruthy();
  });

  it("closes the app screen when clicking the open trigger", () => {
    render(
      <Root apps={apps} tailor={createTailor()}>
        <AppTrigger app={apps[0] as TailorKitApp}>Todo</AppTrigger>
        <AppScreen>
          <AppContent />
        </AppScreen>
      </Root>,
    );

    const trigger = screen.getByRole("button", { name: "Todo" });
    fireEvent.click(trigger);
    expect(screen.getByText("Screen:todo")).toBeTruthy();

    fireEvent.click(trigger);
    expect(screen.queryByText("Screen:todo")).toBeNull();
  });

  it("can render the app screen as a popover anchored to the active trigger", () => {
    render(
      <Root apps={apps} tailor={createTailor()}>
        <AppTrigger app={apps[0] as TailorKitApp}>Todo</AppTrigger>
        <AppScreen popover={{ placement: "right-start", sideOffset: 12 }}>
          <AppContent />
        </AppScreen>
      </Root>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Todo" }));

    const screenElement = screen.getByText("Screen:todo").closest("[data-state='open']");
    expect(screenElement).toBeInstanceOf(HTMLElement);
    expect(screenElement?.tagName).toBe("DIV");
    expect(screenElement?.getAttribute("data-app-id")).toBe("todo");
    expect((screenElement as HTMLElement).style.position).toBe("absolute");
  });

  it("supports render overrides on list, trigger, header, and content", () => {
    render(
      <Root apps={apps} defaultOpen tailor={createTailor()} value="messages">
        <AppList orientation="horizontal" render={<ul />}>
          <li>
            <AppTrigger
              app={apps[1] as TailorKitApp}
              render={<a aria-label="Open messages" href="#messages" />}
            >
              Open messages
            </AppTrigger>
          </li>
        </AppList>
        <AppScreen render={<aside />}>
          <AppHeader render={<section />}>
            <h2>Messages</h2>
          </AppHeader>
          <AppContent render={<article />} />
        </AppScreen>
      </Root>,
    );

    expect(screen.getByRole("toolbar").tagName).toBe("UL");
    expect(screen.getByRole("link", { name: "Open messages" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Messages" }).parentElement?.tagName).toBe(
      "SECTION",
    );
    expect(screen.getByText("Screen:messages").parentElement?.tagName).toBe("ARTICLE");
    expect(screen.getByRole("complementary").getAttribute("data-app-id")).toBe("messages");
  });
});
