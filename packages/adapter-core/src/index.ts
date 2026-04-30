import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { InferCallback, NativeEventDefinition, NativeEventMap, Schema } from "@tailorkit/sdk";

export type NativeElementEventRegistry = Record<string, NativeEventMap>;

export type NativeEventPayload<TNativeEvent> =
  TNativeEvent extends NativeEventDefinition<infer TInput>
    ? TInput extends readonly [infer TPayload, ...unknown[]]
      ? TPayload extends Schema
        ? StandardSchemaV1.InferOutput<TPayload>
        : never
      : never
    : never;

type OptionalPayloadKeys<TPayload> = {
  [TKey in keyof TPayload]-?: Record<string, never> extends Pick<TPayload, TKey> ? TKey : never;
}[keyof TPayload];

export type RequireNativeEventPayloadKeys<TPayload> = {
  [TKey in keyof Required<TPayload>]:
    | Required<TPayload>[TKey]
    | (TKey extends OptionalPayloadKeys<TPayload> ? undefined : never);
};

export interface EventAdapterEntry<
  TProp extends string = string,
  TEvent = unknown,
  TPayload = unknown,
> {
  mapEvent: (event: TEvent) => TPayload;
  prop: TProp;
}

export type AnyEventAdapter = Record<
  string,
  Record<string, EventAdapterEntry<string, never, unknown> | undefined> | undefined
>;

export type EventAdapterForNativeEvents<TNativeEvents> = {
  [TKey in keyof TNativeEvents]-?: NonNullable<TNativeEvents[TKey]> extends NativeEventDefinition
    ? EventAdapterEntry<
        string,
        never,
        RequireNativeEventPayloadKeys<NativeEventPayload<NonNullable<TNativeEvents[TKey]>>>
      >
    : never;
};

export type EventAdapterForRegistry<TRegistry extends NativeElementEventRegistry> = {
  [TElement in keyof TRegistry]-?: EventAdapterForNativeEvents<TRegistry[TElement]>;
};

export type EventAdapterEntryFor<
  TAdapter,
  TEvent extends NativeEventDefinition,
> = TEvent["element"] extends keyof TAdapter
  ? TEvent["name"] extends keyof TAdapter[TEvent["element"]]
    ? TAdapter[TEvent["element"]][TEvent["name"]]
    : never
  : never;

export type AdapterEventProps<
  TNativeEvents,
  TReservedKeys extends PropertyKey = never,
  TAdapter = AnyEventAdapter,
> = TNativeEvents extends NativeEventMap
  ? {
      [TKey in keyof TNativeEvents as NonNullable<TNativeEvents[TKey]> extends NativeEventDefinition
        ? EventAdapterEntryFor<TAdapter, NonNullable<TNativeEvents[TKey]>> extends {
            prop: infer TProp extends string;
          }
          ? TProp extends TReservedKeys
            ? never
            : TProp
          : never
        : never]?: NonNullable<TNativeEvents[TKey]> extends NativeEventDefinition
        ? EventAdapterEntryFor<TAdapter, NonNullable<TNativeEvents[TKey]>> extends {
            mapEvent: (event: infer TEvent) => unknown;
          }
          ? (event: TEvent) => void
          : never
        : never;
    }
  : Record<string, never>;

export type NativeEventHandlers<TNativeEvents> = TNativeEvents extends NativeEventMap
  ? {
      [TKey in keyof TNativeEvents]?: InferCallback<NonNullable<TNativeEvents[TKey]>>;
    }
  : Record<string, never>;

export type ReservedAdapterProps =
  | ReadonlySet<string>
  | readonly string[]
  | Record<string, unknown>
  | undefined;

export const defineEventAdapter =
  <TRegistry extends NativeElementEventRegistry>() =>
  <const TAdapter extends EventAdapterForRegistry<TRegistry>>(adapter: TAdapter): TAdapter =>
    adapter;

export const hasReservedAdapterProp = (
  reservedProps: ReservedAdapterProps,
  prop: string,
): boolean => {
  if (!reservedProps) {
    return false;
  }
  if (reservedProps instanceof Set) {
    return reservedProps.has(prop);
  }
  if (Array.isArray(reservedProps)) {
    return reservedProps.includes(prop);
  }
  return prop in reservedProps;
};

/**
 * Converts canonical TailorKit native event handlers into framework adapter
 * props. Framework packages provide the event adapter map and event mappers.
 */
export function toAdapterEventProps<
  const TNativeEvents extends NativeEventMap,
  const TAdapter extends AnyEventAdapter,
  TReservedKeys extends PropertyKey = never,
>(
  nativeEvents: TNativeEvents,
  handlers: NativeEventHandlers<TNativeEvents>,
  adapter: TAdapter,
  reservedProps?: ReservedAdapterProps,
): AdapterEventProps<TNativeEvents, TReservedKeys, TAdapter> {
  const props: Record<string, (event: unknown) => void> = {};

  const entries = Object.entries(nativeEvents) as [string, NativeEventDefinition | undefined][];
  for (const [eventKey, definition] of entries) {
    if (!definition) {
      continue;
    }
    const handler = handlers[eventKey as keyof NativeEventHandlers<TNativeEvents>];
    const entry = adapter[definition.element]?.[definition.name];
    if (!(handler && entry) || hasReservedAdapterProp(reservedProps, entry.prop)) {
      continue;
    }

    props[entry.prop] = (event) => {
      const mapEvent = entry.mapEvent as (value: unknown) => unknown;
      void handler(mapEvent(event) as never);
    };
  }

  return props as AdapterEventProps<TNativeEvents, TReservedKeys, TAdapter>;
}
