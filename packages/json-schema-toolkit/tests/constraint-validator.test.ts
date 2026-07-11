import { describe, expect, it } from "vitest";
import { isEmpty, validateConstraint } from "../src/constraint-validator";

describe("isEmpty", () => {
	it("returns true for undefined", () => {
		expect(isEmpty(undefined)).toBe(true);
	});

	it("returns true for null", () => {
		expect(isEmpty(null)).toBe(true);
	});

	it("returns true for empty string", () => {
		expect(isEmpty("")).toBe(true);
	});

	it("returns false for non-empty values", () => {
		expect(isEmpty("hello")).toBe(false);
		expect(isEmpty(0)).toBe(false);
		expect(isEmpty(false)).toBe(false);
		expect(isEmpty([])).toBe(false);
	});
});

describe("validateConstraint", () => {
	it("returns required error when required and empty", () => {
		const result = validateConstraint(undefined, {}, true);
		expect(result?.type).toBe("required");
	});

	it("returns nothing when not required and empty", () => {
		const result = validateConstraint(undefined, {}, false);
		expect(result).toBeUndefined();
	});

	it("returns type error on wrong type", () => {
		const result = validateConstraint(42, { type: "string" }, false);
		expect(result?.type).toBe("type");
	});

	it("accepts integer for number type", () => {
		const result = validateConstraint(42, { type: "number" }, false);
		expect(result).toBeUndefined();
	});

	it("validates string minLength", () => {
		const result = validateConstraint(
			"ab",
			{ type: "string", minLength: 3 },
			false
		);
		expect(result?.type).toBe("minLength");
	});

	it("validates string maxLength", () => {
		const result = validateConstraint(
			"hello",
			{ type: "string", maxLength: 3 },
			false
		);
		expect(result?.type).toBe("maxLength");
	});

	it("validates string pattern", () => {
		const result = validateConstraint(
			"abc",
			{ type: "string", pattern: "^\\d+$" },
			false
		);
		expect(result?.type).toBe("pattern");
	});

	it("validates email format", () => {
		const result = validateConstraint(
			"not-an-email",
			{ type: "string", format: "email" },
			false
		);
		expect(result?.type).toBe("format");
	});

	it("validates number minimum", () => {
		const result = validateConstraint(2, { type: "number", minimum: 5 }, false);
		expect(result?.type).toBe("minimum");
	});

	it("validates number maximum", () => {
		const result = validateConstraint(
			10,
			{ type: "number", maximum: 5 },
			false
		);
		expect(result?.type).toBe("maximum");
	});

	it("validates exclusiveMinimum", () => {
		const result = validateConstraint(
			5,
			{ type: "number", exclusiveMinimum: 5 },
			false
		);
		expect(result?.type).toBe("exclusiveMinimum");
	});

	it("validates exclusiveMaximum", () => {
		const result = validateConstraint(
			10,
			{ type: "number", exclusiveMaximum: 10 },
			false
		);
		expect(result?.type).toBe("exclusiveMaximum");
	});

	it("validates multipleOf", () => {
		const result = validateConstraint(
			7,
			{ type: "number", multipleOf: 3 },
			false
		);
		expect(result?.type).toBe("multipleOf");
	});

	it("validates array minItems", () => {
		const result = validateConstraint(
			[1],
			{ type: "array", minItems: 3 },
			false
		);
		expect(result?.type).toBe("minItems");
	});

	it("validates array maxItems", () => {
		const result = validateConstraint(
			[1, 2, 3, 4],
			{ type: "array", maxItems: 3 },
			false
		);
		expect(result?.type).toBe("maxItems");
	});

	it("validates array uniqueItems", () => {
		const result = validateConstraint(
			[1, 2, 2],
			{ type: "array", uniqueItems: true },
			false
		);
		expect(result?.type).toBe("uniqueItems");
	});

	it("validates enum constraint", () => {
		const result = validateConstraint("x", { enum: ["a", "b", "c"] }, false);
		expect(result?.type).toBe("enum");
	});

	it("passes for valid enum value", () => {
		const result = validateConstraint("a", { enum: ["a", "b", "c"] }, false);
		expect(result).toBeUndefined();
	});

	it("passes for valid value", () => {
		const result = validateConstraint(
			"hello",
			{ type: "string", minLength: 2, maxLength: 10 },
			false
		);
		expect(result).toBeUndefined();
	});

	it("uses custom messages when provided", () => {
		const result = validateConstraint(
			"",
			{ type: "string", minLength: 3 },
			true,
			{
				required: "Obligatoire",
				minLength: (min: number) => `Min ${min}`,
				maxLength: (_max: number) => "",
				maximum: (_max: number) => "",
				minimum: (_min: number) => "",
				exclusiveMinimum: (_min: number) => "",
				exclusiveMaximum: (_max: number) => "",
				multipleOf: (_f: number) => "",
				pattern: (_p: string) => "",
				invalidType: (_t: string) => "",
				invalidFormat: (_f: string) => "",
				invalidEnum: (_v: unknown[]) => "",
				minItems: (_m: number) => "",
				maxItems: (_m: number) => "",
				uniqueItems: "",
			}
		);
		expect(result?.message).toBe("Obligatoire");
	});
});
