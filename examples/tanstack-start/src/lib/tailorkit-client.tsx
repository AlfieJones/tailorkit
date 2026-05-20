import type { tailorKit } from "./tailorkit";
import { primitives as reactPrimitives, createTailorKitClient } from "tailorkit/react";
import { Button } from "@tailorkit/ui/components/button";
// import { Input } from "@tailorkit/ui/components/input";
// import { Tabs, TabsList, TabsPanel, TabsTab } from "@tailorkit/ui/components/tabs";

export const tailorKitClient = createTailorKitClient<typeof tailorKit>({
  baseUrl:
    typeof window === "undefined"
      ? "http://localhost/api/tailorkit/"
      : new URL("/api/tailorkit/", window.location.origin),
  components: {
    ...reactPrimitives,
    Button: ({ props, slots }) => <Button {...props}>{slots.default}</Button>,
    // Input: ({ props: { onValueChange, ...rest }, slots }) => (
    //   <Input onChange={(e) => onValueChange(e.target.value)} {...rest}>
    //     {slots.default}
    //   </Input>
    // ),
    // Tabs: ({ props, slots }) => <Tabs {...props}>{slots.default}</Tabs>,
    // TabsList: ({ props, slots }) => <TabsList {...props}>{slots.default}</TabsList>,
    // TabsTab: ({ props, slots }) => (
    //   <TabsTab value={props.value} {...props}>
    //     {slots.default}
    //   </TabsTab>
    // ),
    // TabsPanel: ({ props, slots }) => (
    //   <TabsPanel value={props.value} {...props}>
    //     {slots.default}
    //   </TabsPanel>
    // ),
  },
});

export default tailorKitClient;
