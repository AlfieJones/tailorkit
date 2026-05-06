import { h, render } from "preact";
import type { ComponentType, VNode } from "preact";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { version as preactVersion } from "preact/package.json";
import { assertSupportedPreactVersion } from "../preact-version.js";

// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface TailorKitScreens {}

export type ScreenPath = Extract<keyof TailorKitScreens & string, `/${string}`>;
export type AppScreenPath = ScreenPath;

export type ScreenProps<TPath extends ScreenPath> = TailorKitScreens[TPath] extends object
  ? TailorKitScreens[TPath]
  : Record<string, never>;

export type ScreenPropsForPath<TPath extends AppScreenPath> = TPath extends ScreenPath
  ? ScreenProps<TPath>
  : never;

export type ScreenContext<TPath extends AppScreenPath> =
  ScreenPropsForPath<TPath> extends { context: infer TContext } ? TContext : Record<string, never>;

export type ScreenComponent<TProps extends object = Record<string, never>> = ComponentType<TProps>;

export interface ScreenDefinition<TPath extends AppScreenPath = AppScreenPath> {
  component: ScreenComponent<ScreenPropsForPath<TPath>>;
  path: TPath;
  useContext: () => ScreenContext<TPath>;
}

type RegisteredScreens = {
  [TPath in AppScreenPath]: ScreenDefinition<TPath>;
};

type ScreenDefinitions = Partial<RegisteredScreens>;

type InvalidScreenPath<TScreens> = Exclude<keyof TScreens & string, `/${string}`>;

type RequireScreenPaths<TScreens> =
  InvalidScreenPath<TScreens> extends never
    ? unknown
    : {
        readonly __tailorkit_error__: `Screen paths must start with "/". Invalid screen: ${InvalidScreenPath<TScreens>}`;
      };

type ScreenKeyPathMismatch<TScreens> = {
  [TPath in keyof TScreens & string]: TScreens[TPath] extends ScreenDefinition<infer TScreenPath>
    ? TScreenPath extends TPath
      ? never
      : TPath
    : TPath;
}[keyof TScreens & string];

type RequireMatchingScreenKeys<TScreens> =
  ScreenKeyPathMismatch<TScreens> extends never
    ? unknown
    : {
        readonly __tailorkit_error__: `Screen key must match createScreen path. Invalid screen: ${ScreenKeyPathMismatch<TScreens>}`;
      };

export interface TailorKitClient<TScreens extends ScreenDefinitions = ScreenDefinitions> {
  screens: TScreens;
}

export interface TailorKitClientMeta {
  preactVersion: string;
}

export interface TailorKitClientRuntime {
  h: typeof h;
  render: (vnode: VNode, parent: Element | Document | ShadowRoot | DocumentFragment) => void;
}

export type TailorKitClientWithMeta<TScreens extends ScreenDefinitions = ScreenDefinitions> =
  TailorKitClient<TScreens> & {
    $meta: TailorKitClientMeta;
    $runtime: TailorKitClientRuntime;
  };

assertSupportedPreactVersion(preactVersion);

export const createScreen = <const TPath extends AppScreenPath>(
  path: TPath,
  options: { component: ScreenComponent<Record<string, never>> },
): ScreenDefinition<TPath> => {
  const Context = createContext<ScreenContext<TPath> | null>(null);

  const Screen = (props: ScreenPropsForPath<TPath>) => {
    const context = "context" in props ? props.context : {};

    return h(
      Context.Provider,
      { value: context as ScreenContext<TPath> },
      h(options.component as ComponentType<object>, {}),
    );
  };

  return {
    component: Screen,
    path,
    useContext: () => {
      const context = useContext(Context);

      if (context === null) {
        throw new Error(`Screen context is only available while rendering "${path}".`);
      }

      return context;
    },
  };
};

export const createClient = <const TScreens extends ScreenDefinitions>(
  options: TailorKitClient<TScreens> &
    RequireScreenPaths<TScreens> &
    RequireMatchingScreenKeys<TScreens>,
): TailorKitClientWithMeta<TScreens> => ({
  ...options,
  $meta: {
    preactVersion,
  },
  $runtime: {
    h,
    render,
  },
});
