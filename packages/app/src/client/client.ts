import type { FunctionComponent } from "preact";

// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface TailorKitScreens {}

// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface TailorKitDefaultContext {}

export type ScreenPath = keyof TailorKitScreens & string;

export type ScreenProps<TPath extends ScreenPath> = TailorKitScreens[TPath] extends object
  ? { context: TailorKitScreens[TPath]["context"] }
  : Record<string, never>;

export type View<TProps extends object = Record<string, never>> = (
  props: TProps,
) => FunctionComponent;

type ScreenComponents = {
  [TPath in ScreenPath]: View<ScreenProps<TPath>>;
};

export interface TailorKitClient {
  fallbackScreen?: View<{ context: TailorKitDefaultContext }>;
  screens?: Partial<ScreenComponents>;
}

export const createClient = (options: TailorKitClient): TailorKitClient => options;
