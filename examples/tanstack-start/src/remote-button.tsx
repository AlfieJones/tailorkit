import { useId, useState } from "react";

interface NativeClickPayload {
  button: number;
  ctrlKey: boolean;
  currentTargetId: string;
  metaKey: boolean;
  name: "click";
  shiftKey: boolean;
  targetId: string;
}

interface NativeFocusPayload {
  currentTargetId: string;
  name: "blur" | "focus";
  targetId: string;
}

interface NativeKeyPayload {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  currentTargetId: string;
  key: string;
  metaKey: boolean;
  name: "keydown" | "keyup";
  shiftKey: boolean;
  targetId: string;
}

interface RemoteButtonCallbacks {
  onBlur?: (input: NativeFocusPayload) => Promise<void>;
  onClick?: (input: NativeClickPayload) => Promise<void>;
  onFocus?: (input: NativeFocusPayload) => Promise<void>;
  onKeyDown?: (input: NativeKeyPayload) => Promise<void>;
  onKeyUp?: (input: NativeKeyPayload) => Promise<void>;
  validate?: (input: { value: string }) => Promise<boolean>;
}

interface RemoteButtonProps {
  callbacks?: RemoteButtonCallbacks;
  children?: React.ReactNode;
  // Native button props from generated schema
  disabled?: boolean;
  name?: string;
  type?: "button" | "reset" | "submit";
  value?: string;
}

export function RemoteButton({
  callbacks,
  children,
  disabled,
  name,
  type = "button",
  value,
}: RemoteButtonProps) {
  const id = useId();
  const [validation, setValidation] = useState("Client validation not run");

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const valid = await callbacks?.validate?.({ value: e.currentTarget.textContent ?? "" });
    setValidation(valid === undefined ? "No validate callback" : `Client received: ${valid}`);

    await callbacks?.onClick?.({
      button: e.button,
      ctrlKey: e.ctrlKey,
      currentTargetId: id,
      metaKey: e.metaKey,
      name: "click",
      shiftKey: e.shiftKey,
      targetId: id,
    });
  };

  const handleFocus = async () => {
    await callbacks?.onFocus?.({ currentTargetId: id, name: "focus", targetId: id });
  };

  const handleBlur = async () => {
    await callbacks?.onBlur?.({ currentTargetId: id, name: "blur", targetId: id });
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLButtonElement>) => {
    await callbacks?.onKeyDown?.({
      altKey: e.altKey,
      code: e.code,
      ctrlKey: e.ctrlKey,
      currentTargetId: id,
      key: e.key,
      metaKey: e.metaKey,
      name: "keydown",
      shiftKey: e.shiftKey,
      targetId: id,
    });
  };

  const handleKeyUp = async (e: React.KeyboardEvent<HTMLButtonElement>) => {
    await callbacks?.onKeyUp?.({
      altKey: e.altKey,
      code: e.code,
      ctrlKey: e.ctrlKey,
      currentTargetId: id,
      key: e.key,
      metaKey: e.metaKey,
      name: "keyup",
      shiftKey: e.shiftKey,
      targetId: id,
    });
  };

  return (
    <div className="host-card">
      <div>
        <p className="eyebrow">Host React component</p>
      </div>
      <button
        disabled={disabled}
        id={id}
        name={name}
        type={type}
        value={value}
        onBlur={handleBlur}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        {children ?? "Click"}
      </button>
      <p className="validation">{validation}</p>
    </div>
  );
}
