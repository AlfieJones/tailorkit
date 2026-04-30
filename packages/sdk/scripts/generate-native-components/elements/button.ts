import { attr, createSchema, formSubmitterAttrs } from "./globals";

export const buttonSchema = createSchema<HTMLButtonElement>("button", {
  command: attr.string,
  commandFor: attr.string,
  disabled: attr.boolean,
  ...formSubmitterAttrs,
  name: attr.string,
  popoverTarget: attr.string,
  popoverTargetAction: attr.enum("hide", "show", "toggle"),
  type: attr.enum("button", "reset", "submit"),
  value: attr.string,
});
