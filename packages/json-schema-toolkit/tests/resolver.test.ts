import { describe, expect, it } from "vitest";
import { mergeAllOf, resolveSchema } from "../src/resolver";
import type { JsonSchema } from "../src/types";

describe("mergeAllOf", () => {
	it("merges properties from multiple schemas", () => {
		const result = mergeAllOf([
			{ type: "object", properties: { name: { type: "string" } } },
			{ type: "object", properties: { age: { type: "number" } } },
		]);
		expect(result.properties).toEqual({
			name: { type: "string" },
			age: { type: "number" },
		});
	});

	it("merges required arrays with dedup", () => {
		const result = mergeAllOf([
			{ required: ["name"] },
			{ required: ["name", "age"] },
		]);
		expect(result.required).toEqual(["name", "age"]);
	});

	it("first schema type wins, non-merged keys from second are also taken", () => {
		const result = mergeAllOf([
			{ type: "string", minLength: 1 },
			{ type: "number", minimum: 0 },
		]);
		expect(result.type).toBe("string");
		expect(result.minLength).toBe(1);
		// minimum is only in second schema, so it gets merged
		expect(result.minimum).toBe(0);
	});

	it("takes items only if not already defined", () => {
		const result = mergeAllOf([
			{ type: "array", items: { type: "string" } },
			{ type: "array", items: { type: "number" } },
		]);
		expect(result.items).toEqual({ type: "string" });
	});

	it("merges allOf with nested allOf", () => {
		const schema: JsonSchema = {
			allOf: [
				{ properties: { a: { type: "string" } } },
				{
					allOf: [
						{ properties: { b: { type: "number" } } },
						{ required: ["b"] },
					],
				},
			],
		};
		const resolved = resolveSchema(schema);
		expect(resolved.root.properties).toHaveProperty("a");
		expect(resolved.root.properties).toHaveProperty("b");
	});
});

describe("resolveSchema", () => {
	it("resolves $ref to definition", () => {
		const schema: JsonSchema = {
			$defs: {
				name: { type: "string", minLength: 1 },
			},
			type: "object",
			properties: {
				user: { $ref: "#/$defs/name" },
			},
		};
		const resolved = resolveSchema(schema);
		const user = resolved.root.properties?.user as JsonSchema;
		expect(user.type).toBe("string");
		expect(user.minLength).toBe(1);
	});

	it("resolves $ref in allOf sub-schemas", () => {
		const schema: JsonSchema = {
			$defs: {
				base: { properties: { id: { type: "string" } } },
			},
			allOf: [{ $ref: "#/$defs/base" }],
		};
		const resolved = resolveSchema(schema);
		expect(resolved.root.properties).toHaveProperty("id");
	});

	it("handles $ref in oneOf sub-schemas", () => {
		const schema: JsonSchema = {
			$defs: {
				cat: { type: "object", properties: { name: { type: "string" } } },
				dog: { type: "object", properties: { breed: { type: "string" } } },
			},
			oneOf: [{ $ref: "#/$defs/cat" }, { $ref: "#/$defs/dog" }],
		};
		const resolved = resolveSchema(schema);
		expect(resolved.root.oneOf).toHaveLength(2);
	});

	it("detects circular $ref and returns placeholder", () => {
		const circular: JsonSchema = {
			$defs: {
				node: {
					type: "object",
					properties: {
						name: { type: "string" },
						child: { $ref: "#/$defs/node" },
					},
				},
			},
			$ref: "#/$defs/node",
		};
		const resolved = resolveSchema(circular);
		// Should not throw; circular ref becomes placeholder
		expect(resolved.root.type).toBe("object");
	});

	it("handles object with no properties", () => {
		const resolved = resolveSchema({ type: "object" });
		expect(resolved.root.type).toBe("object");
	});

	it("preserves enum on array type", () => {
		const schema: JsonSchema = {
			allOf: [
				{ type: "string" },
				{ enum: ["a", "b", "c"] },
			],
		};
		const resolved = resolveSchema(schema);
		expect(resolved.root.type).toBe("string");
		expect(resolved.root.enum).toEqual(["a", "b", "c"]);
	});
});
