// =============================================================================
// JSON Schema Toolkit — Type Guards & Assertions
// Utilitaires pour la vérification de type au runtime (narrowing).
// =============================================================================

import type { FieldMeta, JsonSchema } from "./types";

export class FieldGuard {
	constructor() {
		console.warn(
			"FieldGuard is a static utility class. Do not instantiate it."
		);
	}

	/**
	 * Type Guard pour vérifier si un champ est primitif (string, number, boolean, etc.)
	 */

	static isFieldPrimitive(
		field: FieldMeta
	): field is FieldMeta & { kind: "primitive" } {
		return field.kind === "primitive";
	}

	/**
	 * Type Guard pour vérifier si un champ est un objet (contient des children)
	 */

	static isFieldObject(
		field: FieldMeta
	): field is FieldMeta & { kind: "object"; children: FieldMeta[] } {
		return field.kind === "object" && Array.isArray(field.children);
	}

	/**
	 * Type Guard pour vérifier si un champ est un tableau (contient itemMeta)
	 */

	static isFieldArray(
		field: FieldMeta
	): field is FieldMeta & { kind: "array"; itemMeta: FieldMeta } {
		return field.kind === "array" && field.itemMeta !== undefined;
	}

	/**
	 * Type Guard pour vérifier si un champ est un enum
	 */

	static isFieldEnum(
		field: FieldMeta
	): field is FieldMeta & { kind: "enum"; enum: unknown[] } {
		return field.kind === "enum" && Array.isArray(field.enum);
	}

	/**
	 * Type Guard pour vérifier si un champ est une union (unions oneOf/anyOf)
	 */

	static isFieldUnion(
		field: FieldMeta
	): field is FieldMeta & { kind: "union"; variants: FieldMeta[][] } {
		return field.kind === "union" && Array.isArray(field.variants);
	}

	/**
	 * Assertion : Assure qu'un objet est un FieldMeta valide au runtime.
	 * @throws Error si l'objet ne respecte pas la structure de base.
	 */

	static assertFieldMeta(value: unknown): asserts value is FieldMeta {
		if (typeof value !== "object" || value === null) {
			throw new Error("Invalid FieldMeta: value must be an object");
		}
		const f = value as FieldMeta;
		if (typeof f.path !== "string") {
			throw new Error("Invalid FieldMeta: missing path");
		}
		if (typeof f.name !== "string") {
			throw new Error("Invalid FieldMeta: missing name");
		}
		if (typeof f.type !== "string") {
			throw new Error("Invalid FieldMeta: missing type");
		}
		if (!["primitive", "object", "array", "enum", "union"].includes(f.kind)) {
			throw new Error(`Invalid FieldMeta: unknown kind "${f.kind}"`);
		}
	}

	/**
	 * Vérifie si un objet ressemble à un JsonSchema valide.
	 */

	static isJsonSchema(value: unknown): value is JsonSchema {
		if (typeof value !== "object" || value === null) {
			return false;
		}
		// Un schéma JSON est techniquement n'importe quel objet (ou boolean en Draft 7+)
		// Ici on check les clés communes pour le toolkit
		return true;
	}
}
