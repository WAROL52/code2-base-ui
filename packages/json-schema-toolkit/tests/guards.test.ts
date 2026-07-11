import { describe, expect, it } from "vitest";
import {
	assertFieldMeta,
	isFieldArray,
	isFieldEnum,
	isFieldObject,
	isFieldPrimitive,
	isFieldUnion,
	isJsonSchema,
} from "../src/guards";
import type { FieldMeta } from "../src/types";

describe("field guards", () => {
	const primitiveField: FieldMeta = {
		path: "name",
		name: "name",
		type: "string",
		label: "Name",
		kind: "primitive",
	};

	const objectField: FieldMeta = {
		path: "address",
		name: "address",
		type: "object",
		label: "Address",
		kind: "object",
		children: [
			{
				path: "address.street",
				name: "street",
				type: "string",
				label: "Street",
				kind: "primitive",
			},
		],
	};

	const arrayField: FieldMeta = {
		path: "tags",
		name: "tags",
		type: "array",
		label: "Tags",
		kind: "array",
		itemMeta: {
			path: "tags[]",
			name: "items",
			type: "string",
			label: "Item",
			kind: "primitive",
		},
	};

	const enumField: FieldMeta = {
		path: "color",
		name: "color",
		type: "string",
		label: "Color",
		kind: "enum",
		enum: ["red", "green", "blue"],
	};

	const unionField: FieldMeta = {
		path: "contact",
		name: "contact",
		type: "object",
		label: "Contact",
		kind: "union",
		variants: [
			{
				label: "Email",
				meta: primitiveField,
				children: [],
			},
		],
	};

	describe("isFieldPrimitive", () => {
		it("returns true for primitive field", () => {
			expect(isFieldPrimitive(primitiveField)).toBe(true);
		});

		it("returns false for non-primitive field", () => {
			expect(isFieldPrimitive(objectField)).toBe(false);
		});
	});

	describe("isFieldObject", () => {
		it("returns true for object field with children", () => {
			expect(isFieldObject(objectField)).toBe(true);
		});

		it("returns false for object field without children", () => {
			const noChildren: FieldMeta = { ...objectField, children: undefined };
			expect(isFieldObject(noChildren)).toBe(false);
		});

		it("returns false for non-object field", () => {
			expect(isFieldObject(primitiveField)).toBe(false);
		});
	});

	describe("isFieldArray", () => {
		it("returns true for array field with itemMeta", () => {
			expect(isFieldArray(arrayField)).toBe(true);
		});

		it("returns false for array field without itemMeta", () => {
			const noItem: FieldMeta = { ...arrayField, itemMeta: undefined };
			expect(isFieldArray(noItem)).toBe(false);
		});

		it("returns false for non-array field", () => {
			expect(isFieldArray(primitiveField)).toBe(false);
		});
	});

	describe("isFieldEnum", () => {
		it("returns true for enum field with enum array", () => {
			expect(isFieldEnum(enumField)).toBe(true);
		});

		it("returns false for enum field without enum array", () => {
			const noEnum: FieldMeta = { ...enumField, enum: undefined };
			expect(isFieldEnum(noEnum)).toBe(false);
		});

		it("returns false for non-enum field", () => {
			expect(isFieldEnum(primitiveField)).toBe(false);
		});
	});

	describe("isFieldUnion", () => {
		it("returns true for union field with variants", () => {
			expect(isFieldUnion(unionField)).toBe(true);
		});

		it("returns false for union field without variants", () => {
			const noVariants: FieldMeta = { ...unionField, variants: undefined };
			expect(isFieldUnion(noVariants)).toBe(false);
		});

		it("returns false for non-union field", () => {
			expect(isFieldUnion(primitiveField)).toBe(false);
		});
	});

	describe("assertFieldMeta", () => {
		it("does not throw for valid FieldMeta", () => {
			expect(() => assertFieldMeta(primitiveField)).not.toThrow();
		});

		it("throws for null", () => {
			expect(() => assertFieldMeta(null)).toThrow(
				"Invalid FieldMeta: value must be an object"
			);
		});

		it("throws for missing path", () => {
			const invalid = { name: "test", type: "string" };
			expect(() => assertFieldMeta(invalid)).toThrow("missing path");
		});

		it("throws for missing name", () => {
			const invalid = { path: "test", type: "string" };
			expect(() => assertFieldMeta(invalid)).toThrow("missing name");
		});

		it("throws for unknown kind", () => {
			const invalid = { path: "t", name: "t", type: "string", kind: "invalid" };
			expect(() => assertFieldMeta(invalid)).toThrow('unknown kind "invalid"');
		});
	});

	describe("isJsonSchema", () => {
		it("returns true for object", () => {
			expect(isJsonSchema({ type: "string" })).toBe(true);
		});

		it("returns false for null", () => {
			expect(isJsonSchema(null)).toBe(false);
		});

		it("returns false for string", () => {
			expect(isJsonSchema("not a schema")).toBe(false);
		});
	});
});
