import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  AutoFormProvider,
  useFormContext,
  useFieldContext,
  FieldProvider,
} from "../../src/core/context";
import type { FormAPI, FieldController } from "../../src/core/types";
import { type ReactNode } from "react";

describe("AutoFormContext", () => {
  it("useFormContext returns null outside provider", () => {
    const { result } = renderHook(() => useFormContext());
    expect(result.current).toBeNull();
  });

  it("useFormContext returns form API inside provider", () => {
    const mockForm: FormAPI = {
      values: {},
      errors: {},
      submit: vi.fn(),
      reset: vi.fn(),
      dirty: false,
      isSubmitting: false,
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AutoFormProvider form={mockForm}>{children}</AutoFormProvider>
      ),
    });

    expect(result.current).toBe(mockForm);
  });

  it("useFieldContext returns null outside provider", () => {
    const { result } = renderHook(() => useFieldContext());
    expect(result.current).toBeNull();
  });

  it("useFieldContext returns field controller inside FieldProvider", () => {
    const mockField: FieldController = {
      value: "test",
      onChange: vi.fn(),
      onBlur: vi.fn(),
      touched: false,
    };

    const { result } = renderHook(() => useFieldContext(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <FieldProvider field={mockField}>{children}</FieldProvider>
      ),
    });

    expect(result.current).toBe(mockField);
  });
});
