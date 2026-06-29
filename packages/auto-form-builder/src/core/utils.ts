// =============================================================================
// JSON Schema Toolkit — Utils
// Fonctions pures d'extraction de métadonnées depuis un JsonSchema résolu.
// Zéro dépendance externe.
// =============================================================================

import type {
	FieldConstraints,
	FieldKind,
	JsonSchema,
	JsonSchemaType,
} from "./types";

// ---------------------------------------------------------------------------
// Extraction du type
// ---------------------------------------------------------------------------

/**
 * Retourne le type principal du schéma.
 * Si `type` est un tableau, retourne le premier type non-null.
 * Déduit "string" si enum est présent sans type explicite.
 */
export function getType(schema: JsonSchema): JsonSchemaType {
	if (!schema.type) {
		// Déduction implicite
		if (schema.enum) {
			return "string";
		}
		if (schema.properties) {
			return "object";
		}
		if (schema.items || schema.prefixItems) {
			return "array";
		}
		return "string"; // fallback
	}

	if (Array.isArray(schema.type)) {
		// Retourner le premier type non-null
		const nonNull = schema.type.find((t) => t !== "null");
		return (nonNull ?? schema.type[0]) as JsonSchemaType;
	}

	return schema.type as JsonSchemaType;
}

// ---------------------------------------------------------------------------
// Extraction du kind sémantique
// ---------------------------------------------------------------------------

/**
 * Détermine le FieldKind d'un schéma résolu.
 * Priorité : union > enum > object > array > primitive
 */
export function getKind(schema: JsonSchema): FieldKind {
	// Union (oneOf/anyOf avec plusieurs variantes)
	const hasOneOf = Array.isArray(schema.oneOf) && schema.oneOf.length > 1;
	const hasAnyOf = Array.isArray(schema.anyOf) && schema.anyOf.length > 1;
	if (hasOneOf || hasAnyOf) {
		return "union";
	}

	// Enum explicite
	if (schema.enum && schema.enum.length > 0) {
		return "enum";
	}

	const type = getType(schema);

	if (type === "object") {
		return "object";
	}
	if (type === "array") {
		return "array";
	}

	return "primitive";
}

// ---------------------------------------------------------------------------
// Extraction du label
// ---------------------------------------------------------------------------

/**
 * Retourne le label lisible d'un champ.
 * Priorité : x-ui-label > title > name (capitalisation automatique)
 */
export function getLabel(schema: JsonSchema, name: string): string {
	if (schema["x-ui-label"] && typeof schema["x-ui-label"] === "string") {
		return schema["x-ui-label"];
	}
	if (schema.title) {
		return schema.title;
	}

	// Capitalisation du nom : "firstName" → "First Name", "user_id" → "User Id"
	return name
		.replace(/([A-Z])/g, " $1")
		.replace(/_/g, " ")
		.split(" ")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
		.trim();
}

// ---------------------------------------------------------------------------
// Extraction de la valeur par défaut
// ---------------------------------------------------------------------------

/**
 * Retourne la valeur par défaut du schéma, ou undefined.
 */
export function getDefaultValue(schema: JsonSchema): unknown {
	return schema.default;
}

// ---------------------------------------------------------------------------
// Extraction des valeurs enum
// ---------------------------------------------------------------------------

/**
 * Retourne les valeurs enum du schéma, ou undefined.
 * Supporte enum[] et const (converti en tableau à un élément).
 */
export function getEnum(schema: JsonSchema): unknown[] | undefined {
	if (schema.enum) {
		return schema.enum;
	}
	if (schema.const !== undefined) {
		return [schema.const];
	}
	return;
}

// ---------------------------------------------------------------------------
// Extraction des contraintes de validation
// ---------------------------------------------------------------------------

/**
 * Extrait toutes les contraintes de validation en un objet normalisé.
 * Gère la compatibilité Draft 7 (exclusiveMinimum comme boolean) et 2020-12 (nombre).
 */
