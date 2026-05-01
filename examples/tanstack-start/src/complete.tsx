import { tailorKit } from "@tailorkit/sdk";

import { tailorClient } from "./components";
import { schema as tailorSchema } from "./schema";

export { tailorClient, tailorSchema };

export const tailor = tailorKit(tailorSchema);
