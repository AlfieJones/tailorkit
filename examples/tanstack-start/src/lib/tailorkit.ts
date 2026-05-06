import { createElement, useState } from "react";
import type { ReactNode } from "react";
import { schema } from "@examples/shared";
import { primitives as reactPrimitives, tailorKit } from "tailorkit/react";

function TabsRenderer({
  onChange,
  tabs,
  value,
  variant = "default",
  children,
}: {
  children?: ReactNode;
  onChange: () => void;
  tabs: { label: string; value: string }[];
  value?: string;
  variant?: "default" | "underline";
}) {
  const firstTabValue = tabs[0]?.value ?? "";
  const [activeValue, setActiveValue] = useState(value ?? firstTabValue);
  const selectedValue = value ?? activeValue;

  return createElement(
    "div",
    { className: "flex flex-col gap-3" },
    createElement(
      "div",
      {
        "aria-label": "Tabs",
        className:
          variant === "underline"
            ? "flex w-fit items-center gap-1 border-b border-gray-200"
            : "flex w-fit items-center gap-1 rounded-lg bg-gray-100 p-1",
        role: "tablist",
      },
      tabs.map((tab) => {
        const isSelected = tab.value === selectedValue;

        return createElement(
          "button",
          {
            "aria-selected": isSelected,
            className:
              variant === "underline"
                ? `cursor-pointer border-b-2 px-3 py-2 text-sm font-medium ${
                    isSelected
                      ? "border-blue-500 text-gray-950"
                      : "border-transparent text-gray-600 hover:text-gray-950"
                  }`
                : `cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium ${
                    isSelected
                      ? "bg-white text-gray-950 shadow-sm"
                      : "text-gray-600 hover:text-gray-950"
                  }`,
            key: tab.value,
            onClick: () => {
              setActiveValue(tab.value);
              onChange();
            },
            role: "tab",
            type: "button",
          },
          tab.label,
        );
      }),
    ),
    createElement("div", { role: "tabpanel" }, children),
  );
}

export const tailor = tailorKit(schema, {
  baseUrl:
    typeof window === "undefined"
      ? "http://localhost/api/tailorkit/"
      : new URL("/api/tailorkit/", window.location.origin),
  components: {
    ...reactPrimitives,
    Button: ({ props, slots }) =>
      createElement(
        "button",
        {
          type: "button",
          className:
            props.variant === "primary"
              ? "cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              : "cursor-pointer rounded bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200",
          onClick: () => {
            props.onClick();
          },
        },
        slots.default as ReactNode,
      ),
    Input: ({ props }) =>
      createElement("input", {
        className:
          "h-9 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:border-blue-500",
        disabled: props.disabled,
        onBlur: () => {
          props.onBlur();
        },
        onChange: () => {
          props.onChange();
        },
        onFocus: () => {
          props.onFocus();
        },
        placeholder: props.placeholder,
        type: props.type ?? "text",
        value: props.value ?? "",
      }),
    Tabs: ({ props, slots }) =>
      createElement(
        TabsRenderer,
        {
          onChange: props.onChange,
          tabs: props.tabs,
          value: props.value,
          variant: props.variant,
        },
        slots.default as ReactNode,
      ),
  },
});

export default tailor;
