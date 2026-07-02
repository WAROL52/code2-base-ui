import { describe, expect, it } from "vitest";
import type { FieldMeta } from "../../src/types";
import { fromEntries } from "../../src/utils/from-entries";

describe("fromEntries", () => {
	it("reconstructs a simple schema", () => {
		const input: [string, FieldMeta][] = [
			["name", { path: "name", type: "string", label: "Name" }],
			["age", { path: "age", type: "number", label: "Age" }],
		];
		const result = fromEntries(input);
		expect(result.type).toBe("object");
		expect(result.properties?.name?.type).toBe("string");
		expect(result.properties?.age?.type).toBe("number");
	});
});
