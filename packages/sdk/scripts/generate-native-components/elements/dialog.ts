import { attr, createSchema } from "./globals";

export const dialogSchema = createSchema<HTMLDialogElement>("dialog", {
  open: attr.boolean,
});
