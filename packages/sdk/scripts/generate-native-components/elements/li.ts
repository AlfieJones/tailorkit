import { attr, createSchema } from "./globals";

export const liSchema = createSchema<HTMLLIElement>("li", {
  value: attr.number,
});