export function getConstraints(
	schema: JsonSchema
): FieldConstraints | undefined {
	const constraints: FieldConstraints = {};
	let hasConstraint = false;

	// String
	if (schema.minLength !== undefined) {
		constraints.minLength = schema.minLength;
		hasConstraint = true;
	}
	if (schema.maxLength !== undefined) {
		constraints.maxLength = schema.maxLength;
		hasConstraint = true;
	}
	if (schema.pattern !== undefined) {
		constraints.pattern = schema.pattern;
		hasConstraint = true;
	}

	// Number
	if (schema.minimum !== undefined) {
		constraints.minimum = schema.minimum;
		hasConstraint = true;
	}
	if (schema.maximum !== undefined) {
		constraints.maximum = schema.maximum;
		hasConstraint = true;
	}

	// exclusiveMinimum / exclusiveMaximum
	// Draft 7 : boolean (la limite est minimum/maximum) → on ignore le boolean
	// Draft 2020-12 : number
	if (
		schema.exclusiveMinimum !== undefined &&
		typeof schema.exclusiveMinimum === "number"
	) {
		constraints.exclusiveMinimum = schema.exclusiveMinimum;
		hasConstraint = true;
	}
	if (
		schema.exclusiveMaximum !== undefined &&
		typeof schema.exclusiveMaximum === "number"
	) {
		constraints.exclusiveMaximum = schema.exclusiveMaximum;
		hasConstraint = true;
	}
	if (schema.multipleOf !== undefined) {
		constraints.multipleOf = schema.multipleOf;
		hasConstraint = true;
	}

	// Array
	if (schema.minItems !== undefined) {
		constraints.minItems = schema.minItems;
		hasConstraint = true;
	}
	if (schema.maxItems !== undefined) {
		constraints.maxItems = schema.maxItems;
		hasConstraint = true;
	}
	if (schema.uniqueItems !== undefined) {
		constraints.uniqueItems = schema.uniqueItems;
		hasConstraint = true;
	}

	return hasConstraint ? constraints : undefined;
}

// ---------------------------------------------------------------------------
// Extraction des options UI (x-ui-*)
// ---------------------------------------------------------------------------

export interface UiOptions {
	hidden?: boolean;
	order?: number;
	placeholder?: string;
	readonly?: boolean;
	widget?: string;
}

export function getUiOptions(schema: JsonSchema): UiOptions {
	return {
		widget: schema["x-ui-widget"] as string | undefined,
		hidden: schema["x-ui-hidden"] as boolean | undefined,
		readonly: schema["x-ui-readonly"] as boolean | undefined,
		order: schema["x-ui-order"] as number | undefined,
		placeholder: schema.placeholder,
	};
}

// ---------------------------------------------------------------------------
// Inférence du type TypeScript (pour les adapters)
// ---------------------------------------------------------------------------

/**
 * Retourne une représentation string du type TypeScript correspondant au schéma.
 * Utile pour la génération de code / documentation.
 */
export function inferTSType(schema: JsonSchema): string {
	const type = getType(schema);

	if (schema.enum) {
		return schema.enum.map((v) => JSON.stringify(v)).join(" | ");
	}
	if (schema.const !== undefined) {
		return JSON.stringify(schema.const);
	}

	switch (type) {
		case "string":
			return "string";
		case "number":
		case "integer":
			return "number";
		case "boolean":
			return "boolean";
		case "null":
			return "null";
		case "object": {
			if (!schema.properties) {
				return "Record<string, unknown>";
			}
			const props = Object.entries(
				schema.properties as Record<string, JsonSchema>
			)
				.map(([k, v]) => {
					const required = schema.required?.includes(k) ?? false;
					return `${k}${required ? "" : "?"}: ${inferTSType(v)}`;
				})
				.join("; ");
			return `{ ${props} }`;
		}
		case "array": {
			if (!schema.items || Array.isArray(schema.items)) {
				return "unknown[]";
			}
			return `${inferTSType(schema.items as JsonSchema)}[]`;
		}
		default:
			return "unknown";
	}
}

// ---------------------------------------------------------------------------
// Vérification de nullabilité
// ---------------------------------------------------------------------------

/**
 * Retourne true si le schéma accepte null comme valeur valide.
 */
export function isNullable(schema: JsonSchema): boolean {
	if (Array.isArray(schema.type)) {
		return schema.type.includes("null");
	}
	// anyOf avec { type: "null" }
	if (schema.anyOf) {
		return schema.anyOf.some((sub) => (sub as JsonSchema).type === "null");
	}
	return false;
}
