import { describe, expect, it } from "vitest";
import type { FieldError } from "../src/adapters/types";
import { createSchemaValidator } from "../src/validate";

function toObj(
	err: FieldError | undefined
): { message: string; type?: string } | undefined {
	if (!err) {
		return;
	}
	if (typeof err === "string") {
		return { message: err, type: "string" };
	}
	return err;
}

const stringSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		username: { type: "string", minLength: 3, maxLength: 20 },
		bio: { type: "string", maxLength: 200 },
		zipCode: { type: "string", pattern: "^[0-9]{5}$" },
		email: { type: "string", format: "email" },
	},
	required: ["username", "email"],
};

const numberSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		age: { type: "integer", minimum: 0, maximum: 150 },
		price: {
			type: "number",
			exclusiveMinimum: 0,
			exclusiveMaximum: 10_000,
		},
		score: { type: "number", multipleOf: 0.5 },
		quantity: { type: "integer", minimum: 1 },
	},
	required: ["age", "price"],
};

const choiceSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		agree: { type: "boolean" },
		role: {
			type: "string",
			enum: ["admin", "user", "moderator"],
		},
		status: { type: "integer", enum: [0, 1, 2] },
	},
	required: ["agree", "role"],
};

const arraySchema: Record<string, unknown> = {
	type: "object",
	properties: {
		tags: {
			type: "array",
			items: { type: "string" },
			minItems: 1,
			maxItems: 5,
		},
		nums: {
			type: "array",
			items: { type: "number" },
			minItems: 1,
			uniqueItems: true,
		},
	},
	required: ["tags"],
};

const mixedSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		name: { type: "string", minLength: 2 },
		email: { type: "string", format: "email" },
		age: { type: "integer", minimum: 18, maximum: 120 },
		role: { type: "string", enum: ["admin", "user"] },
		tags: {
			type: "array",
			items: { type: "string" },
			minItems: 1,
		},
		agree: { type: "boolean" },
	},
	required: ["name", "email", "agree"],
};

