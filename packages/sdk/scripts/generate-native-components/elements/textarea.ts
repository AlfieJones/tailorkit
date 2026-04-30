import { attr, createSchema } from "./globals";

export const textareaSchema = createSchema<HTMLTextAreaElement>("textarea", {
  autoComplete: attr.string,
  cols: attr.number,
  dirname: attr.string,
  disabled: attr.boolean,
  form: attr.string,
  maxLength: attr.number,
  minLength: attr.number,
  name: attr.string,
  placeholder: attr.string,
  readOnly: attr.boolean,
  required: attr.boolean,
  rows: attr.number,
  value: attr.string,
  wrap: attr.enum("hard", "off", "soft"),
});
