import { describe, expect, it } from "vitest";
import type { JsonSchema } from "../../src/types";
import { validateSchema } from "../../src/utils/validate-schema";

describe("validateSchema", () => {
	it("validates a correct object", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				name: { type: "string" },
			},
		};
		const result = validateSchema(schema, { name: "Alice" });
		expect(result.success).toBe(true);
	});

	it("rejects invalid data", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				age: { type: "number" },
			},
		};
		const result = validateSchema(schema, { age: "not-a-number" });
		expect(result.success).toBe(false);
	});
});
