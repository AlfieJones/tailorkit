import { schema } from "./schema";

export { tailorClient } from "./components";
export { schema } from "./schema";

export const handlerDefinitions = Object.fromEntries(
  Object.entries(schema.$internal.metadata.components).map(([name, metadata]) => [
    name,
    metadata.callbacks,
  ]),
);
