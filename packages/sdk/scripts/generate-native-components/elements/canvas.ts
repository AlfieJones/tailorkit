import { attr, createSchema } from "./globals";

export const canvasSchema = createSchema<HTMLCanvasElement>("canvas", {
  height: attr.number,
  width: attr.number,
});
