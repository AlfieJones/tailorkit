import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppPanel } from "../app-panel";
import { AppRail } from "../app-rail";
import type { TailorKitApp, TailorKitInstance } from "../tailor-kit";

const apps: TailorKitApp[] = [
  { clientPath: "/apps/todo.js", id: "todo", name: "Todo" },
  { clientPath: "/apps/messages.js", id: "messages", name: "Messages" },
];

const createTailor = (): TailorKitInstance =>
  ({
    Screen: ({ app }) => <div>Screen:{app.id}</div>,
    ScreenMatch: ({ children }) => children,
    getApp: (id: string) => apps.find((app) => app.id === id),
    getApps: () => apps,
    useApps: () => ({ apps, error: null, status: "ready" }),
  }) as TailorKitInstance;

describe("AppRail", () => {
  afterEach(() => {
    cleanup();
  });

  it("selects apps and renders the selected app screen", () => {
    const onValueChange = vi.fn();

    render(
      <AppPanel.Root apps={apps} onValueChange={onValueChange} tailor={createTailor()}>
        <AppRail.List>
          {apps.map((app) => (
            <AppRail.Item app={app} key={app.id}>
              <AppRail.Trigger>{app.name}</AppRail.Trigger>
            </AppRail.Item>
          ))}
        </AppRail.List>
        <AppPanel.Content>
          <AppPanel.Screen />
        </AppPanel.Content>
      </AppPanel.Root>,
    );

    expect(screen.queryByText("Screen:todo")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Messages" }));

    expect(onValueChange).toHaveBeenCalledWith("messages", apps[1]);
    expect(screen.getByText("Screen:messages")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Messages" }).getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  it("supports controlled popover rendering", () => {
    render(
      <AppPanel.Root apps={apps} open tailor={createTailor()} value="todo">
        <AppRail.List>
          <AppRail.Trigger app={apps[0]}>Todo</AppRail.Trigger>
        </AppRail.List>
        <AppPanel.Popover aria-label="TailorKit app">
          <AppPanel.Screen />
        </AppPanel.Popover>
      </AppPanel.Root>,
    );

    expect(screen.getByRole("dialog", { name: "TailorKit app" })).toBeTruthy();
    expect(screen.getByText("Screen:todo")).toBeTruthy();
  });

  it("renders panel header primitives and closes the panel", () => {
    const onOpenChange = vi.fn();

    render(
      <AppPanel.Root
        apps={apps}
        defaultOpen
        onOpenChange={onOpenChange}
        tailor={createTailor()}
        value="todo"
      >
        <AppPanel.Content>
          <AppPanel.Header>
            <AppPanel.Title />
            <AppPanel.Close>Close</AppPanel.Close>
          </AppPanel.Header>
        </AppPanel.Content>
      </AppPanel.Root>,
    );

    expect(screen.getByRole("heading", { name: "Todo" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("allows panel usage without AppRail", () => {
    render(
      <AppPanel.Root apps={apps} open tailor={createTailor()} value="messages">
        <AppPanel.Content>
          <AppPanel.Screen />
        </AppPanel.Content>
      </AppPanel.Root>,
    );

    expect(screen.getByText("Screen:messages")).toBeTruthy();
  });

  it("moves trigger focus with arrow keys", () => {
    const view = render(
      <AppPanel.Root apps={apps} tailor={createTailor()}>
        <AppRail.List>
          {apps.map((app) => (
            <AppRail.Trigger app={app} key={app.id}>
              {app.name}
            </AppRail.Trigger>
          ))}
        </AppRail.List>
      </AppPanel.Root>,
    );

    const todo = within(view.container).getByRole("button", { name: "Todo" });
    const messages = within(view.container).getByRole("button", { name: "Messages" });

    todo.focus();
    fireEvent.keyDown(todo, { key: "ArrowDown" });

    expect(document.activeElement).toBe(messages);
  });
});
