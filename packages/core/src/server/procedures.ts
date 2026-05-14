import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const requireResourceId = (context: Context): string => {
  if (!context.tailorkit.resourceId) {
    throw new ORPCError("BAD_REQUEST", { message: "Missing TailorKit resourceId" });
  }

  return context.tailorkit.resourceId;
};
