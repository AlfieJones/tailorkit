"use client";

import type { InputProps } from "../components/input";
import type { HTMLInputTypeAttribute, ReactNode } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "../components/field";
import { formatFieldErrors } from "./field-errors";
import { Input } from "../components/input";

export interface TextFieldProps {
  autoComplete?: InputProps["autoComplete"];
  autoFocus?: boolean;
  description?: string;
  disabled?: boolean;
  errors?: unknown[];
  label: string;
  labelAction?: ReactNode;
  onBlur?: InputProps["onBlur"];
  onChange?: InputProps["onChange"];
  placeholder?: string;
  required?: boolean;
  showDescriptionWhenError?: boolean;
  type?: HTMLInputTypeAttribute;
  value?: string;
}

export function TextField({
  autoComplete,
  autoFocus,
  description,
  disabled,
  errors = [],
  label,
  labelAction,
  onBlur,
  onChange,
  placeholder,
  required,
  showDescriptionWhenError = false,
  type,
  value,
}: TextFieldProps) {
  const isError = errors.length > 0;

  return (
    <Field disabled={disabled} invalid={isError}>
      <div className="flex w-full items-center gap-2">
        <FieldLabel>
          {label} {required && <span className="text-destructive-foreground">*</span>}
        </FieldLabel>
        {labelAction && <div className="ml-auto">{labelAction}</div>}
      </div>
      <Input
        aria-invalid={isError || undefined}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value ?? ""}
      />
      {description && (!isError || showDescriptionWhenError) && (
        <FieldDescription>{description}</FieldDescription>
      )}
      {isError && <FieldError>{formatFieldErrors(errors)}</FieldError>}
    </Field>
  );
}
