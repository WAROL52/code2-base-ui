import { describe, expect, it } from "vitest";
import type { JsonSchema } from "../../src/types";
import { entries } from "../../src/utils/entries";

describe("entries", () => {
	it("returns empty array for empty schema", () => {
		expect(entries({ type: "object" })).toEqual([]);
	});

	it("returns key-value pairs for each property", () => {
		const schema: JsonSchema = {
			type: "object",
			properties: {
				name: { type: "string" },
				age: { type: "number" },
			},
		};
		const result = entries(schema);
		expect(result).toHaveLength(2);
		expect(result[0]?.[0]).toBe("name");
		expect(result[0]?.[1].type).toBe("string");
		expect(result[1]?.[0]).toBe("age");
	});
});
