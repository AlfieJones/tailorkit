import { createTailorKit } from "tailorkit";
import type { Component, TailorKitTheme } from "tailorkit";
import { primitives } from "tailorkit/zod";
import { createTailorKitClient, primitives as reactPrimitives } from "tailorkit/react";
import type React from "react";
import { z } from "zod";
import { Badge } from "@tailorkit/ui/components/badge";
import { Button } from "@tailorkit/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tailorkit/ui/components/dropdown-menu";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@tailorkit/ui/components/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@tailorkit/ui/components/card";
import { Checkbox } from "@tailorkit/ui/components/checkbox";
import { Input } from "@tailorkit/ui/components/input";
import { Separator } from "@tailorkit/ui/components/separator";
import { defaultTheme, withPrimitiveThemeTokens } from "./demo-theme";

const component = <const TComponent extends Component>(definition: TComponent): TComponent =>
  definition;

const ButtonComponent = component({
  callbacks: {
    onClick: {},
  },
  fields: z.object({
    size: z.enum(["default", "sm", "lg", "icon", "icon-sm", "icon-lg"]).optional(),
    variant: z.enum(["default", "secondary", "ghost", "outline", "destructive"]).optional(),
  }),
  slots: ["default"],
});

const BadgeComponent = component({
  fields: z.object({
    size: z.enum(["default", "sm", "lg"]).optional(),
    variant: z
      .enum(["default", "secondary", "outline", "success", "warning", "info", "error"])
      .optional(),
  }),
  slots: ["default"],
});

const CheckboxComponent = component({
  callbacks: {
    onCheckedChange: {
      input: [z.boolean()],
    },
  },
  fields: z.object({
    checked: z.string().optional(),
  }),
});

const CardComponent = component({ slots: ["default"] });
const CardHeaderComponent = component({ slots: ["default"] });
const CardTitleComponent = component({ slots: ["default"] });
const CardDescriptionComponent = component({ slots: ["default"] });
const CardContentComponent = component({ slots: ["default"] });
const CardFooterComponent = component({ slots: ["default"] });

const InputComponent = component({
  callbacks: {
    onValueChange: {
      input: [z.string()],
    },
  },
  fields: z.object({
    placeholder: z.string().optional(),
    value: z.string().optional(),
  }),
});

const TabsComponent = component({
  fields: z.object({
    value: z.string().optional(),
  }),
  callbacks: {
    onValueChange: {
      input: [z.string()],
    },
  },
  slots: ["default"],
});

const TabsListComponent = component({
  slots: ["default"],
});

const TabsTabComponent = component({
  fields: z.object({
    value: z.string(),
  }),
  slots: ["default"],
});

const TabsPanelComponent = component({
  fields: z.object({
    value: z.string(),
  }),
  slots: ["default"],
});

const SeparatorComponent = component({});

const DropdownMenuComponent = component({ slots: ["default"] });
const DropdownMenuTriggerComponent = component({ slots: ["default"] });
const DropdownMenuContentComponent = component({ slots: ["default"] });
const DropdownMenuItemComponent = component({
  callbacks: { onClick: {} },
  fields: z.object({
    variant: z.enum(["default", "destructive"]).optional(),
  }),
  slots: ["default"],
});
const DropdownMenuSeparatorComponent = component({});

export const createDemoSchema = (theme: TailorKitTheme = defaultTheme) => {
  const primitiveTheme = withPrimitiveThemeTokens(theme);

  return {
    components: {
      ...primitives(primitiveTheme),
      Badge: BadgeComponent,
      Button: ButtonComponent,
      Card: CardComponent,
      DropdownMenu: DropdownMenuComponent,
      DropdownMenuContent: DropdownMenuContentComponent,
      DropdownMenuItem: DropdownMenuItemComponent,
      DropdownMenuSeparator: DropdownMenuSeparatorComponent,
      DropdownMenuTrigger: DropdownMenuTriggerComponent,
      CardContent: CardContentComponent,
      CardDescription: CardDescriptionComponent,
      CardFooter: CardFooterComponent,
      CardHeader: CardHeaderComponent,
      CardTitle: CardTitleComponent,
      Checkbox: CheckboxComponent,
      Input: InputComponent,
      Separator: SeparatorComponent,
      Tabs: TabsComponent,
      TabsList: TabsListComponent,
      TabsTab: TabsTabComponent,
      TabsPanel: TabsPanelComponent,
    },
    screens: {
      "/": {
        context: z.object({}).optional(),
      },
    },
  } as const;
};

