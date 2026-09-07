import { createScreen } from "./app";

declare module "@tailorkit/app" {
  interface TailorKitScreens {
    "/package-test": { context: { customerId: string } };
  }
}

const screen = createScreen("/package-test", { component: () => null });
const context = screen.useContext();
context.customerId satisfies string;
// @ts-expect-error The umbrella export must preserve the registered context type.
context.customerId satisfies number;
