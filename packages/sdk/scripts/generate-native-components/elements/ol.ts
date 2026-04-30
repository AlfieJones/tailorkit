import { attr, createSchema } from "./globals";

export const olSchema = createSchema<HTMLOListElement>("ol", {
  reversed: attr.boolean,
  start: attr.number,
  type: attr.enum("1", "A", "a", "I", "i"),
});
