import { isUnionSchema } from "./normalizer";
import type {
	FieldConstraints,
	FieldKind,
	JsonSchema,
	JsonSchemaType,
} from "./types";

export function getType(schema: JsonSchema): JsonSchemaType {
	if (!schema.type) {
		if (schema.enum) {
			return "string";
		}
		if (schema.properties) {
			return "object";
		}
		if (schema.items || schema.prefixItems) {
			return "array";
		}
		return "string";
	}

	if (Array.isArray(schema.type)) {
		const nonNull = schema.type.find((t) => t !== "null");
		return (nonNull ?? schema.type[0]) as JsonSchemaType;
	}

	return schema.type as JsonSchemaType;
}

export function getKind(schema: JsonSchema): FieldKind {
	if (isUnionSchema(schema)) {
		return "union";
	}

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

export function getLabel(schema: JsonSchema, name: string): string {
	if (schema["x-ui-label"] && typeof schema["x-ui-label"] === "string") {
		return schema["x-ui-label"];
	}
	if (schema.title) {
		return schema.title;
	}

	return name
		.replace(/([A-Z])/g, " $1")
		.replace(/_/g, " ")
		.split(" ")
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
		.trim();
}

export function getDefaultValue(schema: JsonSchema): unknown {
	return schema.default;
}

export function getEnum(schema: JsonSchema): unknown[] | undefined {
	if (schema.enum) {
		return schema.enum;
	}
	if (schema.const !== undefined) {
		return [schema.const];
	}
	return;
}

export function getConstraints(
	schema: JsonSchema
): FieldConstraints | undefined {
	const constraints: FieldConstraints = {};
	let hasConstraint = false;

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

	if (schema.minimum !== undefined) {
		constraints.minimum = schema.minimum;
		hasConstraint = true;
	}
	if (schema.maximum !== undefined) {
		constraints.maximum = schema.maximum;
		hasConstraint = true;
	}

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

	if (schema.enum !== undefined) {
		constraints.enum = schema.enum;
		hasConstraint = true;
	}
	if (schema.format !== undefined) {
		constraints.format = schema.format;
		hasConstraint = true;
	}
	if (schema.type !== undefined) {
		constraints.type = Array.isArray(schema.type)
			? schema.type[0]
			: schema.type;
		hasConstraint = true;
	}

	return hasConstraint ? constraints : undefined;
}

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

export function isNullable(schema: JsonSchema): boolean {
	if (Array.isArray(schema.type)) {
		return schema.type.includes("null");
	}
	if (schema.anyOf) {
		return schema.anyOf.some((sub) => (sub as JsonSchema).type === "null");
	}
	return false;
}
