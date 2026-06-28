"use client";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@code2-base-ui/ui/components/input-otp";
import { Field, FieldLabel, FieldError } from "@code2-base-ui/ui/components/field";

export function OtpField(props: Record<string, unknown>) {
  const { name, label, maxLength } = props as {
    name: string;
    label?: string;
    maxLength?: number;
  };
  return (
    <Field>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <InputOTP id={name} name={name} maxLength={maxLength ?? 6}>
        <InputOTPGroup>
          {Array.from({ length: maxLength ?? 6 }, (_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <FieldError errors={[]} />
    </Field>
  );
}
