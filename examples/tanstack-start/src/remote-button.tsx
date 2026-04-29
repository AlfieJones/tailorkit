import { useState } from "react";

interface RemoteButtonProps {
  callbacks?: {
    validate?: (input: { value: string }) => Promise<boolean>;
  };
  children?: React.ReactNode;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function RemoteButton({ callbacks, children, label, onClick }: RemoteButtonProps) {
  const [validation, setValidation] = useState("Client validation not run");

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
    const valid = await callbacks?.validate?.({ value: label });
    setValidation(valid === undefined ? "No validate callback" : `Client received: ${valid}`);
    onClick?.(event);
  };

  return (
    <div className="host-card">
      <div>
        <p className="eyebrow">Host React component</p>
        <h2>{label}</h2>
      </div>
      <button type="button" onClick={handleClick}>
        {children ?? "Click"}
      </button>
      <p className="validation">{validation}</p>
    </div>
  );
}
