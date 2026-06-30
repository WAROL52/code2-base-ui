import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { shadcnLayout } from "../../src/layout/shadcn";

describe("shadcnLayout", () => {
	it("renders FieldSet with tag and children", () => {
		const { container } = render(
			<shadcnLayout.FieldSet className="test-class">
				<div data-testid="child">inside</div>
			</shadcnLayout.FieldSet>
		);
		expect(container.querySelector("fieldset")).toBeTruthy();
		expect(container.querySelector(".test-class")).toBeTruthy();
	});

	it("renders FieldGroup with children", () => {
		const { container } = render(
			<shadcnLayout.FieldGroup>
				<div data-testid="child" />
			</shadcnLayout.FieldGroup>
		);
		expect(container.querySelector("div")).toBeTruthy();
	});

	it("renders ObjectField with label, description, and children", () => {
		const fieldMeta: FieldMeta = {
			path: "address",
			type: "object",
			label: "Address",
			description: "Your postal address",
			kind: "object",
			children: [],
		};
		const { container } = render(
			<shadcnLayout.ObjectField fieldMeta={fieldMeta}>
				<div data-testid="child" />
			</shadcnLayout.ObjectField>
		);
		expect(container.textContent).toContain("Address");
		expect(container.textContent).toContain("Your postal address");
		expect(container.querySelector("fieldset")).toBeTruthy();
	});

	it("renders ObjectField without label or description", () => {
		const fieldMeta: FieldMeta = {
			path: "inner",
			type: "object",
			label: "",
			kind: "object",
			children: [],
		};
		const { container } = render(
			<shadcnLayout.ObjectField fieldMeta={fieldMeta}>
				<span>content</span>
			</shadcnLayout.ObjectField>
		);
		expect(container.textContent).not.toContain("legend");
		expect(container.textContent).toContain("content");
	});

	it("renders FieldLegend with text", () => {
		const { container } = render(
			<shadcnLayout.FieldLegend>Title</shadcnLayout.FieldLegend>
		);
		expect(container.textContent).toBe("Title");
	});

	it("renders FieldDescription with text", () => {
		const { container } = render(
			<shadcnLayout.FieldDescription>Help text</shadcnLayout.FieldDescription>
		);
		expect(container.textContent).toBe("Help text");
	});

	it("renders SubmitButton with default text", () => {
		const { container } = render(<shadcnLayout.SubmitButton />);
		const btn = container.querySelector("button[type='submit']");
		expect(btn).toBeTruthy();
		expect(btn?.textContent).toBe("Envoyer");
	});

	it("renders SubmitButton with custom children", () => {
		const { container } = render(
			<shadcnLayout.SubmitButton>Save</shadcnLayout.SubmitButton>
		);
		expect(container.querySelector("button")?.textContent).toBe("Save");
	});
});
