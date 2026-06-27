import { describe, it, expect, expectTypeOf } from "vitest";
import { flatfields } from "../../src/utils/flatfields";
import type { FieldMeta, JsonSchema } from "../../src/types";

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
