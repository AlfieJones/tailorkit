import { attr, createSchema } from "./globals";

export const tdSchema = createSchema<HTMLElement>("td", {
  colSpan: attr.number,
  headers: attr.string,
  rowSpan: attr.number,
});
