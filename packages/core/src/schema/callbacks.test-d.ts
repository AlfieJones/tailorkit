import { expectTypeOf } from "vitest";
import type { z } from "zod";
import type { InferCallback, InferCallbacks } from "./callbacks";

interface SaveCallback {
  input: readonly [z.ZodObject<{ title: z.ZodString }>, z.ZodNumber];
  output: z.ZodObject<{ saved: z.ZodBoolean }>;
}

interface LoadCallback {
  async: true;
  output: z.ZodObject<{ ready: z.ZodLiteral<true> }>;
}

expectTypeOf<InferCallback<SaveCallback>>().toEqualTypeOf<
  (args_0: { title: string }, args_1: number) => { saved: boolean }
>();

expectTypeOf<InferCallback<LoadCallback>>().toEqualTypeOf<() => Promise<{ ready: true }>>();
expectTypeOf<InferCallback<Record<never, never>>>().toEqualTypeOf<() => void>();

expectTypeOf<
  InferCallbacks<{
    onClose: Record<never, never>;
    onLoad: LoadCallback;
    omitted: undefined;
  }>
>().toEqualTypeOf<{
  onClose: () => void;
  onLoad: () => Promise<{ ready: true }>;
}>();
