import { createView } from "./app";

declare module "@tailorkit/app" {
  interface TailorKitViews {
    "/package-test": { context: { customerId: string } };
  }
}

const view = createView("/package-test", { component: () => null });
const context = view.useContext();
context.customerId satisfies string;
// @ts-expect-error The umbrella export must preserve the registered context type.
context.customerId satisfies number;
