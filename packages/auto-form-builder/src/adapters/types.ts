import type React from "react";

export interface FieldAPI {
	value: unknown;
	onChange: (value: unknown) => void;
	onBlur: () => void;
	error?: string;
	isTouched: boolean;
}

export interface FormAPI {
	values: Record<string, unknown>;
	errors: Record<string, string | undefined>;
	isSubmitting: boolean;
	handleSubmit: () => void;
	reset: () => void;
}

export interface FormProviderProps {
	defaultValues?: Record<string, unknown>;
	onSubmit?: (data: unknown) => void | Promise<void>;
	children: (form: FormAPI) => React.ReactNode;
}

export interface FieldProps {
	name: string;
	children: (field: FieldAPI) => React.ReactNode;
}

export interface FormAdapter {
	readonly name: string;
	readonly FormProvider: React.ComponentType<FormProviderProps>;
	readonly Field: React.ComponentType<FieldProps>;
}
