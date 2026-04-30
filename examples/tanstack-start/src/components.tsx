import { defineReactComponents } from "@tailorkit/react";
import { Button } from "@tailorkit/ui/button";
import { Input } from "@tailorkit/ui/input";
import { schema } from "./schema";

export const components = defineReactComponents(schema, {
  Button: ({ props, slots }) => <Button {...props}>{slots.default}</Button>,
  Input: ({ props, slots }) => <Input {...props}>{slots.default}</Input>,
});
