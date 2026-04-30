import { attr, createSchema, FORM_ENCTYPE_VALUES } from "./globals";

export const formSchema = createSchema<HTMLFormElement>("form", {
  acceptCharset: attr.string,
  // Deliberately omitted for untrusted UI: native form submission can navigate or exfiltrate data.
  autoComplete: attr.enum("off", "on"),
  encType: attr.enum(...FORM_ENCTYPE_VALUES),
  method: attr.enum("dialog", "get", "post"),
  name: attr.string,
  noValidate: attr.boolean,
  rel: attr.string,
  target: attr.string,
});
