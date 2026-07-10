"use client";

import { createContext, useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import type {
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "./types";

interface RHFContextValue {
	control: object;
	formState: { isSubmitting: boolean };
	getValues: (name?: string) => unknown;
	handleSubmit: (
		onValid: (data: unknown) => void
	) => (e?: React.BaseSyntheticEvent) => void;
	reset: (values?: Record<string, unknown>) => void;
	setValue: (name: string, value: unknown) => void;
}

const RHFContext = createContext<RHFContextValue | null>(null);

export const rhfAdapter: FormAdapter = {
	name: "rhf",

	FormProvider({ defaultValues, onSubmit, children }: FormProviderProps) {
		const form = useForm({
			defaultValues: defaultValues ?? {},
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
			<RHFContext.Provider value={form as unknown as RHFContextValue}>
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
				control={ctrl.control as never}
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
