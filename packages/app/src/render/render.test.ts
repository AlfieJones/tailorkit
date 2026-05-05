import { h } from "preact";
import { describe, expect, it } from "vitest";
import { render } from "./render";

const remoteType = (name: string) => `tailorkit-component-${name}`;

const Text = ({ context }: { context: { message: string } }) =>
  h(remoteType("Text"), null, context.message);
const Empty = () => null;
const noop = () => {};

describe("render", () => {
  it("renders a simple remote component", () => {
    const { vdom } = render(Text as never, { message: "hello" });
    expect(vdom).toEqual({
      kind: "remote",
      name: "Text",
      props: {},
      children: [{ kind: "text", value: "hello" }],
    });
  });

  it("returns null for a component that renders nothing", () => {
    const { vdom } = render(Empty as never, {});
    expect(vdom).toBeNull();
  });

  it("serializes function props as callback ids", () => {
    const Button = () => h(remoteType("Button"), { onClick: noop }, "click me");
    const { vdom } = render(Button as never, {});
    expect(vdom).toMatchObject({
      kind: "remote",
      name: "Button",
      props: { onClick: { __callbackId: expect.stringMatching(/^cb_\d+$/) } },
    });
  });

  it("invoke calls the registered callback", () => {
    let called = false;
    const Button = () =>
      h(
        remoteType("Button"),
        {
          onClick: () => {
            called = true;
          },
        },
        "click",
      );
    const { vdom, invoke } = render(Button as never, {});
    const id = (vdom as unknown as { props: { onClick: { __callbackId: string } } }).props.onClick
      .__callbackId;
    invoke(id, []);
    expect(called).toBe(true);
  });

  it("invoke returns the callback return value", () => {
    const Button = () => h(remoteType("Button"), { onClick: () => 42 }, "click");
    const { vdom, invoke } = render(Button as never, {});
    const id = (vdom as unknown as { props: { onClick: { __callbackId: string } } }).props.onClick
      .__callbackId;
    expect(invoke(id, [])).toBe(42);
  });

  it("invoke throws for an unknown id", () => {
    const { invoke } = render(() => null, {});
    expect(() => invoke("cb_nope", [])).toThrow('No callback registered with id "cb_nope"');
  });

  it("renders nested children", () => {
    const List = () =>
      h(
        remoteType("List"),
        null,
        h(remoteType("Item"), null, "a"),
        h(remoteType("Item"), null, "b"),
      );
    const { vdom } = render(List as never, {});
    expect(vdom).toMatchObject({
      kind: "remote",
      name: "List",
      children: [
        { kind: "remote", name: "Item", children: [{ kind: "text", value: "a" }] },
        { kind: "remote", name: "Item", children: [{ kind: "text", value: "b" }] },
      ],
    });
  });

  it("renders text nodes", () => {
    const Comp = () => h(remoteType("Box"), null, "hello");
    const { vdom } = render(Comp as never, {});
    expect(vdom).toMatchObject({ children: [{ kind: "text", value: "hello" }] });
  });

  it("renders number children as text", () => {
    const Comp = () => h(remoteType("Box"), null, 42);
    const { vdom } = render(Comp as never, {});
    expect(vdom).toMatchObject({ children: [{ kind: "text", value: "42" }] });
  });

  it("strips children from serialized props", () => {
    const Comp = () => h(remoteType("Outer"), null, h(remoteType("Inner"), null));
    const { vdom } = render(Comp as never, {});
    expect((vdom as { props: Record<string, unknown> }).props).not.toHaveProperty("children");
  });

  it("recurses through user-defined function components", () => {
    const Inner = () => h(remoteType("Inner"), null, "inner");
    const Outer = () => h(remoteType("Outer"), null, h(Inner, null));
    const { vdom } = render(Outer as never, {});
    expect(vdom).toMatchObject({
      kind: "remote",
      name: "Outer",
      children: [{ kind: "remote", name: "Inner" }],
    });
  });

  it("throws when a native HTML element is used", () => {
    const Comp = () => h("div", null, "oops");
    expect(() => render(Comp as never, {})).toThrow(
      'Native HTML element "div" is not supported. Use remote components instead.',
    );
  });
});