describe("createSchemaValidator", () => {
	describe("string constraints", () => {
		const validate = createSchemaValidator(stringSchema);

		it("requires required fields", () => {
			const errors = validate({
				username: "",
				email: "",
				bio: "",
				zipCode: "",
			});
			expect(toObj(errors.username)?.type).toBe("required");
			expect(toObj(errors.email)?.type).toBe("required");
		});

		it("validates minLength", () => {
			const errors = validate({
				username: "ab",
				email: "a@b.com",
				bio: "",
				zipCode: "12345",
			});
			expect(toObj(errors.username)?.type).toBe("minLength");
		});

		it("validates maxLength", () => {
			const errors = validate({
				username: "abc",
				email: "a@b.com",
				bio: "x".repeat(201),
				zipCode: "12345",
			});
			expect(toObj(errors.bio)?.type).toBe("maxLength");
		});

		it("validates pattern", () => {
			const errors = validate({
				username: "abc",
				email: "a@b.com",
				bio: "",
				zipCode: "abcde",
			});
			expect(toObj(errors.zipCode)?.type).toBe("pattern");
		});

		it("validates email format", () => {
			const errors = validate({
				username: "abc",
				email: "not-an-email",
				bio: "",
				zipCode: "12345",
			});
			expect(toObj(errors.email)?.type).toBe("format");
		});

		it("passes valid values", () => {
			const errors = validate({
				username: "john_doe",
				email: "john@example.com",
				bio: "A short bio",
				zipCode: "12345",
			});
			expect(Object.values(errors).filter(Boolean)).toHaveLength(0);
		});
	});

	describe("number constraints", () => {
		const validate = createSchemaValidator(numberSchema);

		it("requires required fields", () => {
			const errors = validate({ age: undefined, price: undefined });
			expect(toObj(errors.age)).toBeTruthy();
			expect(toObj(errors.price)).toBeTruthy();
		});

		it("validates minimum", () => {
			const errors = validate({
				age: -1,
				price: 5,
				score: 1,
				quantity: 5,
			});
			expect(toObj(errors.age)?.type).toBe("minimum");
		});

		it("validates maximum", () => {
			const errors = validate({
				age: 200,
				price: 5,
				score: 1,
				quantity: 5,
			});
			expect(toObj(errors.age)?.type).toBe("maximum");
		});

		it("validates exclusiveMinimum", () => {
			const errors = validate({
				age: 25,
				price: 0,
				score: 1,
				quantity: 5,
			});
			expect(toObj(errors.price)?.type).toBe("exclusiveMinimum");
		});

		it("validates exclusiveMaximum", () => {
			const errors = validate({
				age: 25,
				price: 10_000,
				score: 1,
				quantity: 5,
			});
			expect(toObj(errors.price)?.type).toBe("exclusiveMaximum");
		});

		it("validates multipleOf", () => {
			const errors = validate({
				age: 25,
				price: 5,
				score: 0.7,
				quantity: 5,
			});
			expect(toObj(errors.score)?.type).toBe("multipleOf");
		});

		it("validates type integer", () => {
			const errors = validate({
				age: 1.5,
				price: 5,
				score: 1,
				quantity: 5,
			});
			expect(toObj(errors.age)?.type).toBe("type");
		});

		it("passes valid numbers", () => {
			const errors = validate({
				age: 30,
				price: 50,
				score: 3,
				quantity: 10,
			});
			expect(Object.values(errors).filter(Boolean)).toHaveLength(0);
		});
	});

	describe("choice constraints", () => {
		const validate = createSchemaValidator(choiceSchema);

		it("validates enum values", () => {
			const errors = validate({
				agree: true,
				role: "superadmin",
				status: 1,
			});
			expect(toObj(errors.role)?.type).toBe("enum");
		});

		it("passes valid enum values", () => {
			const errors = validate({
				agree: true,
				role: "admin",
				status: 0,
			});
			expect(Object.values(errors).filter(Boolean)).toHaveLength(0);
		});
	});

	describe("array constraints", () => {
		const validate = createSchemaValidator(arraySchema);

		it("validates minItems", () => {
			const errors = validate({ tags: [], nums: [1] });
			expect(toObj(errors.tags)?.type).toBe("minItems");
		});

		it("validates maxItems", () => {
			const errors = validate({
				tags: ["a", "b", "c", "d", "e", "f"],
				nums: [1],
			});
			expect(toObj(errors.tags)?.type).toBe("maxItems");
		});

		it("validates uniqueItems", () => {
			const errors = validate({ tags: ["a"], nums: [1, 1] });
			expect(toObj(errors.nums)?.type).toBe("uniqueItems");
		});

		it("passes valid arrays", () => {
			const errors = validate({ tags: ["a", "b"], nums: [1, 2] });
			expect(Object.values(errors).filter(Boolean)).toHaveLength(0);
		});
	});

	describe("mixed constraints", () => {
		const validate = createSchemaValidator(mixedSchema);

		it("validates mixed constraints simultaneously", () => {
			const errors = validate({
				name: "",
				email: "bad",
				age: 10,
				role: "superadmin",
				tags: [],
				agree: undefined,
			});
			expect(toObj(errors.name)?.message).toBe("This field is required");
			expect(toObj(errors.email)?.message).toBe("Invalid format: email");
			expect(toObj(errors.age)?.message).toBe(
				"Must be greater than or equal to 18"
			);
			expect(toObj(errors.role)?.message).toBe("Must be one of: admin, user");
			expect(toObj(errors.tags)?.message).toBe("Must have at least 1 item(s)");
			expect(toObj(errors.agree)?.message).toBe("This field is required");
		});

		it("passes when all fields are valid", () => {
			const errors = validate({
				name: "John",
				email: "john@test.com",
				age: 25,
				role: "admin",
				tags: ["dev"],
				agree: true,
			});
			expect(Object.values(errors).filter(Boolean)).toHaveLength(0);
		});
	});
});
