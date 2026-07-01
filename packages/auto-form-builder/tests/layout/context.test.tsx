import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFormLayout } from "../../src/layout/context";

function LayoutUser() {
	useFormLayout();
	return null;
}

describe("useFormLayout", () => {
	it("throws when no FormLayoutCtx.Provider is present", () => {
		expect(() => render(<LayoutUser />)).toThrow(
			"useFormLayout: no FormLayout found in context"
		);
	});
});
