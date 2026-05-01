import type { ComponentChild } from "@tailorkit/sandbox-ui/worker";

export {
  createRemoteComponent,
  createSlotComponent,
  exposePreactWorker,
  Fragment,
  TAILORKIT_SLOT_TYPE,
} from "./worker";
export type { RemoteHostEvent } from "./worker";

// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface TailorKitScreens {}
// oxlint-disable-next-line typescript-eslint/no-empty-interface, typescript-eslint/no-empty-object-type
export interface TailorKitFallbackScreenProps {}

export type ScreenPath = keyof TailorKitScreens & string;

export type ScreenProps<TPath extends ScreenPath> = TailorKitScreens[TPath] extends object
  ? TailorKitScreens[TPath]
  : Record<string, never>;
export type FallbackScreenProps = TailorKitFallbackScreenProps extends object
  ? TailorKitFallbackScreenProps
  : Record<string, never>;

export type View<TProps extends object = Record<string, never>> = (props: TProps) => ComponentChild;

type ScreenComponents = {
  [TPath in ScreenPath]: View<ScreenProps<TPath>>;
};

export interface TailorKitClient {
  fallbackScreen?: View<FallbackScreenProps>;
  screens?: Partial<ScreenComponents>;
}

export const defineClient = (client: TailorKitClient): TailorKitClient => client;
