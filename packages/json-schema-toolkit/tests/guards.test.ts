import { describe, expect, it } from "vitest";
import { FieldGuard } from "../src/guards";
import type { FieldMeta, VariantField } from "../src/types";

describe("FieldGuard", () => {
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
			{ path: "address.street", name: "street", type: "string", label: "Street", kind: "primitive" },
		],
	};

	const arrayField: FieldMeta = {
		path: "tags",
		name: "tags",
		type: "array",
		label: "Tags",
		kind: "array",
		itemMeta: { path: "tags[]", name: "items", type: "string", label: "Item", kind: "primitive" },
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
			expect(FieldGuard.isFieldPrimitive(primitiveField)).toBe(true);
		});

		it("returns false for non-primitive field", () => {
			expect(FieldGuard.isFieldPrimitive(objectField)).toBe(false);
		});
	});

	describe("isFieldObject", () => {
		it("returns true for object field with children", () => {
			expect(FieldGuard.isFieldObject(objectField)).toBe(true);
		});

		it("returns false for object field without children", () => {
			const noChildren: FieldMeta = { ...objectField, children: undefined };
			expect(FieldGuard.isFieldObject(noChildren)).toBe(false);
		});

		it("returns false for non-object field", () => {
			expect(FieldGuard.isFieldObject(primitiveField)).toBe(false);
		});
	});

	describe("isFieldArray", () => {
		it("returns true for array field with itemMeta", () => {
			expect(FieldGuard.isFieldArray(arrayField)).toBe(true);
		});

		it("returns false for array field without itemMeta", () => {
			const noItem: FieldMeta = { ...arrayField, itemMeta: undefined };
			expect(FieldGuard.isFieldArray(noItem)).toBe(false);
		});

		it("returns false for non-array field", () => {
			expect(FieldGuard.isFieldArray(primitiveField)).toBe(false);
		});
	});

	describe("isFieldEnum", () => {
		it("returns true for enum field with enum array", () => {
			expect(FieldGuard.isFieldEnum(enumField)).toBe(true);
		});

		it("returns false for enum field without enum array", () => {
			const noEnum: FieldMeta = { ...enumField, enum: undefined };
			expect(FieldGuard.isFieldEnum(noEnum)).toBe(false);
		});

		it("returns false for non-enum field", () => {
			expect(FieldGuard.isFieldEnum(primitiveField)).toBe(false);
		});
	});

	describe("isFieldUnion", () => {
		it("returns true for union field with variants", () => {
			expect(FieldGuard.isFieldUnion(unionField)).toBe(true);
		});

		it("returns false for union field without variants", () => {
			const noVariants: FieldMeta = { ...unionField, variants: undefined };
			expect(FieldGuard.isFieldUnion(noVariants)).toBe(false);
		});

		it("returns false for non-union field", () => {
			expect(FieldGuard.isFieldUnion(primitiveField)).toBe(false);
		});
	});

	describe("assertFieldMeta", () => {
		it("does not throw for valid FieldMeta", () => {
			expect(() => FieldGuard.assertFieldMeta(primitiveField)).not.toThrow();
		});

		it("throws for null", () => {
			expect(() => FieldGuard.assertFieldMeta(null)).toThrow("Invalid FieldMeta: value must be an object");
		});

		it("throws for missing path", () => {
			const invalid = { name: "test", type: "string" };
			expect(() => FieldGuard.assertFieldMeta(invalid)).toThrow("missing path");
		});

		it("throws for missing name", () => {
			const invalid = { path: "test", type: "string" };
			expect(() => FieldGuard.assertFieldMeta(invalid)).toThrow("missing name");
		});

		it("throws for unknown kind", () => {
			const invalid = { path: "t", name: "t", type: "string", kind: "invalid" };
			expect(() => FieldGuard.assertFieldMeta(invalid)).toThrow('unknown kind "invalid"');
		});
	});

	describe("isJsonSchema", () => {
		it("returns true for object", () => {
			expect(FieldGuard.isJsonSchema({ type: "string" })).toBe(true);
		});

		it("returns false for null", () => {
			expect(FieldGuard.isJsonSchema(null)).toBe(false);
		});

		it("returns false for string", () => {
			expect(FieldGuard.isJsonSchema("not a schema")).toBe(false);
		});
	});
});
