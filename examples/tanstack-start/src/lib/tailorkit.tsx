import { schema } from "@examples/shared";
import { createTailorKitClient, primitives as reactPrimitives } from "tailorkit/react";
import { Button } from "@tailorkit/ui/components/button";
import { Input } from "@tailorkit/ui/components/input";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@tailorkit/ui/components/tabs";

export const tailorClient = createTailorKitClient(schema, {
  baseUrl:
    typeof window === "undefined"
      ? "http://localhost/api/tailorkit/"
      : new URL("/api/tailorkit/", window.location.origin),
  components: {
    ...reactPrimitives,

    Button: ({ props, slots }) => <Button {...props}>{slots.default}</Button>,
    Input: ({ props, slots }) => <Input {...props}>{slots.default}</Input>,

    Tabs: ({ props, slots }) => <Tabs {...props}>{slots.default}</Tabs>,
    TabsList: ({ props, slots }) => <TabsList {...props}>{slots.default}</TabsList>,
    TabsTab: ({ props, slots }) => <TabsTab {...props}>{slots.default}</TabsTab>,
    TabsPanel: ({ props, slots }) => <TabsPanel {...props}>{slots.default}</TabsPanel>,
  },
});

export default tailorClient;
