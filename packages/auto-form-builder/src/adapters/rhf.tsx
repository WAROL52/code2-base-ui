"use client";

import { createContext, useContext, useMemo } from "react";
import {
	Controller,
	type Resolver,
	type UseFormReturn,
	useForm,
} from "react-hook-form";
import type {
	FieldError,
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "./types";

function toResolver(
	validate?: (
		values: Record<string, unknown>
	) => Record<string, FieldError | undefined>
): Resolver<Record<string, unknown>> | undefined {
	if (!validate) {
		return;
	}
	return (values) => {
		const errors = validate(values as Record<string, unknown>);
		const rhfErrors: Record<string, { type: string; message?: string }> = {};
		for (const [key, err] of Object.entries(errors)) {
			if (err) {
				rhfErrors[key] = {
					type: "validation",
					message: typeof err === "string" ? err : err.message,
				};
			}
		}
		return {
			values: values as Record<string, never>,
			errors: rhfErrors,
		} as never;
	};
}

const RHFContext = createContext<UseFormReturn | null>(null);

export const rhfAdapter: FormAdapter = {
	name: "rhf",

	FormProvider({
		defaultValues,
		onSubmit,
		children,
		validate,
	}: FormProviderProps) {
		const resolver = useMemo(() => toResolver(validate), [validate]);
		const form = useForm({
			defaultValues: defaultValues ?? {},
			resolver: resolver as Resolver<Record<string, unknown>> | undefined,
		});

		const formAPI: FormAPI = {
			get values() {
				return form.getValues() as Record<string, unknown>;
			},
			get isSubmitting() {
				return form.formState.isSubmitting;
			},
			handleSubmit: () => {
				form.handleSubmit((data) => onSubmit?.(data))();
			},
			reset: () => form.reset(),
			appendFieldValue: (name: string, value: unknown) => {
				const current = (form.getValues(name) as unknown[]) ?? [];
				form.setValue(name, [...current, value]);
			},
			removeFieldValue: (name: string, index: number) => {
				const current = (form.getValues(name) as unknown[]) ?? [];
				form.setValue(
					name,
					current.filter((_, i) => i !== index)
				);
			},
		};

		return (
			<RHFContext.Provider value={form}>
				{children(formAPI)}
			</RHFContext.Provider>
		);
	},

	Field({ name, children }: FieldProps) {
		const ctrl = useContext(RHFContext);
		if (!ctrl) {
			throw new Error("rhfAdapter: missing FormProvider");
		}

		return (
			<Controller
				control={ctrl.control}
				name={name}
				render={({ field, fieldState }) =>
					children({
						value: field.value,
						onChange: (val: unknown) => field.onChange(val),
						onBlur: () => field.onBlur(),
						error: fieldState.error?.message,
						isTouched: fieldState.isTouched,
					}) as React.ReactElement
				}
			/>
		);
	},
};
