"use client";

import type { FieldConstraints } from "@code2-base-ui/json-schema-toolkit";
import { getConstraints } from "@code2-base-ui/json-schema-toolkit";
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
	pipe,
	any as vAny,
	array as vArray,
	boolean as vBoolean,
	email as vEmail,
	integer as vInteger,
	maxLength as vMaxLength,
	maxValue as vMaxValue,
	minLength as vMinLength,
	minValue as vMinValue,
	multipleOf as vMultipleOf,
	nonEmpty as vNonEmpty,
	null as vNull,
	number as vNumber,
	object as vObject,
	picklist as vPicklist,
	regex as vRegex,
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

function isRequired(schema: Record<string, unknown>, field: string): boolean {
	const req = schema.required;
	return Array.isArray(req) && req.includes(field);
}

function buildStringSchema(
	constraints: FieldConstraints | undefined,
	fieldRequired: boolean
): GenericSchema {
	const pipes: never[] = [];
	if (fieldRequired) {
		pipes.push(vNonEmpty("Required") as never);
	}
	if (constraints?.minLength !== undefined) {
		pipes.push(vMinLength(constraints.minLength) as never);
	}
	if (constraints?.maxLength !== undefined) {
		pipes.push(vMaxLength(constraints.maxLength) as never);
	}
	if (constraints?.format === "email") {
		pipes.push(vEmail() as never);
	}
	if (constraints?.pattern !== undefined) {
		pipes.push(vRegex(new RegExp(constraints.pattern)) as never);
	}
	return pipes.length > 0
		? (pipe(vString(), ...pipes) as never as GenericSchema)
		: (vString() as GenericSchema);
}

function buildNumberSchema(
	constraints: FieldConstraints | undefined,
	asInteger: boolean
): GenericSchema {
	const pipes: never[] = [];
	if (asInteger) {
		pipes.push(vInteger() as never);
	}
	if (constraints?.minimum !== undefined) {
		pipes.push(vMinValue(constraints.minimum) as never);
	}
	if (constraints?.maximum !== undefined) {
		pipes.push(vMaxValue(constraints.maximum) as never);
	}
	if (constraints?.multipleOf !== undefined) {
		pipes.push(vMultipleOf(constraints.multipleOf) as never);
	}
	return pipes.length > 0
		? (pipe(vNumber(), ...pipes) as never as GenericSchema)
		: (vNumber() as GenericSchema);
}

function buildArraySchema(
	constraints: FieldConstraints | undefined,
	fieldSchema: Record<string, unknown>
): GenericSchema {
	const items = (fieldSchema.items as Record<string, unknown>) ?? {};
	const itemSchema = buildFieldValibotSchema(items, false);
	const pipes: never[] = [];
	if (constraints?.minItems !== undefined) {
		pipes.push(vMinLength(constraints.minItems) as never);
	}
	if (constraints?.maxItems !== undefined) {
		pipes.push(vMaxLength(constraints.maxItems) as never);
	}
	const base = vArray(itemSchema);
	return pipes.length > 0
		? (pipe(base, ...pipes) as never as GenericSchema)
		: (base as GenericSchema);
}

function buildObjectSchema(
	fieldSchema: Record<string, unknown>
): GenericSchema {
	const subProps = (fieldSchema.properties as Record<string, unknown>) ?? {};
	const entries: Record<string, GenericSchema> = {};
	for (const subKey of Object.keys(subProps)) {
		entries[subKey] = buildFieldValibotSchema(
			subProps[subKey] as Record<string, unknown>,
			isRequired(fieldSchema, subKey)
		);
	}
	return vObject(entries) as unknown as GenericSchema;
}

function buildFieldValibotSchema(
	fieldSchema: Record<string, unknown>,
	fieldRequired: boolean
): GenericSchema {
	const constraints = getConstraints(fieldSchema);

	if (fieldSchema.enum !== undefined) {
		const options = fieldSchema.enum as [string, ...string[]];
		return vPicklist(options) as never as GenericSchema;
	}

	const type = constraints?.type ?? "string";

	switch (type) {
		case "string":
			return buildStringSchema(constraints, fieldRequired);
		case "number":
		case "integer":
			return buildNumberSchema(constraints, type === "integer");
		case "boolean":
			return vBoolean() as GenericSchema;
		case "array":
			return buildArraySchema(constraints, fieldSchema);
		case "object":
			return buildObjectSchema(fieldSchema);
		default:
			return vAny() as GenericSchema;
	}
}

function buildValibotSchema(
	jsonSchema: Record<string, unknown>
): GenericSchema {
	const props = (jsonSchema.properties as Record<string, unknown>) ?? {};
	const entries: Record<string, GenericSchema> = {};
	for (const key of Object.keys(props)) {
		entries[key] = buildFieldValibotSchema(
			props[key] as Record<string, unknown>,
			isRequired(jsonSchema, key)
		);
	}
	return vObject(entries) as unknown as GenericSchema;
}

export const formischAdapter: FormAdapter = {
	name: "formisch",

	FormProvider({
		defaultValues = {},
		onSubmit,
		children,
		schema: jsonSchema,
	}: FormProviderProps) {
		const schema = useMemo(
			() =>
				jsonSchema
					? buildValibotSchema(jsonSchema)
					: inferSchema(defaultValues),
			[jsonSchema, defaultValues]
		);
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
