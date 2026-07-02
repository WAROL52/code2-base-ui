import { describe, expect, it } from "vitest";
import type { JsonSchema } from "../../src/types";
import { groupBy } from "../../src/utils/group-by";

describe("groupBy", () => {
	const schema: JsonSchema = {
		type: "object",
		properties: {
			name: { type: "string" },
			email: { type: "string", format: "email" },
			age: { type: "number" },
		},
	};

	it("groups by type", () => {
		const result = groupBy(schema, { by: "type" });
		expect(result.string).toHaveLength(2);
		expect(result.number).toHaveLength(1);
	});

	it("groups by required", () => {
		const result = groupBy(schema, { by: "required" });
		expect(result.false).toBeDefined();
	});

	it("groups by format", () => {
		const result = groupBy(schema, { by: "format" });
		expect(result.email).toHaveLength(1);
		expect(result.undefined).toBeDefined();
	});

	it("groups by custom function", () => {
		const result = groupBy(schema, {
			by: (field) => `size_${field.type === "string" ? "large" : "small"}`,
		});
		expect(result.size_large).toHaveLength(2);
		expect(result.size_small).toHaveLength(1);
	});
});
