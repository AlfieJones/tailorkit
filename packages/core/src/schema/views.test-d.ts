import { expectTypeOf } from "vitest";
import type { z } from "zod";
import type { ViewDefinition, ViewDefinitions } from "./views";

type CustomerView = ViewDefinition<z.ZodObject<{ customerId: z.ZodString }>>;

expectTypeOf<CustomerView>().toMatchTypeOf<{
  context?: z.ZodObject<{ customerId: z.ZodString }>;
}>();

expectTypeOf<{
  "/customers/:customerId": CustomerView;
}>().toMatchTypeOf<ViewDefinitions>();
