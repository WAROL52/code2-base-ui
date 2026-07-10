"use client";

import {
	Form,
	Field as FormischField,
	type FormStore,
	remove as formischRemove,
	reset as formischReset,
	submit as formischSubmit,
	getInput,
	insert,
	useForm,
} from "@formisch/react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import {
	type GenericSchema,
	any as vAny,
	array as vArray,
	boolean as vBoolean,
	null as vNull,
	number as vNumber,
	object as vObject,
	string as vString,
} from "valibot";
import type {
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "./types";

interface FormischCtxValue {
	form: FormStore;
	setTouched: (name: string) => void;
	touched: Record<string, boolean>;
}

const FormischCtx = createContext<FormischCtxValue | null>(null);

function toPath(name: string): string[] {
	return name.replace(/\[(\d+)\]/g, (_m, n) => `.${n}`).split(".");
}

function inferSchema(value: unknown): GenericSchema {
	if (value === null) {
		return vNull();
	}
	if (typeof value === "string") {
		return vString();
	}
	if (typeof value === "number") {
		return vNumber();
	}
	if (typeof value === "boolean") {
		return vBoolean();
	}
	if (Array.isArray(value)) {
		const itemSchema: GenericSchema =
			value.length > 0 ? inferSchema(value[0]) : vAny();
		return vArray(itemSchema);
	}
	if (typeof value === "object") {
		const entries: Record<string, GenericSchema> = {};
		for (const key of Object.keys(value as Record<string, unknown>)) {
			entries[key] = inferSchema((value as Record<string, unknown>)[key]);
		}
		return vObject(entries);
	}
	return vAny();
}

export const formischAdapter: FormAdapter = {
	name: "formisch",

	FormProvider({ defaultValues = {}, onSubmit, children }: FormProviderProps) {
		const schema = useMemo(() => inferSchema(defaultValues), [defaultValues]);
		const [isSubmitting, setIsSubmitting] = useState(false);
		const [touched, setTouchedState] = useState<Record<string, boolean>>({});

		const form = useForm({
			schema: schema as never,
			initialInput: defaultValues as never,
		});

		const setTouched = useCallback((name: string) => {
			setTouchedState((prev) => ({ ...prev, [name]: true }));
		}, []);

		const formAPI: FormAPI = {
			get values() {
				return getInput(form) as Record<string, unknown>;
			},
			isSubmitting,
			handleSubmit: () => {
				setIsSubmitting(true);
				Promise.resolve(formischSubmit(form)).finally(() => {
					setIsSubmitting(false);
				});
			},
			reset: () => {
				formischReset(form);
				setTouchedState({});
			},
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
			<FormischCtx.Provider value={{ form, touched, setTouched }}>
				<Form of={form} onSubmit={(output: unknown) => onSubmit?.(output)}>
					{children(formAPI)}
				</Form>
			</FormischCtx.Provider>
		);
	},

	Field({ name, children }: FieldProps) {
		const ctx = useContext(FormischCtx);
		if (!ctx) {
			throw new Error("formischAdapter: missing FormProvider");
		}

		return (
			<FormischField of={ctx.form} path={toPath(name) as never}>
				{(field) =>
					children({
						value: field.input,
						onChange: (val: unknown) =>
							(field.onChange as (v: unknown) => void)(val),
						onBlur: () => {
							(field.props.onBlur as (() => void) | undefined)?.();
							ctx.setTouched(name);
						},
						error: field.errors?.[0] ?? undefined,
						isTouched: ctx.touched[name] ?? false,
					}) as React.ReactElement
				}
			</FormischField>
		);
	},
};
