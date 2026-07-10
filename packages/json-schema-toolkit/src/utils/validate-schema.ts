import type { JsonSchema, JsonSchemaType, ValidationResult } from "../types";

function checkRequiredFields(
	schema: JsonSchema,
	dataObj: Record<string, unknown>
): ValidationResult | null {
	if (!Array.isArray(schema.required)) {
		return null;
	}
	for (const requiredField of schema.required) {
		if (!(requiredField in dataObj)) {
			return {
				success: false,
				errors: [{ path: requiredField, message: "Missing required field" }],
			};
		}
	}
	return null;
}

function validatePropType(
	_key: string,
	value: unknown,
	type: JsonSchemaType | JsonSchemaType[] | undefined
): string | null {
	if (type === "string" && typeof value !== "string") {
		return `Expected string, got ${typeof value}`;
	}
	if (type === "number" && typeof value !== "number") {
		return `Expected number, got ${typeof value}`;
	}
	if (type === "boolean" && typeof value !== "boolean") {
		return `Expected boolean, got ${typeof value}`;
	}
	if (type === "object" && typeof value !== "object") {
		return `Expected object, got ${typeof value}`;
	}
	if (Array.isArray(type) && !type.includes(typeof value as JsonSchemaType)) {
		return `Expected one of ${type.join(", ")}, got ${typeof value}`;
	}
	return null;
}

/**
 * Validates data against a raw JSON Schema.
 *
 * For simplicity, this implementation extracts required fields from the schema
 * and checks if the data contains those fields (basic validation).
 *
 * @param schema - The JSON Schema to validate against
 * @param data - The data to validate
 * @returns A ValidationResult
 */
export function validateSchema(
	schema: JsonSchema,
	data: unknown
): ValidationResult {
	try {
		const dataObj = data as Record<string, unknown>;

		const requiredResult = checkRequiredFields(schema, dataObj);
		if (requiredResult) {
			return requiredResult;
		}

		const properties = schema.properties || {};
		const errors: Array<{ path: string; message: string }> = [];

		for (const [key, propSchema] of Object.entries(properties)) {
			if (
				dataObj &&
				key in dataObj &&
				propSchema &&
				typeof propSchema === "object"
			) {
				const value = dataObj[key];
				const error = validatePropType(key, value, propSchema.type);
				if (error) {
					errors.push({ path: key, message: error });
				}
			}
		}

		if (errors.length > 0) {
			return { success: false, errors };
		}

		return { success: true, errors: [] };
	} catch {
		return {
			success: false,
			errors: [{ path: "", message: "Schema validation failed" }],
		};
	}
}
