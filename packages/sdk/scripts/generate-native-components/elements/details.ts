import { attr, createSchema } from "./globals";

export const detailsSchema = createSchema<HTMLDetailsElement>("details", {
  name: attr.string,
  open: attr.boolean,
});
