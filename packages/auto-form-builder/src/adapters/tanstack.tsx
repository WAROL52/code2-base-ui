"use client";

import { useForm } from "@tanstack/react-form";
import { createContext, useContext } from "react";
import type {
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "./types";

interface TanStackFieldValue {
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
		children: (field: TanStackFieldValue) => React.ReactNode;
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

		const ctxValue: TanStackFormValue = {
			Field: form.Field as React.ComponentType<{
				name: string;
				children: (field: TanStackFieldValue) => React.ReactNode;
			}>,
			state: form.state as {
				values: Record<string, unknown>;
				isSubmitting: boolean;
			},
			handleSubmit: form.handleSubmit as () => void,
			reset: form.reset as () => void,
			pushFieldValue: form.pushFieldValue as (...args: unknown[]) => void,
			removeFieldValue: form.removeFieldValue as (...args: unknown[]) => void,
		};

		const formAPI: FormAPI = {
			get values() {
				return ctxValue.state.values;
			},
			get isSubmitting() {
				return ctxValue.state.isSubmitting;
			},
			handleSubmit: () => ctxValue.handleSubmit(),
			reset: () => ctxValue.reset(),
			appendFieldValue: (name, value) => ctxValue.pushFieldValue(name, value),
			removeFieldValue: (name, index) => ctxValue.removeFieldValue(name, index),
		};

		return (
			<TanStackCtx.Provider value={ctxValue}>
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
