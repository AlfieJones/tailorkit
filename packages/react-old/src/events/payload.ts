import type {
  AnimationEvent,
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  SyntheticEvent,
  TransitionEvent,
  UIEvent,
  WheelEvent,
} from "react";

const getElementId = (target: EventTarget | null): string | undefined =>
  target instanceof Element ? target.id : undefined;

const getPointerType = (value: string): "mouse" | "pen" | "touch" | undefined =>
  value === "mouse" || value === "pen" || value === "touch" ? value : undefined;

export const mapBaseEvent = <const TName extends string>(
  name: TName,
  event: SyntheticEvent<HTMLElement>,
) => ({
  currentTargetId: event.currentTarget.id,
  name,
  targetId: getElementId(event.target) ?? event.currentTarget.id,
});

export const mapFocusEvent = <const TName extends "blur" | "focus">(
  name: TName,
  event: FocusEvent<HTMLElement>,
) => ({
  ...mapBaseEvent(name, event),
  relatedTargetId: getElementId(event.relatedTarget),
});

export const mapMouseEvent = <const TName extends string>(
  name: TName,
  event: MouseEvent<HTMLElement>,
) => ({
  ...mapBaseEvent(name, event),
  altKey: event.altKey,
  button: event.button,
  buttons: event.buttons,
  clientX: event.clientX,
  clientY: event.clientY,
  ctrlKey: event.ctrlKey,
  detail: event.detail,
  metaKey: event.metaKey,
  movementX: event.movementX,
  movementY: event.movementY,
  pageX: event.pageX,
  pageY: event.pageY,
  screenX: event.screenX,
  screenY: event.screenY,
  shiftKey: event.shiftKey,
});

export const mapKeyboardEvent = <const TName extends string>(
  name: TName,
  event: KeyboardEvent<HTMLElement>,
) => ({
  ...mapBaseEvent(name, event),
  altKey: event.altKey,
  code: event.code,
  ctrlKey: event.ctrlKey,
  detail: event.detail,
  isComposing: (event.nativeEvent as { isComposing?: boolean }).isComposing,
  key: event.key,
  location: event.location,
  metaKey: event.metaKey,
  repeat: event.repeat,
  shiftKey: event.shiftKey,
});

export const mapInputEvent = <const TName extends string>(
  name: TName,
  event: FormEvent<HTMLElement>,
) => {
  const nativeEvent = event.nativeEvent as {
    inputType?: string;
    isComposing?: boolean;
  };

  return {
    ...mapBaseEvent(name, event),
    inputType: nativeEvent.inputType,
    isComposing: nativeEvent.isComposing,
  };
};

export const mapPointerEvent = <const TName extends string>(
  name: TName,
  event: PointerEvent<HTMLElement>,
) => ({
  ...mapMouseEvent(name, event),
  height: event.height,
  isPrimary: event.isPrimary,
  pointerId: event.pointerId,
  pointerType: getPointerType(event.pointerType),
  pressure: event.pressure,
  tangentialPressure: event.tangentialPressure,
  tiltX: event.tiltX,
  tiltY: event.tiltY,
  twist: event.twist,
  width: event.width,
});

export const mapWheelEvent = <const TName extends string>(
  name: TName,
  event: WheelEvent<HTMLElement>,
) => ({
  ...mapMouseEvent(name, event),
  deltaMode: event.deltaMode,
  deltaX: event.deltaX,
  deltaY: event.deltaY,
  deltaZ: event.deltaZ,
});

export const mapScrollEvent = (event: UIEvent<HTMLElement>) => ({
  ...mapBaseEvent("scroll", event),
  scrollHeight: event.currentTarget.scrollHeight,
  scrollLeft: event.currentTarget.scrollLeft,
  scrollTop: event.currentTarget.scrollTop,
  scrollWidth: event.currentTarget.scrollWidth,
});

export const mapAnimationEvent = <const TName extends string>(
  name: TName,
  event: AnimationEvent<HTMLElement>,
) => ({
  ...mapBaseEvent(name, event),
  animationName: event.animationName,
  elapsedTime: event.elapsedTime,
  pseudoElement: event.pseudoElement,
});

export const mapTransitionEvent = <const TName extends string>(
  name: TName,
  event: TransitionEvent<HTMLElement>,
) => ({
  ...mapBaseEvent(name, event),
  elapsedTime: event.elapsedTime,
  propertyName: event.propertyName,
  pseudoElement: event.pseudoElement,
});

export const mapToggleEvent = <const TName extends string>(
  name: TName,
  event: SyntheticEvent<HTMLElement>,
) => {
  const nativeEvent = event.nativeEvent as {
    newState?: "closed" | "open";
    oldState?: "closed" | "open";
  };

  return {
    ...mapBaseEvent(name, event),
    newState: nativeEvent.newState,
    oldState: nativeEvent.oldState,
  };
};
