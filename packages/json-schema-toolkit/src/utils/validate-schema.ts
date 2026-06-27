import type { JsonSchema, ValidationResult } from "../types";

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
  data: unknown,
): ValidationResult {
  try {
    const dataObj = data as Record<string, unknown>;

    if (Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        if (!dataObj || !(requiredField in dataObj)) {
          return {
            success: false,
            errors: [{ path: requiredField, message: "Missing required field" }],
          };
        }
      }
    }

    const properties = schema.properties || {};
    const errors: Array<{ path: string; message: string }> = [];

    for (const [key, propSchema] of Object.entries(properties)) {
      if (dataObj && key in dataObj && propSchema && typeof propSchema === "object") {
        const value = dataObj[key];
        const type = propSchema.type;

        if (type === "string" && typeof value !== "string") {
          errors.push({ path: key, message: "Expected string, got " + typeof value });
        } else if (type === "number" && typeof value !== "number") {
          errors.push({ path: key, message: "Expected number, got " + typeof value });
        } else if (type === "boolean" && typeof value !== "boolean") {
          errors.push({ path: key, message: "Expected boolean, got " + typeof value });
        } else if (type === "object" && typeof value !== "object") {
          errors.push({ path: key, message: "Expected object, got " + typeof value });
        } else if (Array.isArray(type) && !type.includes(typeof value)) {
          errors.push({
            path: key,
            message: "Expected one of " + type.join(", ") + ", got " + typeof value,
          });
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, errors: [] };
  } catch {
    return { success: false, errors: [{ path: "", message: "Schema validation failed" }] };
  }
}