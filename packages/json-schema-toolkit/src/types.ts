export type JsonSchemaDraft = "draft-7" | "draft-2020-12";

export type JsonSchemaType =
	| "string"
	| "number"
	| "integer"
	| "boolean"
	| "object"
	| "array"
	| "null";

export interface JsonSchema {
	$defs?: Record<string, JsonSchema>;
	$id?: string;
	$ref?: string;
	$schema?: string;
	additionalProperties?: boolean | JsonSchema;
	allOf?: JsonSchema[];
	anyOf?: JsonSchema[];
	const?: unknown;
	default?: unknown;
	definitions?: Record<string, JsonSchema>;
	description?: string;
	discriminator?: {
		propertyName: string;
		mapping?: Record<string, string>;
	};
	else?: JsonSchema;
	enum?: unknown[];
	exclusiveMaximum?: number | boolean;
	exclusiveMinimum?: number | boolean;
	format?: string;
	if?: JsonSchema;
	items?: JsonSchema | JsonSchema[];
	maxItems?: number;
	maximum?: number;
	maxLength?: number;
	minItems?: number;
	minimum?: number;
	minLength?: number;
	multipleOf?: number;
	not?: JsonSchema;
	oneOf?: JsonSchema[];
	pattern?: string;
	patternProperties?: Record<string, JsonSchema>;
	placeholder?: string;
	prefixItems?: JsonSchema[];
	properties?: Record<string, JsonSchema>;
	required?: string[];
	then?: JsonSchema;
	title?: string;
	type?: JsonSchemaType | JsonSchemaType[];
	uniqueItems?: boolean;
	"x-ui-description"?: string;
	"x-ui-hidden"?: boolean;
	"x-ui-label"?: string;
	"x-ui-order"?: number;
	"x-ui-readonly"?: boolean;
	"x-ui-widget"?: string;
	[key: string]: unknown;
}

export type FieldKind = "primitive" | "object" | "array" | "enum" | "union";

export interface FieldConstraints {
	enum?: unknown[];
	exclusiveMaximum?: number;
	exclusiveMinimum?: number;
	format?: string;
	maxItems?: number;
	maximum?: number;
	maxLength?: number;
	minItems?: number;
	minimum?: number;
	minLength?: number;
	multipleOf?: number;
	pattern?: string;
	type?: string;
	uniqueItems?: boolean;
}

export interface ResolvedSchema {
	definitions: Record<string, JsonSchema>;
	draft: JsonSchemaDraft;
	root: JsonSchema;
}

export interface ValidationError {
	code?: string;
	message: string;
	path: string;
}

export interface ValidationResult {
	errors: ValidationError[];
	success: boolean;
}

export interface VariantField {
	children: FieldMeta[];
	label: string;
	meta: FieldMeta;
}

export interface FieldMeta {
	children?: FieldMeta[];
	constraints?: FieldConstraints;
	defaultValue?: unknown;
	description?: string;
	discriminantKey?: string;
	enum?: unknown[];
	format?: string;
	itemMeta?: FieldMeta;
	kind?: FieldKind;
	label: string;
	name?: string;
	path: string;
	placeholder?: string;
	properties?: Record<string, FieldMeta>;
	required?: boolean;
	resolvedSchema?: JsonSchema;
	type: string;
	uiHidden?: boolean;
	uiOrder?: number;
	uiReadonly?: boolean;
	uiWidget?: string;
	variants?: VariantField[];
}

export interface GroupCriteria {
	by: "type" | "format" | "required" | ((field: FieldMeta) => string);
}

export interface RegistrySelector {
	format?: string;
	kind?: FieldKind;
	type?: string;
	widget?: string;
}

// biome-ignore lint/suspicious/noExplicitAny: Dynamic field props
export type FieldComponent<TProps = Record<string, any>> =
	React.ComponentType<TProps>;

export interface RegistryEntry {
	component: FieldComponent;
	priority: number;
	selector: RegistrySelector;
}

export type Locale = string;

export interface I18nMessages {
	exclusiveMaximum: (max: number) => string;
	exclusiveMinimum: (min: number) => string;
	invalidEnum: (values: unknown[]) => string;
	invalidFormat: (format: string) => string;
	invalidType: (expected: string) => string;
	maxItems: (max: number) => string;
	maximum: (max: number) => string;
	maxLength: (max: number) => string;
	minItems: (min: number) => string;
	minimum: (min: number) => string;
	minLength: (min: number) => string;
	multipleOf: (factor: number) => string;
	pattern: (pattern: string) => string;
	required: string;
	uniqueItems: string;
}
