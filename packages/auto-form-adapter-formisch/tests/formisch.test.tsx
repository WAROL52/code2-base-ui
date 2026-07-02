import type { FormAPI } from "@code2-base-ui/auto-form-builder";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { formischAdapter } from "../src/formisch";

describe("formischAdapter", () => {
	it("has name 'formisch'", () => {
		expect(formischAdapter.name).toBe("formisch");
	});

	it("FormProvider provides formAPI to children", () => {
		let capturedForm: FormAPI | null = null;
		render(
			<formischAdapter.FormProvider defaultValues={{ name: "" }}>
				{(formAPI) => {
					capturedForm = formAPI;
					return <div data-testid="form">{JSON.stringify(formAPI.values)}</div>;
				}}
			</formischAdapter.FormProvider>
		);
		expect(capturedForm).not.toBeNull();
		const form = capturedForm as unknown as FormAPI;
		expect(typeof form.handleSubmit).toBe("function");
		expect(typeof form.reset).toBe("function");
	});

	it("Field reads value from form state", () => {
		render(
			<formischAdapter.FormProvider defaultValues={{ name: "John" }}>
				{(_formAPI) => (
					<formischAdapter.Field name="name">
						{(field) => (
							<input
								data-testid="input"
								onChange={vi.fn()}
								value={field.value as string}
							/>
						)}
					</formischAdapter.Field>
				)}
			</formischAdapter.FormProvider>
		);
		const input = screen.getByTestId("input") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("Field.onChange updates form state", () => {
		render(
			<formischAdapter.FormProvider defaultValues={{ name: "" }}>
				{(_formAPI) => (
					<formischAdapter.Field name="name">
						{(field) => (
							<input
								data-testid="input"
								onChange={(e) => field.onChange(e.target.value)}
								value={field.value as string}
							/>
						)}
					</formischAdapter.Field>
				)}
			</formischAdapter.FormProvider>
		);
		const input = screen.getByTestId("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "Jane" } });
		expect(input.value).toBe("Jane");
	});

	it("Field provides onBlur", () => {
		render(
			<formischAdapter.FormProvider defaultValues={{ name: "" }}>
				{(_formAPI) => (
					<formischAdapter.Field name="name">
						{(field) => (
							<div>
								<input
									data-testid="input"
									onBlur={() => field.onBlur()}
									onChange={vi.fn()}
									value={field.value as string}
								/>
							</div>
						)}
					</formischAdapter.Field>
				)}
			</formischAdapter.FormProvider>
		);
		expect(() => {
			fireEvent.blur(screen.getByTestId("input"));
		}).not.toThrow();
	});

	it("throws when Field is rendered outside FormProvider", () => {
		expect(() =>
			render(
				<formischAdapter.Field name="name">
					{() => <div />}
				</formischAdapter.Field>
			)
		).toThrow("formischAdapter: missing FormProvider");
	});
});
