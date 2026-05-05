import type { NativeEventMap } from "@tailorkit/sdk";

import type {
  AdapterEventProps,
  NativeEventHandlers,
  ReservedAdapterProps,
} from "@tailorkit/adapter-core";
import { toAdapterEventProps } from "@tailorkit/adapter-core";

import { reactEventAdapter } from "./native-events.generated";

export { reactEventAdapter } from "./native-events.generated";

export type ReactEventAdapter = typeof reactEventAdapter;

export type ReactNativeEventProps<
  TNativeEvents,
  TReservedKeys extends PropertyKey = never,
> = AdapterEventProps<TNativeEvents, TReservedKeys, ReactEventAdapter>;

/**
 * Converts canonical TailorKit native event handlers into React event props.
 * Schema packages stay framework-neutral; this is the React translation layer.
 */
export function toReactNativeEventProps<
  const TNativeEvents extends NativeEventMap,
  TReservedKeys extends PropertyKey = never,
>(
  nativeEvents: TNativeEvents,
  handlers: NativeEventHandlers<TNativeEvents>,
  reservedProps?: ReservedAdapterProps,
): ReactNativeEventProps<TNativeEvents, TReservedKeys> {
  return toAdapterEventProps<TNativeEvents, ReactEventAdapter, TReservedKeys>(
    nativeEvents,
    handlers,
    reactEventAdapter,
    reservedProps,
  );
}
