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

export interface FormAdapter {
	name: string;
	FormProvider: React.ComponentType<{
		children: (form: FormAPI) => React.ReactNode;
	}>;
	Field: React.ComponentType<{
		name: string;
		children: (field: FieldAPI) => React.ReactNode;
	}>;
}
