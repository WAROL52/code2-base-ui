import { describe, expect, it } from "vitest";
import {
	getConstraints,
	getDefaultValue,
	getEnum,
	getKind,
	getLabel,
	getType,
	getUiOptions,
	inferTSType,
	isNullable,
} from "../src/schema-utils";

describe("getType", () => {
	it("returns explicit type", () => {
		expect(getType({ type: "string" })).toBe("string");
		expect(getType({ type: "number" })).toBe("number");
		expect(getType({ type: "boolean" })).toBe("boolean");
	});

	it("returns string when type missing but enum present", () => {
		expect(getType({ enum: ["a", "b"] })).toBe("string");
	});

	it("returns object when type missing but properties present", () => {
		expect(getType({ properties: { name: { type: "string" } } })).toBe(
			"object"
		);
	});

	it("returns array when type missing but items present", () => {
		expect(getType({ items: { type: "string" } })).toBe("array");
	});

	it("returns string as fallback", () => {
		expect(getType({})).toBe("string");
	});

	it("extracts non-null type from array", () => {
		expect(getType({ type: ["string", "null"] })).toBe("string");
	});

	it("handles array type with only null", () => {
		expect(getType({ type: ["null"] })).toBe("null");
	});
});

describe("getKind", () => {
	it("returns union for oneOf > 1", () => {
		expect(getKind({ oneOf: [{ type: "string" }, { type: "number" }] })).toBe(
			"union"
		);
	});

	it("returns union for anyOf > 1", () => {
		expect(getKind({ anyOf: [{ type: "string" }, { type: "number" }] })).toBe(
			"union"
		);
	});

	it("returns enum for schema with enum", () => {
		expect(getKind({ type: "string", enum: ["a", "b"] })).toBe("enum");
	});

	it("returns object for object type", () => {
		expect(getKind({ type: "object" })).toBe("object");
	});

	it("returns array for array type", () => {
		expect(getKind({ type: "array" })).toBe("array");
	});

	it("returns primitive for scalar types", () => {
		expect(getKind({ type: "string" })).toBe("primitive");
		expect(getKind({ type: "number" })).toBe("primitive");
		expect(getKind({ type: "boolean" })).toBe("primitive");
	});

	it("prefers oneOf over enum", () => {
		expect(
			getKind({
				enum: ["a", "b"],
				oneOf: [{ type: "string" }, { type: "number" }],
			})
		).toBe("union");
	});
});

describe("getLabel", () => {
	it("returns x-ui-label when present", () => {
		expect(getLabel({ type: "string", "x-ui-label": "Custom" }, "name")).toBe(
			"Custom"
		);
	});

	it("returns title when present", () => {
		expect(getLabel({ type: "string", title: "Full Name" }, "name")).toBe(
			"Full Name"
		);
	});

	it("prefers x-ui-label over title", () => {
		expect(
			getLabel(
				{ type: "string", title: "Title", "x-ui-label": "Custom" },
				"name"
			)
		).toBe("Custom");
	});

	it("generates label from name", () => {
		expect(getLabel({ type: "string" }, "firstName")).toBe("First Name");
		expect(getLabel({ type: "string" }, "last_name")).toBe("Last Name");
	});
});

describe("getEnum", () => {
	it("returns schema.enum when present", () => {
		expect(getEnum({ enum: ["a", "b"] })).toEqual(["a", "b"]);
	});

	it("returns const wrapped in array", () => {
		expect(getEnum({ const: "hello" })).toEqual(["hello"]);
	});

	it("returns undefined when no enum or const", () => {
		expect(getEnum({ type: "string" })).toBeUndefined();
	});
});

describe("getDefaultValue", () => {
	it("returns default value", () => {
		expect(getDefaultValue({ default: 42 })).toBe(42);
	});

	it("returns undefined when no default", () => {
		expect(getDefaultValue({ type: "string" })).toBeUndefined();
	});
});