export const demoApps = [
  {
    clientPath: "/demo-clients/todo.js?v=20260512-v13",
    description: "A compact task workspace for customer onboarding demos.",
    id: "todo",
    name: "My Tasks",
  },
  {
    clientPath: "/demo-clients/messages.js?v=20260512-v11",
    description: "A compact team inbox for messaging demos.",
    id: "messages",
    name: "Team Inbox",
  },
];

export function createDemoTailorClient(theme: TailorKitTheme) {
  const server = createTailorKit(createDemoSchema(theme));

  return createTailorKitClient<typeof server>({
    baseUrl:
      typeof window === "undefined"
        ? "http://localhost/api/tailorkit/"
        : new URL("/api/tailorkit/", window.location.origin),
    components: {
      ...reactPrimitives,
      Button: ({ props, slots }) => (
        <Button
          onClick={typeof props.onClick === "function" ? props.onClick : undefined}
          size={props.size as React.ComponentProps<typeof Button>["size"]}
          variant={props.variant as React.ComponentProps<typeof Button>["variant"]}
        >
          {slots.default}
        </Button>
      ),
      Badge: ({ props, slots }) => (
        <Badge
          size={props.size as React.ComponentProps<typeof Badge>["size"]}
          variant={props.variant as React.ComponentProps<typeof Badge>["variant"]}
        >
          {slots.default}
        </Badge>
      ),
      Card: ({ slots }) => <Card>{slots.default}</Card>,
      CardHeader: ({ slots }) => <CardHeader>{slots.default}</CardHeader>,
      CardTitle: ({ slots }) => <CardTitle>{slots.default}</CardTitle>,
      CardDescription: ({ slots }) => <CardDescription>{slots.default}</CardDescription>,
      CardContent: ({ slots }) => <CardContent>{slots.default}</CardContent>,
      CardFooter: ({ slots }) => <CardFooter>{slots.default}</CardFooter>,
      Checkbox: ({ props }) => (
        <Checkbox
          checked={props.checked === "true"}
          onCheckedChange={
            typeof props.onCheckedChange === "function"
              ? (checked: boolean) => props.onCheckedChange(checked)
              : undefined
          }
        />
      ),
      Input: ({ props }) => {
        const handleInput =
          typeof props.onValueChange === "function"
            ? (event: { target: EventTarget | null }) =>
                props.onValueChange((event.target as HTMLInputElement).value)
            : undefined;

        return (
          <Input
            nativeInput
            onChange={handleInput}
            onInput={handleInput}
            placeholder={typeof props.placeholder === "string" ? props.placeholder : undefined}
            value={typeof props.value === "string" ? props.value : undefined}
          />
        );
      },
      Separator: () => <Separator />,
      DropdownMenu: ({ slots }) => <DropdownMenu>{slots.default}</DropdownMenu>,
      DropdownMenuTrigger: ({ slots }) => (
        <DropdownMenuTrigger>{slots.default}</DropdownMenuTrigger>
      ),
      DropdownMenuContent: ({ slots }) => (
        <DropdownMenuContent>{slots.default}</DropdownMenuContent>
      ),
      DropdownMenuItem: ({ props, slots }) => (
        <DropdownMenuItem
          onClick={typeof props.onClick === "function" ? props.onClick : undefined}
          variant={props.variant as React.ComponentProps<typeof DropdownMenuItem>["variant"]}
        >
          {slots.default}
        </DropdownMenuItem>
      ),
      DropdownMenuSeparator: () => <DropdownMenuSeparator />,
      Tabs: ({ props, slots }) => (
        <Tabs
          value={typeof props.value === "string" ? props.value : undefined}
          onValueChange={
            typeof props.onValueChange === "function" ? props.onValueChange : undefined
          }
        >
          {slots.default}
        </Tabs>
      ),
      TabsList: ({ slots }) => <TabsList>{slots.default}</TabsList>,
      TabsTab: ({ props, slots }) => (
        <TabsTab value={typeof props.value === "string" ? props.value : ""}>
          {slots.default}
        </TabsTab>
      ),
      TabsPanel: ({ props, slots }) => (
        <TabsPanel value={typeof props.value === "string" ? props.value : ""}>
          {slots.default}
        </TabsPanel>
      ),
    },
  });
}
