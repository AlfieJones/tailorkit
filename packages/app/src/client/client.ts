import type { ComponentType } from "preact";

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

export const createClient = (options: TailorKitClient): TailorKitClient => options;
