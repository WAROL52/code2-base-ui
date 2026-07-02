import { describe, expect, expectTypeOf, it } from "vitest";
import type { FieldMeta, JsonSchema } from "../../src/types";
import { flatfields } from "../../src/utils/flatfields";

describe("flatfields types", () => {
	it("returns FieldMeta array", () => {
		type Result = ReturnType<typeof flatfields>;
		expectTypeOf<Result>().toMatchTypeOf<FieldMeta[]>();
	});
});

describe("flatfields", () => {
	it("returns empty array for schema without properties", () => {
		expect(flatfields({ type: "string" })).toEqual([]);
	});

	it("flattens top-level fields", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				name: { type: "string" },
				age: { type: "number" },
			},
			required: ["name"],
		};
		const result = flatfields(schema);
		expect(result).toHaveLength(2);
		expect(result[0]?.path).toBe("name");
		expect(result[0]?.type).toBe("string");
		expect(result[0]?.required).toBe(true);
		expect(result[1]?.path).toBe("age");
		expect(result[1]?.required).toBe(false);
	});

	it("flattens nested fields with dot notation", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				user: {
					type: "object",
					properties: {
						name: { type: "string" },
						address: {
							type: "object",
							properties: {
								city: { type: "string" },
							},
						},
					},
				},
			},
		};
		const result = flatfields(schema);
		expect(result).toHaveLength(4);
		expect(result.map((f) => f.path)).toEqual([
			"user",
			"user.name",
			"user.address",
			"user.address.city",
		]);
	});

	it("derives label from title when present", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				email: {
					type: "string",
					title: "Email Address",
				},
			},
		};
		const result = flatfields(schema);
		expect(result[0]?.label).toBe("Email Address");
	});

	it("falls back to humanized path when no title", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				email_address: { type: "string" },
			},
		};
		const result = flatfields(schema);
		expect(result[0]?.label).toBe("Email Address");
	});

	it("sets uiWidget to select for enum fields", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				role: {
					type: "string",
					enum: ["admin", "user"],
				},
			},
		};
		const result = flatfields(schema);
		expect(result[0]?.uiWidget).toBe("select");
		expect(result[0]?.enum).toEqual(["admin", "user"]);
	});

	it("does not override explicit widget with enum auto-detect", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				tags: {
					type: "string",
					enum: ["a", "b", "c"],
					widget: "radio",
				},
			},
		};
		const result = flatfields(schema);
		expect(result[0]?.uiWidget).toBe("radio");
	});

	it("keeps description separate from label", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				name: {
					type: "string",
					title: "Full Name",
					description: "Enter your legal full name",
				},
			},
		};
		const result = flatfields(schema);
		expect(result[0]?.label).toBe("Full Name");
		expect(result[0]?.description).toBe("Enter your legal full name");
	});

	it("includes format, description, default, enum", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				email: {
					type: "string",
					format: "email",
					description: "User email",
					default: "test@example.com",
				},
				role: {
					type: "string",
					enum: ["admin", "user"],
				},
			},
		};
		const result = flatfields(schema);
		expect(result[0]?.format).toBe("email");
		expect(result[0]?.description).toBe("User email");
		expect(result[0]?.defaultValue).toBe("test@example.com");
		expect(result[1]?.enum).toEqual(["admin", "user"]);
	});
});
