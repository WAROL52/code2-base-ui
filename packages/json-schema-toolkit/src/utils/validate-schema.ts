import { type TSchema, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import type { JsonSchema, ValidationResult } from "../types";

const PATH_CLEANER = /^\//;
const PATH_SEPARATOR = /\//g;

function toTypeBox(schema: JsonSchema): TSchema {
	const properties = schema.properties ?? {};
	const tbProps: Record<string, TSchema> = {};

	for (const [key, prop] of Object.entries(properties)) {
		const propSchema = prop as JsonSchema;
		switch (propSchema.type) {
			case "string":
				tbProps[key] = Type.String();
				break;
			case "number":
			case "integer":
				tbProps[key] = Type.Number();
				break;
			case "boolean":
				tbProps[key] = Type.Boolean();
				break;
			case "array":
				tbProps[key] = Type.Array(Type.Unknown());
				break;
			case "object":
				tbProps[key] = Type.Record(Type.String(), Type.Unknown());
				break;
			default:
				tbProps[key] = Type.Unknown();
		}
	}

	const required = schema.required as string[] | undefined;
	if (required) {
		return Type.Object(tbProps, { required });
	}
	return Type.Object(tbProps);
}

/**
 * Validates data against a JSON Schema using TypeBox.
 *
 * @deprecated Use `validateSchema` from `@code2-base-ui/json-schema-toolkit/core`
 * instead. This function is kept for backward compatibility.
 *
 * @param schema - The JSON Schema to validate against
 * @param data - The data to validate
 * @returns A ValidationResult
 */
export function validateJsonSchema(
	schema: JsonSchema,
	data: unknown
): ValidationResult {
	try {
		const tbSchema = toTypeBox(schema);

		if (Value.Check(tbSchema, data)) {
			return { success: true, errors: [] };
		}

		const errors: Array<{ path: string; message: string }> = [];
		for (const error of Value.Errors(tbSchema, data)) {
			errors.push({
				path: error.path.replace(PATH_CLEANER, "").replace(PATH_SEPARATOR, "."),
				message: error.message,
			});
		}

		return { success: false, errors };
	} catch {
		return {
			success: false,
			errors: [{ path: "", message: "Schema validation failed" }],
		};
	}
}
