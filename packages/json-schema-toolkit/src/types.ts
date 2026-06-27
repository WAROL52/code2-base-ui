export interface JsonSchema {
	type?: string | string[];
	format?: string;
	properties?: Record<string, JsonSchema>;
	items?: JsonSchema;
	required?: string[];
	enum?: unknown[];
	const?: unknown;
	description?: string;
	default?: unknown;
	[key: string]: unknown;
}

export interface ValidationResult {
	success: boolean;
	errors: ValidationError[];
}

export interface ValidationError {
	path: string;
	message: string;
}

export interface FieldMeta {
	path: string;
	type: string;
	format?: string;
	uiWidget?: string;
	required?: boolean;
	description?: string;
	defaultValue?: unknown;
	enum?: unknown[];
	properties?: Record<string, FieldMeta>;
}

export interface GroupCriteria {
	by: "type" | "format" | "required" | ((field: FieldMeta) => string);
}

export interface RegistrySelector {
	type?: string;
	format?: string;
	widget?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldComponent<TProps = Record<string, any>> = React.ComponentType<TProps>;

export interface RegistryEntry {
	selector: RegistrySelector;
	component: FieldComponent;
	priority: number;
}
