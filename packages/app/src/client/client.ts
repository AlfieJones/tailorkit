import { h, render } from "preact";
import type { ComponentType, VNode } from "preact";
import { version as preactVersion } from "preact/package.json";
import { assertSupportedPreactVersion } from "../preact-version.js";

// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface TailorKitScreens {}

export type ScreenPath = keyof TailorKitScreens & string;

export type ScreenProps<TPath extends ScreenPath> = TailorKitScreens[TPath] extends object
  ? TailorKitScreens[TPath]
  : Record<string, never>;

export type ScreenComponent<TProps extends object = Record<string, never>> = ComponentType<TProps>;

type ScreenComponents = {
  [TPath in ScreenPath]: ScreenComponent<ScreenProps<TPath>>;
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

export const createClient = (options: TailorKitClient): TailorKitClientWithMeta => ({
  ...options,
  $meta: {
    preactVersion,
  },
  $runtime: {
    h,
    render,
  },
});
