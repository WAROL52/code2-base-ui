import { describe, expectTypeOf, it } from "vitest";
import type { SchemaAdapter } from "../../src/adapter/types";
import type { JsonSchema, ValidationResult } from "../../src/types";

describe("SchemaAdapter types", () => {
	it("requires a name", () => {
		type Adapter = SchemaAdapter;
		// The name must be a string
		expectTypeOf<Adapter["name"]>().toBeString();
	});

	it("has fromJsonSchema method", () => {
		type Adapter = SchemaAdapter<string>;
		expectTypeOf<Adapter["fromJsonSchema"]>().toMatchTypeOf<
			(schema: JsonSchema) => string
		>();
	});

	it("has validate method returning ValidationResult", () => {
		type Adapter = SchemaAdapter;
		expectTypeOf<Adapter["validate"]>().toMatchTypeOf<
			(nativeSchema: unknown, data: unknown) => ValidationResult
		>();
	});
});
