// =============================================================================
// JSON Schema Toolkit — Core Types
// Zéro dépendance UI/React. Partagé par tous les modules du toolkit.
// =============================================================================

// ---------------------------------------------------------------------------
// JSON Schema Drafts
// ---------------------------------------------------------------------------

export type JsonSchemaDraft = "draft-7" | "draft-2020-12";

// ---------------------------------------------------------------------------
// JSON Schema brut (entrée utilisateur)
// ---------------------------------------------------------------------------

export type JsonSchemaType =
	| "string"
	| "number"
	| "integer"
	| "boolean"
	| "object"
	| "array"
	| "null";

export interface JsonSchema {
	/** Draft 2020-12 */
	$defs?: Record<string, JsonSchema>;
	$id?: string;

	// Références
	$ref?: string;
	// Meta
	$schema?: string;
	additionalProperties?: boolean | JsonSchema;

	// Composition
	allOf?: JsonSchema[];
	anyOf?: JsonSchema[];
	const?: unknown;

	// Valeur par défaut
	default?: unknown;
	/** Draft 7 */
	definitions?: Record<string, JsonSchema>;
	description?: string;

	// Discriminant pour oneOf/anyOf
	discriminator?: {
		propertyName: string;
		mapping?: Record<string, string>;
	};
	else?: JsonSchema;
	enum?: unknown[];
	exclusiveMaximum?: number | boolean;
	exclusiveMinimum?: number | boolean;

	// String
	format?: string;
	if?: JsonSchema;

	// Array
	items?: JsonSchema | JsonSchema[];
	maxItems?: number;
	maximum?: number;
	maxLength?: number;
	minItems?: number;

	// Number
	minimum?: number;
	minLength?: number;
	multipleOf?: number;
	not?: JsonSchema;
	oneOf?: JsonSchema[];
	pattern?: string;
	patternProperties?: Record<string, JsonSchema>;
	placeholder?: string;
	prefixItems?: JsonSchema[];

	// Object
	properties?: Record<string, JsonSchema>;
	required?: string[];
	then?: JsonSchema;
	title?: string;

	// Type
	type?: JsonSchemaType | JsonSchemaType[];
	uniqueItems?: boolean;
	"x-ui-description"?: string;
	"x-ui-hidden"?: boolean;
	"x-ui-label"?: string;
	"x-ui-order"?: number;
	"x-ui-readonly"?: boolean;

	// UI Extensions (x-ui-*)
	"x-ui-widget"?: string;

	// Permet les propriétés supplémentaires arbitraires
	[key: string]: unknown;
}

// ---------------------------------------------------------------------------
// FieldMeta — représentation normalisée d'un champ après résolution
// ---------------------------------------------------------------------------

export type FieldKind =
	| "primitive" // string, number, integer, boolean, null
	| "object" // type: object → children[]
	| "array" // type: array → itemMeta
	| "enum" // string/number avec enum[]
	| "union"; // oneOf/anyOf → variants[][]

export interface FieldMeta {
	/** Sous-champs (si kind === "object") */
	children?: FieldMeta[];

	/** Contraintes de validation */
	constraints?: FieldConstraints;

	/** Valeur par défaut */
	defaultValue?: unknown;

	/** Texte d'aide / description */
	description?: string;

	/** Propriété discriminante détectée pour les unions */
	discriminantKey?: string;

	/** Valeurs possibles pour un champ enum */
	enum?: unknown[];

	/** Format JSON Schema, ex: "date" | "email" | "uri" */
	format?: string;

	/** Métadonnées des items (si kind === "array") */
	itemMeta?: FieldMeta;

	/** Genre sémantique du champ */
	kind: FieldKind;

	/** Label affiché (title > x-ui-label > name) */
	label: string;

	/** Nom du champ (dernière partie du path) */
	name: string;
	/** Chemin pointé dans le schéma résolu, ex: "user.address.city" */
	path: string;

	/** Texte d'aide / placeholder */
	placeholder?: string;

	/** Le champ est obligatoire */
	required: boolean;

	/** Schéma JSON résolu du champ (copie profonde après résolution $ref) */
	resolvedSchema: JsonSchema;

	/** Type JSON Schema résolu, ex: "string" | "object" | "array" */
	type: JsonSchemaType;

	/** Masquer le champ dans l'UI */
	uiHidden?: boolean;

	/** Ordre d'affichage via "x-ui-order" */
	uiOrder?: number;

	/** Champ en lecture seule */
	uiReadonly?: boolean;

	/** Widget UI custom via "x-ui-widget", ex: "markdown" | "color-picker" */
	uiWidget?: string;

	/** Variantes (si kind === "union", ex: oneOf/anyOf) */
	variants?: FieldMeta[][];
}

export interface FieldConstraints {
	exclusiveMaximum?: number;
	exclusiveMinimum?: number;
	maxItems?: number;
	maximum?: number;
	maxLength?: number;
	minItems?: number;
	minimum?: number;
	minLength?: number;
	multipleOf?: number;
	pattern?: string;
	uniqueItems?: boolean;
}

// ---------------------------------------------------------------------------
// ResolvedSchema — schéma après résolution de tous les $ref + allOf
// ---------------------------------------------------------------------------

export interface ResolvedSchema {
	/** Dictionnaire des définitions (fusionné $defs + definitions) */
	definitions: Record<string, JsonSchema>;

	/** Draft détecté ou spécifié */
	draft: JsonSchemaDraft;
	/** Schéma racine résolu */
	root: JsonSchema;
}

// ---------------------------------------------------------------------------
// Résultat de validation (interface partagée par les adapters)
// ---------------------------------------------------------------------------

export interface ValidationError {
	/** Code d'erreur machine-readable, ex: "required" | "minLength" */
	code: string;

	/** Message d'erreur (localisé par l'adapter) */
	message: string;
	/** Chemin vers le champ en erreur, ex: "user.email" */
	path: string;
}

export interface ValidationResult {
	errors?: ValidationError[];
	success: boolean;
}

// ---------------------------------------------------------------------------
// I18n
// ---------------------------------------------------------------------------

export type Locale = string; // "fr" | "en" | "es" | ...

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
