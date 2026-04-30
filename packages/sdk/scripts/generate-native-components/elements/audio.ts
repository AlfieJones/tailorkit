import { createSchema, mediaAttrs } from "./globals";

export const audioSchema = createSchema<HTMLAudioElement>("audio", mediaAttrs);
