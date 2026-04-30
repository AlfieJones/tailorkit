import { attr, createSchema } from "./globals";

export const fieldsetSchema = createSchema<HTMLFieldSetElement>("fieldset", {
  disabled: attr.boolean,
  form: attr.string,
  name: attr.string,
});
