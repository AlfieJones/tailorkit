import { expectTypeOf } from "vitest";
import type { z } from "zod";
import type { ScopeDefinition, ScopeDefinitions } from "./scopes";

type CustomerScreen = ScopeDefinition<z.ZodObject<{ customerId: z.ZodString }>>;

expectTypeOf<CustomerScreen>().toMatchTypeOf<{
  context?: z.ZodObject<{ customerId: z.ZodString }>;
}>();

expectTypeOf<{
  "/customers/:customerId": CustomerScreen;
}>().toMatchTypeOf<ScopeDefinitions>();
