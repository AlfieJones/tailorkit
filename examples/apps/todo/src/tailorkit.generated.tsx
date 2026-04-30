import { createRemoteComponent } from "@tailorkit/sandbox-ui/worker";
import type { ComponentChildren, FunctionalComponent } from "preact";

export interface ButtonProps {
  children?: ComponentChildren;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "default" | "secondary";
}

export const Button = createRemoteComponent("Button") as unknown as FunctionalComponent<ButtonProps>;
