import { createTailorKitClient, primitives } from "tailorkit/react";
import type { ReactNode } from "react";
import type { TailorKitApp } from "tailorkit/react";

export const marketplaceApps: TailorKitApp[] = [
  {
    clientPath: "/apps/stripe-revenue.js",
    description: "Payment and subscription signals for your customer relationships.",
    id: "stripe-revenue",
    name: "Stripe Revenue",
  },
  {
    clientPath: "/apps/renewal-coach.js",
    description: "A focused account health workspace for renewals.",
    id: "renewal-coach",
    name: "Renewal Coach",
  },
];

export const tailor = createTailorKitClient({
  baseUrl:
    typeof window === "undefined"
      ? "http://localhost/api/tailorkit/"
      : new URL("/api/tailorkit/", window.location.origin),
  components: {
    ...primitives,
    Button: ({
      props,
      slots,
    }: {
      props: { onClick?: () => void };
      slots: { default?: ReactNode };
    }) => (
      <button className="tailorkit-remote-button" onClick={props.onClick} type="button">
        {slots.default}
      </button>
    ),
  },
} as never);
