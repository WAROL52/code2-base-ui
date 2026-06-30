"use client";

import { useForm } from "@tanstack/react-form";
import { createContext, useContext } from "react";
import type {
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "./types";

interface TanStackField {
	handleBlur: () => void;
	handleChange: (val: unknown) => void;
	state: {
		value: unknown;
		meta: {
			errors?: string[];
			isTouched: boolean;
		};
	};
}

interface TanStackFormValue {
	Field: React.ComponentType<{
		name: string;
		children: (field: TanStackField) => React.ReactNode;
	}>;
	handleSubmit: () => void;
	pushFieldValue: (name: string, value: unknown) => void;
	removeFieldValue: (name: string, index: number) => void;
	reset: () => void;
	state: {
		values: Record<string, unknown>;
		isSubmitting: boolean;
	};
}

const TanStackCtx = createContext<TanStackFormValue | null>(null);

export const tanstackAdapter: FormAdapter = {
	name: "tanstack",

	FormProvider({ defaultValues, onSubmit, children }: FormProviderProps) {
		const form = useForm({
			defaultValues: defaultValues ?? {},
			validators: undefined,
			onSubmit: ({ value }) => onSubmit?.(value),
		});

		const formAPI: FormAPI = {
			get values() {
				return form.state.values as Record<string, unknown>;
			},
			errors: {},
			isSubmitting: form.state.isSubmitting,
			handleSubmit: () => form.handleSubmit(),
			reset: () => form.reset(),
			appendFieldValue: (name, value) =>
				(form as unknown as TanStackFormValue).pushFieldValue(name, value),
			removeFieldValue: (name, index) =>
				(form as unknown as TanStackFormValue).removeFieldValue(name, index),
		};

		return (
			<TanStackCtx.Provider value={form as unknown as TanStackFormValue}>
				{children(formAPI)}
			</TanStackCtx.Provider>
		);
	},

	Field({ name, children }: FieldProps) {
		const form = useContext(TanStackCtx);
		if (!form) {
			throw new Error("tanstackAdapter: missing FormProvider");
		}

		return (
			<form.Field name={name}>
				{(field) =>
					children({
						value: field.state.value,
						onChange: (val: unknown) => field.handleChange(val),
						onBlur: () => field.handleBlur(),
						error: field.state.meta.errors?.[0] as string | undefined,
						isTouched: field.state.meta.isTouched,
					})
				}
			</form.Field>
		);
	},
};
