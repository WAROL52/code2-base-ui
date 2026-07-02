import type { JsonSchema, ValidationResult } from "../types";

/**
 * Adapts between JSON Schema and a native validator's schema format.
 * Implement this interface to support custom validators (Zod, Valibot, etc.).
 */
export interface SchemaAdapter<N = unknown> {
	/**
	 * Converts a raw JSON Schema to the native schema format.
	 */
	fromJsonSchema: (schema: JsonSchema) => N;
	/** Name of the adapter (e.g. "zod", "valibot") */
	readonly name: string;

	/**
	 * Converts a native schema format back to raw JSON Schema.
	 */
	toJsonSchema: (nativeSchema: N) => JsonSchema;

	/**
	 * Validates data against a native schema and returns a normalized result.
	 */
	validate: (nativeSchema: N, data: unknown) => ValidationResult;
}
