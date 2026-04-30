// Auto-generated. Run: bun packages/sdk/scripts/generate-native-components
import { defineEventAdapter } from "@tailorkit/adapter-core";
import type { native } from "@tailorkit/sdk/native-zod";
import type {
  AnimationEvent,
  ClipboardEvent,
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

import {
  mapAnimationEvent,
  mapBaseEvent,
  mapFocusEvent,
  mapInputEvent,
  mapKeyboardEvent,
  mapMouseEvent,
  mapPointerEvent,
  mapScrollEvent,
  mapToggleEvent,
  mapTransitionEvent,
  mapWheelEvent,
} from "./payload";

type ReactNativeEventRegistry = {
  [TElement in keyof typeof native]: NonNullable<(typeof native)[TElement]["nativeEvents"]>;
};

export const reactEventAdapter = defineEventAdapter<ReactNativeEventRegistry>()({
  a: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLAnchorElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLAnchorElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLAnchorElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLAnchorElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLAnchorElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLAnchorElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLAnchorElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLAnchorElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLAnchorElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLAnchorElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLAnchorElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLAnchorElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLAnchorElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLAnchorElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLAnchorElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLAnchorElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLAnchorElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLAnchorElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLAnchorElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLAnchorElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLAnchorElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLAnchorElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLAnchorElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLAnchorElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLAnchorElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLAnchorElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLAnchorElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLAnchorElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLAnchorElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLAnchorElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLAnchorElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLAnchorElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  article: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  aside: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  audio: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLAudioElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLAudioElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLAudioElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLAudioElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLAudioElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLAudioElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLAudioElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLAudioElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLAudioElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLAudioElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLAudioElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLAudioElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLAudioElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLAudioElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLAudioElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLAudioElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLAudioElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLAudioElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLAudioElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLAudioElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLAudioElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLAudioElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLAudioElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLAudioElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLAudioElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLAudioElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLAudioElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLAudioElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLAudioElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLAudioElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLAudioElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLAudioElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  button: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLButtonElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLButtonElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLButtonElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLButtonElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLButtonElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLButtonElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLButtonElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLButtonElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLButtonElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLButtonElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLButtonElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLButtonElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLButtonElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLButtonElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLButtonElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLButtonElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLButtonElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLButtonElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLButtonElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLButtonElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLButtonElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLButtonElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLButtonElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLButtonElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLButtonElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLButtonElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLButtonElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLButtonElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLButtonElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLButtonElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLButtonElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLButtonElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  canvas: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLCanvasElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLCanvasElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLCanvasElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLCanvasElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLCanvasElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLCanvasElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLCanvasElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLCanvasElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLCanvasElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLCanvasElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLCanvasElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLCanvasElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLCanvasElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLCanvasElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLCanvasElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLCanvasElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLCanvasElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLCanvasElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLCanvasElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLCanvasElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLCanvasElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLCanvasElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLCanvasElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLCanvasElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLCanvasElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLCanvasElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLCanvasElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLCanvasElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLCanvasElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLCanvasElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLCanvasElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLCanvasElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  details: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLDetailsElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLDetailsElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLDetailsElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLDetailsElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLDetailsElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLDetailsElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLDetailsElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLDetailsElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLDetailsElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLDetailsElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLDetailsElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLDetailsElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLDetailsElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLDetailsElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLDetailsElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLDetailsElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLDetailsElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLDetailsElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLDetailsElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLDetailsElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLDetailsElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLDetailsElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLDetailsElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLDetailsElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLDetailsElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLDetailsElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLDetailsElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLDetailsElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLDetailsElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLDetailsElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLDetailsElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLDetailsElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  dialog: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLDialogElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLDialogElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLDialogElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLDialogElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLDialogElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLDialogElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLDialogElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLDialogElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLDialogElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLDialogElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLDialogElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLDialogElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLDialogElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLDialogElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLDialogElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLDialogElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLDialogElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLDialogElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLDialogElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLDialogElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLDialogElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLDialogElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLDialogElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLDialogElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLDialogElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLDialogElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLDialogElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLDialogElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLDialogElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLDialogElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLDialogElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLDialogElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  div: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLDivElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLDivElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLDivElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLDivElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLDivElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLDivElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLDivElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLDivElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLDivElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLDivElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLDivElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLDivElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLDivElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLDivElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLDivElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLDivElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLDivElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLDivElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLDivElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLDivElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLDivElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLDivElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLDivElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLDivElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLDivElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLDivElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLDivElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLDivElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLDivElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLDivElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLDivElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLDivElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  fieldset: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLFieldSetElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLFieldSetElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLFieldSetElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLFieldSetElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLFieldSetElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLFieldSetElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLFieldSetElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLFieldSetElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLFieldSetElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLFieldSetElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLFieldSetElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLFieldSetElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLFieldSetElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLFieldSetElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLFieldSetElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLFieldSetElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLFieldSetElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLFieldSetElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLFieldSetElement>) =>
        mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLFieldSetElement>) =>
        mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLFieldSetElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLFieldSetElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLFieldSetElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLFieldSetElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLFieldSetElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLFieldSetElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLFieldSetElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLFieldSetElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLFieldSetElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLFieldSetElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLFieldSetElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLFieldSetElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  footer: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  form: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLFormElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLFormElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLFormElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLFormElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLFormElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLFormElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLFormElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLFormElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLFormElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLFormElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLFormElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLFormElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLFormElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLFormElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLFormElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLFormElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLFormElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLFormElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLFormElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLFormElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLFormElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLFormElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLFormElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLFormElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLFormElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLFormElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLFormElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLFormElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLFormElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLFormElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLFormElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLFormElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  h1: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLHeadingElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLHeadingElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLHeadingElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  h2: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLHeadingElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLHeadingElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLHeadingElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  h3: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLHeadingElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLHeadingElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLHeadingElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  h4: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLHeadingElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLHeadingElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLHeadingElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  h5: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLHeadingElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLHeadingElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLHeadingElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  h6: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLHeadingElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLHeadingElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLHeadingElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLHeadingElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLHeadingElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLHeadingElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLHeadingElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLHeadingElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLHeadingElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLHeadingElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLHeadingElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  header: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  img: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLImageElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLImageElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLImageElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLImageElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLImageElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLImageElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLImageElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLImageElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLImageElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLImageElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLImageElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLImageElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLImageElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLImageElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLImageElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLImageElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLImageElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLImageElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLImageElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLImageElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLImageElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLImageElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLImageElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLImageElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLImageElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLImageElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLImageElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLImageElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLImageElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLImageElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLImageElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLImageElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  input: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLInputElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLInputElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLInputElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLInputElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLInputElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLInputElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLInputElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLInputElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLInputElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLInputElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLInputElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLInputElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLInputElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLInputElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLInputElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLInputElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLInputElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLInputElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLInputElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLInputElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLInputElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLInputElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLInputElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLInputElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLInputElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLInputElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLInputElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLInputElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLInputElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLInputElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLInputElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLInputElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  label: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLLabelElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLLabelElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLLabelElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLLabelElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLLabelElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLLabelElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLLabelElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLLabelElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLLabelElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLLabelElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLLabelElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLLabelElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLLabelElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLLabelElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLLabelElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLLabelElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLLabelElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLLabelElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLLabelElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLLabelElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLLabelElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLLabelElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLLabelElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLLabelElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLLabelElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLLabelElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLLabelElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLLabelElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLLabelElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLLabelElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLLabelElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLLabelElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  li: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLLIElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLLIElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLLIElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLLIElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLLIElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLLIElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLLIElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLLIElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLLIElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLLIElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLLIElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLLIElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLLIElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLLIElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLLIElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLLIElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLLIElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLLIElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLLIElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLLIElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLLIElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLLIElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLLIElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLLIElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLLIElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLLIElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLLIElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLLIElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLLIElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLLIElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLLIElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLLIElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  main: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  nav: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  ol: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLOListElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLOListElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLOListElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLOListElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLOListElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLOListElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLOListElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLOListElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLOListElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLOListElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLOListElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLOListElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLOListElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLOListElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLOListElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLOListElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLOListElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLOListElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLOListElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLOListElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLOListElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLOListElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLOListElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLOListElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLOListElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLOListElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLOListElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLOListElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLOListElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLOListElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLOListElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLOListElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  p: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLParagraphElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLParagraphElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLParagraphElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLParagraphElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLParagraphElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLParagraphElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLParagraphElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLParagraphElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLParagraphElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLParagraphElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLParagraphElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLParagraphElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLParagraphElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLParagraphElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLParagraphElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLParagraphElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLParagraphElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLParagraphElement>) =>
        mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLParagraphElement>) =>
        mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLParagraphElement>) =>
        mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLParagraphElement>) =>
        mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLParagraphElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLParagraphElement>) =>
        mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLParagraphElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLParagraphElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLParagraphElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLParagraphElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLParagraphElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLParagraphElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLParagraphElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLParagraphElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLParagraphElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  section: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  select: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLSelectElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLSelectElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLSelectElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLSelectElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLSelectElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLSelectElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLSelectElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLSelectElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLSelectElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLSelectElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLSelectElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLSelectElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLSelectElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLSelectElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLSelectElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLSelectElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLSelectElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLSelectElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLSelectElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLSelectElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLSelectElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLSelectElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLSelectElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLSelectElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLSelectElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLSelectElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLSelectElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLSelectElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLSelectElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLSelectElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLSelectElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLSelectElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  span: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLSpanElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLSpanElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLSpanElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLSpanElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLSpanElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLSpanElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLSpanElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLSpanElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLSpanElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLSpanElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLSpanElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLSpanElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLSpanElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLSpanElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLSpanElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLSpanElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLSpanElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLSpanElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLSpanElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLSpanElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLSpanElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLSpanElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLSpanElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLSpanElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLSpanElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLSpanElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLSpanElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLSpanElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLSpanElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLSpanElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLSpanElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLSpanElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  summary: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  table: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLTableElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLTableElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLTableElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLTableElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLTableElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLTableElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLTableElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLTableElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLTableElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLTableElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLTableElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLTableElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLTableElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLTableElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLTableElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLTableElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLTableElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLTableElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLTableElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLTableElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLTableElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLTableElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLTableElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLTableElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLTableElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLTableElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLTableElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLTableElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLTableElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLTableElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLTableElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLTableElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  td: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  textarea: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLTextAreaElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLTextAreaElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLTextAreaElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLTextAreaElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLTextAreaElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLTextAreaElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLTextAreaElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLTextAreaElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLTextAreaElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLTextAreaElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLTextAreaElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLTextAreaElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLTextAreaElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLTextAreaElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLTextAreaElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLTextAreaElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLTextAreaElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLTextAreaElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLTextAreaElement>) =>
        mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLTextAreaElement>) =>
        mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLTextAreaElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLTextAreaElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLTextAreaElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLTextAreaElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLTextAreaElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLTextAreaElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLTextAreaElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLTextAreaElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLTextAreaElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLTextAreaElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLTextAreaElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLTextAreaElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  th: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLElement>) => mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLElement>) => mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  tr: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLTableRowElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLTableRowElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLTableRowElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLTableRowElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLTableRowElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLTableRowElement>) =>
        mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLTableRowElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLTableRowElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLTableRowElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLTableRowElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLTableRowElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLTableRowElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLTableRowElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLTableRowElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLTableRowElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLTableRowElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLTableRowElement>) =>
        mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLTableRowElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLTableRowElement>) =>
        mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLTableRowElement>) =>
        mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLTableRowElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLTableRowElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLTableRowElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLTableRowElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLTableRowElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLTableRowElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLTableRowElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLTableRowElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLTableRowElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLTableRowElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLTableRowElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLTableRowElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  ul: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLUListElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLUListElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLUListElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLUListElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLUListElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLUListElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLUListElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLUListElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLUListElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLUListElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLUListElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLUListElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLUListElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLUListElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLUListElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLUListElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLUListElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLUListElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLUListElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLUListElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLUListElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLUListElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLUListElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLUListElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLUListElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLUListElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLUListElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLUListElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLUListElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLUListElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLUListElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLUListElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
  video: {
    animationcancel: {
      mapEvent: (event: AnimationEvent<HTMLVideoElement>) =>
        mapAnimationEvent("animationcancel", event),
      prop: "onAnimationCancel",
    },
    animationend: {
      mapEvent: (event: AnimationEvent<HTMLVideoElement>) =>
        mapAnimationEvent("animationend", event),
      prop: "onAnimationEnd",
    },
    animationiteration: {
      mapEvent: (event: AnimationEvent<HTMLVideoElement>) =>
        mapAnimationEvent("animationiteration", event),
      prop: "onAnimationIteration",
    },
    animationstart: {
      mapEvent: (event: AnimationEvent<HTMLVideoElement>) =>
        mapAnimationEvent("animationstart", event),
      prop: "onAnimationStart",
    },
    auxclick: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("auxclick", event),
      prop: "onAuxClick",
    },
    beforeinput: {
      mapEvent: (event: FormEvent<HTMLVideoElement>) => mapInputEvent("beforeinput", event),
      prop: "onBeforeInput",
    },
    beforetoggle: {
      mapEvent: (event: SyntheticEvent<HTMLVideoElement>) => mapToggleEvent("beforetoggle", event),
      prop: "onBeforeToggle",
    },
    blur: {
      mapEvent: (event: FocusEvent<HTMLVideoElement>) => mapFocusEvent("blur", event),
      prop: "onBlur",
    },
    change: {
      mapEvent: (event: SyntheticEvent<HTMLVideoElement>) => mapBaseEvent("change", event),
      prop: "onChange",
    },
    focus: {
      mapEvent: (event: FocusEvent<HTMLVideoElement>) => mapFocusEvent("focus", event),
      prop: "onFocus",
    },
    click: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("click", event),
      prop: "onClick",
    },
    contextmenu: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("contextmenu", event),
      prop: "onContextMenu",
    },
    copy: {
      mapEvent: (event: ClipboardEvent<HTMLVideoElement>) => mapBaseEvent("copy", event),
      prop: "onCopy",
    },
    cut: {
      mapEvent: (event: ClipboardEvent<HTMLVideoElement>) => mapBaseEvent("cut", event),
      prop: "onCut",
    },
    dblclick: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("dblclick", event),
      prop: "onDblClick",
    },
    drag: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("drag", event),
      prop: "onDrag",
    },
    dragend: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("dragend", event),
      prop: "onDragEnd",
    },
    dragenter: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("dragenter", event),
      prop: "onDragEnter",
    },
    dragleave: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("dragleave", event),
      prop: "onDragLeave",
    },
    dragover: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("dragover", event),
      prop: "onDragOver",
    },
    dragstart: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("dragstart", event),
      prop: "onDragStart",
    },
    drop: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("drop", event),
      prop: "onDrop",
    },
    input: {
      mapEvent: (event: FormEvent<HTMLVideoElement>) => mapInputEvent("input", event),
      prop: "onInput",
    },
    invalid: {
      mapEvent: (event: SyntheticEvent<HTMLVideoElement>) => mapBaseEvent("invalid", event),
      prop: "onInvalid",
    },
    keydown: {
      mapEvent: (event: KeyboardEvent<HTMLVideoElement>) => mapKeyboardEvent("keydown", event),
      prop: "onKeyDown",
    },
    keyup: {
      mapEvent: (event: KeyboardEvent<HTMLVideoElement>) => mapKeyboardEvent("keyup", event),
      prop: "onKeyUp",
    },
    mouseenter: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("mouseenter", event),
      prop: "onMouseEnter",
    },
    mouseleave: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("mouseleave", event),
      prop: "onMouseLeave",
    },
    mousedown: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("mousedown", event),
      prop: "onMouseDown",
    },
    mousemove: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("mousemove", event),
      prop: "onMouseMove",
    },
    mouseout: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("mouseout", event),
      prop: "onMouseOut",
    },
    mouseover: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("mouseover", event),
      prop: "onMouseOver",
    },
    mouseup: {
      mapEvent: (event: MouseEvent<HTMLVideoElement>) => mapMouseEvent("mouseup", event),
      prop: "onMouseUp",
    },
    pointercancel: {
      mapEvent: (event: PointerEvent<HTMLVideoElement>) => mapPointerEvent("pointercancel", event),
      prop: "onPointerCancel",
    },
    pointerdown: {
      mapEvent: (event: PointerEvent<HTMLVideoElement>) => mapPointerEvent("pointerdown", event),
      prop: "onPointerDown",
    },
    pointerenter: {
      mapEvent: (event: PointerEvent<HTMLVideoElement>) => mapPointerEvent("pointerenter", event),
      prop: "onPointerEnter",
    },
    pointerleave: {
      mapEvent: (event: PointerEvent<HTMLVideoElement>) => mapPointerEvent("pointerleave", event),
      prop: "onPointerLeave",
    },
    pointermove: {
      mapEvent: (event: PointerEvent<HTMLVideoElement>) => mapPointerEvent("pointermove", event),
      prop: "onPointerMove",
    },
    pointerout: {
      mapEvent: (event: PointerEvent<HTMLVideoElement>) => mapPointerEvent("pointerout", event),
      prop: "onPointerOut",
    },
    pointerover: {
      mapEvent: (event: PointerEvent<HTMLVideoElement>) => mapPointerEvent("pointerover", event),
      prop: "onPointerOver",
    },
    pointerup: {
      mapEvent: (event: PointerEvent<HTMLVideoElement>) => mapPointerEvent("pointerup", event),
      prop: "onPointerUp",
    },
    paste: {
      mapEvent: (event: ClipboardEvent<HTMLVideoElement>) => mapBaseEvent("paste", event),
      prop: "onPaste",
    },
    scroll: {
      mapEvent: (event: UIEvent<HTMLVideoElement>) => mapScrollEvent(event),
      prop: "onScroll",
    },
    select: {
      mapEvent: (event: SyntheticEvent<HTMLVideoElement>) => mapBaseEvent("select", event),
      prop: "onSelect",
    },
    reset: {
      mapEvent: (event: SyntheticEvent<HTMLVideoElement>) => mapBaseEvent("reset", event),
      prop: "onReset",
    },
    submit: {
      mapEvent: (event: SyntheticEvent<HTMLVideoElement>) => mapBaseEvent("submit", event),
      prop: "onSubmit",
    },
    toggle: {
      mapEvent: (event: SyntheticEvent<HTMLVideoElement>) => mapToggleEvent("toggle", event),
      prop: "onToggle",
    },
    transitionend: {
      mapEvent: (event: TransitionEvent<HTMLVideoElement>) =>
        mapTransitionEvent("transitionend", event),
      prop: "onTransitionEnd",
    },
    wheel: {
      mapEvent: (event: WheelEvent<HTMLVideoElement>) => mapWheelEvent("wheel", event),
      prop: "onWheel",
    },
  },
} as const);
