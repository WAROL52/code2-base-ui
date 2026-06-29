"use client";

import { createContext, useContext } from "react";
import { useForm } from "@tanstack/react-form";
import type { FormProviderProps, FieldProps, FormAdapter, FormAPI } from "./types";

const TanStackCtx = createContext<any>(null);

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
		};

		return (
			<TanStackCtx.Provider value={form}>
				{children(formAPI)}
			</TanStackCtx.Provider>
		);
	},

	Field({ name, children }: FieldProps) {
		const form = useContext(TanStackCtx);
		if (!form) throw new Error("tanstackAdapter: missing FormProvider");

		return (
			<form.Field name={name}>
				{(field: any) =>
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
