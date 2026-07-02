import type { TSchema } from "@sinclair/typebox";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { StandardSchema } from "../../src/core/schema";
import {
	numberSchema,
	objectSchema,
	stringSchema,
	toJsonSchema,
	validateSchema,
} from "../../src/core/schema";

describe("core/schema types", () => {
	it("imports compile", () => {
		expectTypeOf<TSchema>().toBeObject();
	});

	it("StandardSchema is assignable from TSchema", () => {
		expectTypeOf<typeof stringSchema>().toMatchTypeOf<() => StandardSchema>();
	});
});

describe("core/schema", () => {
	it("creates a string schema", () => {
		const schema = stringSchema();
		expect(schema).toBeDefined();
		expect(schema["~standard"].version).toBe(1);
	});

	it("converts to JSON Schema", () => {
		const schema = stringSchema();
		const json = toJsonSchema(schema);
		expect(json.type).toBe("string");
	});

	it("validates correct data", () => {
		const schema = stringSchema();
		const result = validateSchema(schema, "hello");
		expect(result.success).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("validates incorrect data", () => {
		const schema = numberSchema();
		const result = validateSchema(schema, "not a number");
		expect(result.success).toBe(false);
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it("creates an object schema", () => {
		const schema = objectSchema({
			name: stringSchema(),
			age: numberSchema(),
		});
		const json = toJsonSchema(schema);
		expect(json.type).toBe("object");
		expect(json.properties).toBeDefined();
		expect(json.properties?.name).toBeDefined();
	});

	it("validates a correct object", () => {
		const schema = objectSchema({
			name: stringSchema(),
		});
		const result = validateSchema(schema, { name: "Alice" });
		expect(result.success).toBe(true);
	});
});
