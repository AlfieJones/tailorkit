import { expectTypeOf } from "vitest";
import type { z } from "zod";
import type { ScreenDefinition, ScreenDefinitions } from "./screens";

type CustomerScreen = ScreenDefinition<z.ZodObject<{ customerId: z.ZodString }>>;

expectTypeOf<CustomerScreen>().toMatchTypeOf<{
  context?: z.ZodObject<{ customerId: z.ZodString }>;
}>();

expectTypeOf<{
  "/customers/:customerId": CustomerScreen;
}>().toMatchTypeOf<ScreenDefinitions>();
