import type React from "react";

export type FieldError =
	| string
	| { message: string; type?: string; path?: string[] };

export function toErrorString(error?: FieldError): string | undefined {
	if (!error) {
		return;
	}
	if (typeof error === "string") {
		return error;
	}
	return error.message;
}

export interface FieldAPI {
	error?: FieldError;
	isTouched: boolean;
	onBlur: () => void;
	onChange: (value: unknown) => void;
	value: unknown;
}

export interface FormAPI {
	appendFieldValue: (name: string, value: unknown) => void;
	handleSubmit: () => void;
	isSubmitting: boolean;
	removeFieldValue: (name: string, index: number) => void;
	reset: () => void;
	values: Record<string, unknown>;
}

export interface FormProviderProps {
	children: (form: FormAPI) => React.ReactNode;
	defaultValues?: Record<string, unknown>;
	onSubmit?: (data: unknown) => void | Promise<void>;
}

export interface FieldProps {
	children: (field: FieldAPI) => React.ReactNode;
	name: string;
}

export interface FormAdapter {
	readonly Field: React.ComponentType<FieldProps>;
	readonly FormProvider: React.ComponentType<FormProviderProps>;
	readonly name: string;
}
