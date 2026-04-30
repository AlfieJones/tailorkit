import { attr, createSchema } from "./globals";

export const selectSchema = createSchema<HTMLSelectElement>("select", {
  autoComplete: attr.string,
  disabled: attr.boolean,
  form: attr.string,
  multiple: attr.boolean,
  name: attr.string,
  required: attr.boolean,
  size: attr.number,
  value: attr.string,
});
