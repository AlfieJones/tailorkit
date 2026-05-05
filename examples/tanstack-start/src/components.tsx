import { createReactClient } from "@tailorkit/react";
import { Button } from "@tailorkit/ui/button";
import { Input } from "@tailorkit/ui/input";
import { useId } from "react";
import type { FormEventHandler } from "react";
import { schema } from "./schema";

export const tailorClient = createReactClient(schema, {
  components: {
    Button: ({ props, slots }) => <Button {...props}>{slots.default}</Button>,
    Input: ({ props }) => {
      const id = useId();
      const { label, name, onInput, placeholder, value } = props;

      return (
        <label className="host-field" htmlFor={id}>
          {label && <span>{label}</span>}
          <Input
            id={id}
            name={typeof name === "string" ? name : undefined}
            nativeInput
            placeholder={typeof placeholder === "string" ? placeholder : undefined}
            value={typeof value === "string" ? value : undefined}
            onInput={onInput as FormEventHandler<HTMLInputElement> | undefined}
          />
        </label>
      );
    },
  },
});

export const callbackDefinitions = Object.fromEntries(
  Object.entries(schema.$internal.metadata.components).map(([name, metadata]) => [
    name,
    metadata.callbacks,
  ]),
);
