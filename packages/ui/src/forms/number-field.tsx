"use client";

import type { NumberFieldProps as PrimitiveNumberFieldProps } from "../components/number-field";
import type { ReactNode } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "../components/field";
import { formatFieldErrors } from "./field-errors";
import {
  NumberField as PrimitiveNumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "../components/number-field";

export interface NumberFieldProps {
  description?: string;
  disabled?: boolean;
  errors?: unknown[];
  label: string;
  labelAction?: ReactNode;
  onBlur?: React.ComponentProps<"input">["onBlur"];
  onChange?: NonNullable<PrimitiveNumberFieldProps["onValueChange"]>;
  placeholder?: string;
  required?: boolean;
  value?: number | null;
}

export function NumberField({
  description,
  disabled,
  errors = [],
  label,
  labelAction,
  onBlur,
  onChange,
  placeholder,
  required,
  value,
}: NumberFieldProps) {
  const isError = errors.length > 0;

  return (
    <Field disabled={disabled}>
      <div className="flex w-full items-center gap-2">
        <FieldLabel>
          {label} {required && <span className="text-destructive-foreground">*</span>}
        </FieldLabel>
        {labelAction && <div className="ml-auto">{labelAction}</div>}
      </div>
      <PrimitiveNumberField
        disabled={disabled}
        onValueChange={(nextValue, eventDetails) => {
          onChange?.(nextValue, eventDetails);
        }}
        required={required}
        value={value ?? null}
      >
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput onBlur={onBlur} placeholder={placeholder} />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </PrimitiveNumberField>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isError && <FieldError>{formatFieldErrors(errors)}</FieldError>}
    </Field>
  );
}
