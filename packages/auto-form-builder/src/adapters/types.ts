import type React from "react";

export interface FieldAPI {
	error?: string;
	isTouched: boolean;
	onBlur: () => void;
	onChange: (value: unknown) => void;
	value: unknown;
}

export interface FormAPI {
	appendFieldValue: (name: string, value: unknown) => void;
	errors: Record<string, string | undefined>;
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
