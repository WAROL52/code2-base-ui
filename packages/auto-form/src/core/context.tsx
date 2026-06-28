import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { FormAPI, FieldController } from "./types";

interface FormContextValue {
  form: FormAPI;
  fields: Record<string, FieldController>;
}

const FormContext = createContext<FormContextValue | null>(null);
const FieldContext = createContext<FieldController | null>(null);

export function AutoFormProvider({
  children,
  form,
  fields = {},
}: {
  children: ReactNode;
  form: FormAPI;
  fields?: Record<string, FieldController>;
}) {
  return (
    <FormContext.Provider value={{ form, fields }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext(): FormAPI | null {
  const ctx = useContext(FormContext);
  return ctx?.form ?? null;
}

export function useFieldContext(): FieldController | null {
  return useContext(FieldContext);
}

export function FieldProvider({
  children,
  field,
}: {
  children: ReactNode;
  field: FieldController;
}) {
  return (
    <FieldContext.Provider value={field}>
      {children}
    </FieldContext.Provider>
  );
}

export { FormContext, FieldContext };
export type { FormContextValue };
