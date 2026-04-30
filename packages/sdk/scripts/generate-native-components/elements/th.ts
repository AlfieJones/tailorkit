import { attr, createSchema } from "./globals";

export const thSchema = createSchema<HTMLElement>("th", {
  abbr: attr.string,
  colSpan: attr.number,
  headers: attr.string,
  rowSpan: attr.number,
  scope: attr.enum("col", "colgroup", "row", "rowgroup"),
});
