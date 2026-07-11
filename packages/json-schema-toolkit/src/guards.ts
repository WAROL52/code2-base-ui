import type { FieldMeta, JsonSchema, VariantField } from "./types";

export function isFieldPrimitive(
	field: FieldMeta
): field is FieldMeta & { kind: "primitive" } {
	return field.kind === "primitive";
}

export function isFieldObject(
	field: FieldMeta
): field is FieldMeta & { kind: "object"; children: FieldMeta[] } {
	return field.kind === "object" && Array.isArray(field.children);
}

export function isFieldArray(
	field: FieldMeta
): field is FieldMeta & { kind: "array"; itemMeta: FieldMeta } {
	return field.kind === "array" && field.itemMeta !== undefined;
}

export function isFieldEnum(
	field: FieldMeta
): field is FieldMeta & { kind: "enum"; enum: unknown[] } {
	return field.kind === "enum" && Array.isArray(field.enum);
}

export function isFieldUnion(
	field: FieldMeta
): field is FieldMeta & { kind: "union"; variants: VariantField[] } {
	return field.kind === "union" && Array.isArray(field.variants);
}

export function assertFieldMeta(value: unknown): asserts value is FieldMeta {
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
	if (
		!["primitive", "object", "array", "enum", "union"].includes(f.kind ?? "")
	) {
		throw new Error(`Invalid FieldMeta: unknown kind "${f.kind}"`);
	}
}

export function isJsonSchema(value: unknown): value is JsonSchema {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	return true;
}
