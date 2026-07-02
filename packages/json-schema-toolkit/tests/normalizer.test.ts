import { describe, expect, it } from "vitest";
import {
	detectDiscriminant,
	getUnionVariants,
	getVariantLabel,
	isUnionSchema,
	normalizeUnion,
} from "../src/normalizer";
import type { JsonSchema } from "../src/types";

const stringSchema: JsonSchema = { type: "string" };
const objectSchema: JsonSchema = {
	type: "object",
	properties: { name: { type: "string" } },
};

describe("isUnionSchema", () => {
	it("returns true for oneOf with > 1 entries", () => {
		expect(isUnionSchema({ oneOf: [stringSchema, objectSchema] })).toBe(true);
	});

	it("returns true for anyOf with > 1 entries", () => {
		expect(isUnionSchema({ anyOf: [stringSchema, objectSchema] })).toBe(true);
	});

	it("returns false for oneOf with 1 entry", () => {
		expect(isUnionSchema({ oneOf: [stringSchema] })).toBe(false);
	});

	it("returns false for anyOf with 1 entry", () => {
		expect(isUnionSchema({ anyOf: [objectSchema] })).toBe(false);
	});

	it("returns false for schema without anyOf/oneOf", () => {
		expect(isUnionSchema(stringSchema)).toBe(false);
	});

	it("prefers oneOf over anyOf when both are present", () => {
		const schema: JsonSchema = {
			anyOf: [stringSchema, objectSchema],
			oneOf: [stringSchema, objectSchema, stringSchema],
		};
		// Still true because oneOf.length > 1
		expect(isUnionSchema(schema)).toBe(true);
	});
});

describe("getUnionVariants", () => {
	it("returns oneOf when length > 1", () => {
		const variants = [stringSchema, objectSchema];
		expect(getUnionVariants({ oneOf: variants })).toBe(variants);
	});

	it("returns anyOf when length > 1 and oneOf not available", () => {
		const variants = [stringSchema, objectSchema];
		expect(getUnionVariants({ anyOf: variants })).toBe(variants);
	});

	it("returns [] when no union", () => {
		expect(getUnionVariants(stringSchema)).toEqual([]);
	});

	it("returns [] when oneOf length <= 1", () => {
		expect(getUnionVariants({ oneOf: [stringSchema] })).toEqual([]);
	});
});

describe("detectDiscriminant", () => {
	it("returns explicit discriminator.propertyName", () => {
		const result = detectDiscriminant(
			{ discriminator: { propertyName: "type" } },
			[
				{
					type: "object",
					properties: { type: { const: "a" }, name: { type: "string" } },
				},
				{
					type: "object",
					properties: { type: { const: "b" }, name: { type: "string" } },
				},
			]
		);
		expect(result).toBe("type");
	});

	it("detects implicit discriminant from const properties", () => {
		const result = detectDiscriminant({}, [
			{
				type: "object",
				properties: { kind: { const: "human" }, name: { type: "string" } },
			},
			{
				type: "object",
				properties: { kind: { const: "robot" }, model: { type: "string" } },
			},
		]);
		expect(result).toBe("kind");
	});

	it("returns undefined when variants have no properties", () => {
		expect(
			detectDiscriminant({}, [{ type: "string" }, { type: "number" }])
		).toBeUndefined();
	});

	it("returns undefined when no shared const property", () => {
		expect(
			detectDiscriminant({}, [
				{
					type: "object",
					properties: { name: { type: "string" } },
				},
				{
					type: "object",
					properties: { age: { type: "number" } },
				},
			])
		).toBeUndefined();
	});

	it("returns undefined when const values are not unique", () => {
		expect(
			detectDiscriminant({}, [
				{
					type: "object",
					properties: { kind: { const: "same" } },
				},
				{
					type: "object",
					properties: { kind: { const: "same" } },
				},
			])
		).toBeUndefined();
	});
});

describe("getVariantLabel", () => {
	it("returns schema title when present", () => {
		expect(
			getVariantLabel({ title: "My Variant", type: "string" }, undefined, 0)
		).toBe("My Variant");
	});

	it("returns discriminant value when available", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: { kind: { const: "human" } },
		};
		expect(getVariantLabel(schema, "kind", 0)).toBe("human");
	});

	it("returns fallback when no title or discriminant", () => {
		expect(getVariantLabel(stringSchema, undefined, 0)).toBe("Variant 1");
		expect(getVariantLabel(stringSchema, undefined, 4)).toBe("Variant 5");
	});
});

describe("normalizeUnion", () => {
	it("returns variant info with labels and discriminant", () => {
		const variants = [
			{
				title: "Human",
				type: "object",
				properties: { name: { type: "string" } },
			},
			{
				title: "Robot",
				type: "object",
				properties: { model: { type: "string" } },
			},
		];
		const result = normalizeUnion({}, variants);
		expect(result).toHaveLength(2);
		expect(result[0]?.label).toBe("Human");
		expect(result[1]?.label).toBe("Robot");
	});

	it("handles scalar variants", () => {
		const variants = [{ type: "string" }, { type: "number" }];
		const result = normalizeUnion({}, variants);
		expect(result).toHaveLength(2);
		expect(result[0]?.label).toBe("Variant 1");
		expect(result[1]?.label).toBe("Variant 2");
	});
});
