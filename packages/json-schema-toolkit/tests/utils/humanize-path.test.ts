import { describe, it, expect } from "vitest";
import { humanizePath } from "../../src/utils/humanize-path";

describe("humanizePath", () => {
	it("capitalizes a simple camelCase word", () => {
		expect(humanizePath("name")).toBe("Name");
	});

	it("splits camelCase boundaries", () => {
		expect(humanizePath("fullName")).toBe("Full Name");
	});

	it("splits snake_case", () => {
		expect(humanizePath("email_address")).toBe("Email Address");
	});

	it("handles combined camelCase + snake_case", () => {
		expect(humanizePath("shippingAddressStreet")).toBe("Shipping Address Street");
	});

	it("handles multiple underscores", () => {
		expect(humanizePath("primary_email_address")).toBe("Primary Email Address");
	});

	it("handles single lowercase word", () => {
		expect(humanizePath("x")).toBe("X");
	});
});
