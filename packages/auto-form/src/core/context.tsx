import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { FieldController, FormAPI, SchemaProvider } from "./types";

interface FormContextValue {
	fields: Record<string, FieldController>;
	form: FormAPI;
}

interface AutoFormContextValue {
	fields: Record<string, FieldController>;
	form: FormAPI;
	registry: FieldRegistry;
	schema: SchemaProvider;
}

const FormContext = createContext<FormContextValue | null>(null);
const FieldContext = createContext<FieldController | null>(null);
const AutoFormContext = createContext<AutoFormContextValue | null>(null);

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

export function AutoFormContextProvider({
	children,
	form,
	schema,
	registry,
	fields = {},
}: {
	children: ReactNode;
	form: FormAPI;
	schema: SchemaProvider;
	registry: FieldRegistry;
	fields?: Record<string, FieldController>;
}) {
	return (
		<AutoFormContext.Provider value={{ form, schema, registry, fields }}>
			{children}
		</AutoFormContext.Provider>
	);
}

export function useFormContext(): FormAPI | null {
	const ctx = useContext(FormContext);
	return ctx?.form ?? null;
}

export function useAutoFormContext(): AutoFormContextValue | null {
	return useContext(AutoFormContext);
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
		<FieldContext.Provider value={field}>{children}</FieldContext.Provider>
	);
}

export type { AutoFormContextValue, FormContextValue };
export { AutoFormContext, FieldContext, FormContext };
