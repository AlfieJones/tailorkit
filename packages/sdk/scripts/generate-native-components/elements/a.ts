import type { AttributeSchema } from "./globals";
import { attr, booleanOrString, createSchema, REFERRER_POLICY_VALUES } from "./globals";

const anchorAttrs = {
  download: booleanOrString,
  href: attr.string,
  hrefLang: attr.string,
  media: attr.string,
  ping: attr.string,
  referrerPolicy: attr.enum(...REFERRER_POLICY_VALUES),
  rel: attr.string,
  target: attr.string,
  type: attr.string,
} satisfies Record<string, AttributeSchema>;

export const aSchema = createSchema<HTMLAnchorElement>("a", anchorAttrs);
