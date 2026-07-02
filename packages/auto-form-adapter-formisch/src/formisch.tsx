"use client";

import {
	Field as FormischField,
	Form,
	getInput,
	insert,
	remove as formischRemove,
	reset as formischReset,
	submit as formischSubmit,
	useForm,
} from "@formisch/react";
import * as v from "valibot";
import { createContext, useContext, useMemo } from "react";
import type {
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "@code2-base-ui/auto-form-builder";

interface FormischStore {
	// Store opaque — on caste useForm() en unknown
}

const FormischCtx = createContext<FormischStore | null>(null);

function toPath(name: string): string[] {
	return name.replace(/\[(\d+)\]/g, (_m, n) => `.${n}`).split(".");
}

function inferSchema(value: unknown) {
	if (value === null) {
		return v.null();
	}
	if (typeof value === "string") {
		return v.string();
	}
	if (typeof value === "number") {
		return v.number();
	}
	if (typeof value === "boolean") {
		return v.boolean();
	}
	if (Array.isArray(value)) {
		const itemSchema =
			value.length > 0 ? inferSchema(value[0]) : v.any();
		return v.array(itemSchema);
	}
	if (typeof value === "object") {
		const entries: Record<string, v.GenericSchema> = {};
		for (const key of Object.keys(value as Record<string, unknown>)) {
			entries[key] = inferSchema(
				(value as Record<string, unknown>)[key]
			);
		}
		return v.object(entries);
	}
	return v.any();
}

export const formischAdapter: FormAdapter = {
	name: "formisch",

	FormProvider({ defaultValues = {}, onSubmit, children }: FormProviderProps) {
		const schema = useMemo(() => inferSchema(defaultValues), [defaultValues]);

		const form = useForm({
			schema: schema as never,
			initialInput: defaultValues as never,
		});

		const formAPI: FormAPI = {
			get values() {
				return getInput(form) as Record<string, unknown>;
			},
			isSubmitting: false,
			handleSubmit: () => {
				formischSubmit(form);
			},
			reset: () => formischReset(form),
			appendFieldValue: (name: string, value: unknown) => {
				insert(form, {
					path: toPath(name),
					initialInput: value as never,
				} as never);
			},
			removeFieldValue: (name: string, index: number) => {
				formischRemove(form, {
					path: toPath(name),
					at: index,
				} as never);
			},
		};

		return (
			<FormischCtx.Provider value={form as unknown as FormischStore}>
				<Form of={form} onSubmit={(output: unknown) => onSubmit?.(output)}>
					{children(formAPI)}
				</Form>
			</FormischCtx.Provider>
		);
	},

	Field({ name, children }: FieldProps) {
		const form = useContext(FormischCtx);
		if (!form) {
			throw new Error("formischAdapter: missing FormProvider");
		}

		return (
			<FormischField of={form as never} path={toPath(name)}>
				{(field) =>
					children({
						value: field.input,
						onChange: (val: unknown) => field.onChange(val),
						onBlur: () => field.props.onBlur(),
						error: field.errors?.[0] ?? undefined,
						isTouched: false,
					})
				}
			</FormischField>
		);
	},
};
