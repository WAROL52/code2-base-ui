import type { FormStateAdapter, FormAPI, FieldController } from "@code2-base-ui/auto-form";
import type { ValidationResult } from "@code2-base-ui/json-schema-toolkit";

function createFormAPI(config: {
  defaultValues?: Record<string, unknown>;
  validate: (data: unknown) => ValidationResult;
}): FormAPI {
  let values = config.defaultValues ?? {};
  const defaults = config.defaultValues ?? {};
  let errors: Record<string, string | undefined> = {};
  let dirty = false;
  let isSubmitting = false;

  return {
    get values() { return values; },
    get errors() { return errors; },
    get dirty() { return dirty; },
    get isSubmitting() { return isSubmitting; },
    submit: (e: { preventDefault: () => void }) => {
      e.preventDefault();
      isSubmitting = true;
      const result = config.validate(values);
      if (!result.success) {
        errors = Object.fromEntries(
          result.errors.map((err) => [err.path, err.message]),
        );
      } else {
        errors = {};
      }
      isSubmitting = false;
    },
    reset: () => {
      values = { ...defaults };
      errors = {};
      dirty = false;
    },
  };
}

export const tanstackFormAdapter: FormStateAdapter = {
  name: "tanstack-form",
  useForm: (config) => createFormAPI(config),
  useField: (_name: string): FieldController => ({
    value: undefined,
    onChange: (_value: unknown) => {},
    onBlur: () => {},
    touched: false,
  }),
};
