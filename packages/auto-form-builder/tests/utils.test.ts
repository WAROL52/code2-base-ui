import { describe, expect, it } from "vitest";
import { toErrorString } from "../src/utils";

describe("toErrorString", () => {
	it("returns the message from a structured FieldError", () => {
		const result = toErrorString({ message: "Invalid email", type: "format" });
		expect(result).toBe("Invalid email");
	});

	it("returns undefined when error is undefined", () => {
		const result = toErrorString(undefined);
		expect(result).toBeUndefined();
	});

	it("returns the string when error is a string", () => {
		const result = toErrorString("Required");
		expect(result).toBe("Required");
	});
});
