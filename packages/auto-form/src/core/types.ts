import type {
	FieldMeta,
	ValidationResult,
} from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";

export interface SchemaProvider<TSchema = unknown> {
	readonly _type?: TSchema;
	readonly fields: FieldMeta[];
	getFieldMeta: (path: string) => FieldMeta | undefined;
	readonly jsonSchema: import("@code2-base-ui/json-schema-toolkit").JsonSchema;
	validate: (data: unknown) => ValidationResult;
}

export interface SchemaProviderFactory {
	create: <T>(schema: T) => SchemaProvider<T>;
	readonly name: string;
}

export interface FormAPI {
	dirty: boolean;
	errors: Record<string, string | undefined>;
	isSubmitting: boolean;
	reset: () => void;
	submit: (e: { preventDefault: () => void }) => void;
	values: Record<string, unknown>;
}

export interface FieldController {
	error?: string;
	onBlur: () => void;
	onChange: (value: unknown) => void;
	touched: boolean;
	value: unknown;
}

export interface FormStateAdapter {
	readonly name: string;
	useField: (name: string) => FieldController;
	useForm: (config: {
		defaultValues?: Record<string, unknown>;
		validate: (data: unknown) => ValidationResult;
	}) => FormAPI;
}

export interface AutoFormProps<TSchema = unknown> {
	children?: ReactNode;
	className?: string;
	defaultValues?: Record<string, unknown>;
	onSubmit?: (data: unknown) => void | Promise<void>;
	schema: TSchema;
}

export interface LayoutStrategy {
	readonly name: string;
	render: (
		fields: FieldMeta[],
		renderField: (field: FieldMeta) => ReactNode
	) => ReactNode;
}
