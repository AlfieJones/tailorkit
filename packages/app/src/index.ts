import { h, render } from "preact";
import type { ComponentChild, VNode } from "preact";
import { version as preactVersion } from "preact/package.json";
import { assertSupportedPreactVersion } from "./preact-version.js";

// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface TailorKitScreens {}

export type ScreenPath = keyof TailorKitScreens & string;

export type ScreenProps<TPath extends ScreenPath> = TailorKitScreens[TPath] extends object
  ? TailorKitScreens[TPath]
  : Record<string, never>;

export type View<TProps extends object = Record<string, never>> = (props: TProps) => ComponentChild;

type ScreenComponents = {
  [TPath in ScreenPath]: View<ScreenProps<TPath>>;
};

export interface TailorKitClient {
  screens: ScreenComponents;
}

export interface TailorKitClientMeta {
  preactVersion: string;
}

export interface TailorKitClientRuntime {
  h: typeof h;
  render: (vnode: VNode, parent: Element | Document | ShadowRoot | DocumentFragment) => void;
}

export type TailorKitClientWithMeta = TailorKitClient & {
  $meta: TailorKitClientMeta;
  $runtime: TailorKitClientRuntime;
};

assertSupportedPreactVersion(preactVersion);

export const createClient = (client: TailorKitClient): TailorKitClientWithMeta => ({
  ...client,
  $meta: {
    preactVersion,
  },
  $runtime: {
    h,
    render,
  },
});
export const defineClient = createClient;

const componentTagPrefix = "tailorkit-";

const toComponentTagName = (name: string): string =>
  `${componentTagPrefix}${name
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replaceAll(/[\s_]+/g, "-")
    .toLowerCase()}`;

export const createRemoteComponent = <TProps extends object, TSlots extends readonly string[]>(
  name: string,
  _options: { slots: TSlots },
): View<TProps & { children?: ComponentChild }> => {
  const tagName = toComponentTagName(name);

  return function RemoteComponent({ children, ...props }) {
    return h(tagName, props, children);
  };
};
