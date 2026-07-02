import { createContext, useContext, useState } from "react";
import type {
	FieldAPI,
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "../src/adapters/types";

interface MockCtxValue {
	getFieldValue: (name: string) => unknown;
	setFieldValue: (name: string, value: unknown) => void;
}

const MockCtx = createContext<MockCtxValue | null>(null);

export const mockAdapter: FormAdapter = {
	name: "mock",

	FormProvider({ defaultValues = {}, onSubmit, children }: FormProviderProps) {
		const [values, setValues] =
			useState<Record<string, unknown>>(defaultValues);

		const ctx: MockCtxValue = {
			getFieldValue: (name) => values[name],
			setFieldValue: (name, value) => {
				setValues((prev) => ({ ...prev, [name]: value }));
			},
		};

		const formAPI: FormAPI = {
			get values() {
				return values;
			},
			isSubmitting: false,
			handleSubmit: () => onSubmit?.(values),
			reset: () => setValues(defaultValues),
			appendFieldValue: (name, value) => {
				setValues((prev) => {
					const arr = (prev[name] as unknown[]) ?? [];
					return { ...prev, [name]: [...arr, value] };
				});
			},
			removeFieldValue: (name, index) => {
				setValues((prev) => {
					const arr = (prev[name] as unknown[]) ?? [];
					return {
						...prev,
						[name]: arr.filter((_, i) => i !== index),
					};
				});
			},
		};

		return <MockCtx.Provider value={ctx}>{children(formAPI)}</MockCtx.Provider>;
	},

	Field({ name, children }: FieldProps) {
		const ctx = useContext(MockCtx);
		if (!ctx) {
			throw new Error("mockAdapter: missing FormProvider");
		}

		return children({
			value: ctx.getFieldValue(name) as FieldAPI["value"],
			onChange: (val: unknown) => ctx.setFieldValue(name, val),
			onBlur: () => {},
			error: undefined as FieldAPI["error"],
			isTouched: false,
		});
	},
};
