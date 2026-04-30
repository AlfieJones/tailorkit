import { attr, createSchema, mediaAttrs, numberOrString } from "./globals";

export const videoSchema = createSchema<HTMLVideoElement>("video", {
  ...mediaAttrs,
  height: numberOrString,
  playsInline: attr.boolean,
  poster: attr.string,
  width: numberOrString,
});