describe("getConstraints", () => {
	it("returns string constraints", () => {
		const constraints = getConstraints({
			minLength: 2,
			maxLength: 10,
			pattern: "^[a-z]+$",
		});
		expect(constraints).toEqual({
			minLength: 2,
			maxLength: 10,
			pattern: "^[a-z]+$",
		});
	});

	it("returns number constraints", () => {
		const constraints = getConstraints({
			minimum: 0,
			maximum: 100,
			multipleOf: 5,
		});
		expect(constraints).toEqual({ minimum: 0, maximum: 100, multipleOf: 5 });
	});

	it("returns exclusive number constraints", () => {
		const constraints = getConstraints({
			exclusiveMinimum: 0,
			exclusiveMaximum: 100,
		});
		expect(constraints).toEqual({ exclusiveMinimum: 0, exclusiveMaximum: 100 });
	});

	it("returns array constraints", () => {
		const constraints = getConstraints({
			minItems: 1,
			maxItems: 5,
			uniqueItems: true,
		});
		expect(constraints).toEqual({
			minItems: 1,
			maxItems: 5,
			uniqueItems: true,
		});
	});

	it("returns undefined when no constraints", () => {
		expect(getConstraints({})).toBeUndefined();
	});
});

describe("getUiOptions", () => {
	it("extracts all x-ui-* options", () => {
		const options = getUiOptions({
			"x-ui-widget": "textarea",
			"x-ui-hidden": true,
			"x-ui-readonly": true,
			"x-ui-order": 2,
			placeholder: "Enter text...",
		});
		expect(options).toEqual({
			widget: "textarea",
			hidden: true,
			readonly: true,
			order: 2,
			placeholder: "Enter text...",
		});
	});

	it("returns defaults for empty schema", () => {
		const options = getUiOptions({});
		expect(options).toEqual({
			widget: undefined,
			hidden: undefined,
			readonly: undefined,
			order: undefined,
			placeholder: undefined,
		});
	});
});

describe("inferTSType", () => {
	it("returns string", () => {
		expect(inferTSType({ type: "string" })).toBe("string");
	});

	it("returns number for number and integer", () => {
		expect(inferTSType({ type: "number" })).toBe("number");
		expect(inferTSType({ type: "integer" })).toBe("number");
	});

	it("returns boolean", () => {
		expect(inferTSType({ type: "boolean" })).toBe("boolean");
	});

	it("returns null", () => {
		expect(inferTSType({ type: "null" })).toBe("null");
	});

	it("returns union for enum", () => {
		expect(inferTSType({ enum: ["a", "b"] })).toBe('"a" | "b"');
	});

	it("returns const value", () => {
		expect(inferTSType({ const: 42 })).toBe("42");
	});

	it("returns Record for object without properties", () => {
		expect(inferTSType({ type: "object" })).toBe("Record<string, unknown>");
	});

	it("returns typed object", () => {
		const result = inferTSType({
			type: "object",
			properties: { name: { type: "string" } },
			required: ["name"],
		});
		expect(result).toContain("name");
	});

	it("returns typed array", () => {
		expect(inferTSType({ type: "array", items: { type: "string" } })).toBe(
			"string[]"
		);
	});

	it("returns unknown[] for array without items", () => {
		expect(inferTSType({ type: "array" })).toBe("unknown[]");
	});

	it("returns unknown for unsupported types", () => {
		expect(inferTSType({ type: "string", format: "binary" })).toBe("string");
	});
});

describe("isNullable", () => {
	it("returns true when type array includes null", () => {
		expect(isNullable({ type: ["string", "null"] })).toBe(true);
	});

	it("returns false when type array does not include null", () => {
		expect(isNullable({ type: ["string", "number"] })).toBe(false);
	});

	it("returns true when anyOf includes null", () => {
		expect(isNullable({ anyOf: [{ type: "string" }, { type: "null" }] })).toBe(
			true
		);
	});

	it("returns false for plain type", () => {
		expect(isNullable({ type: "string" })).toBe(false);
	});
});
