import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { tanstackAdapter } from "../../src/adapters/tanstack";
import type { FormAPI } from "../../src/adapters/types";

describe("tanstackAdapter", () => {
	it("has name 'tanstack'", () => {
		expect(tanstackAdapter.name).toBe("tanstack");
	});

	it("FormProvider provides formAPI to children", () => {
		let capturedForm: FormAPI | null = null;
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "" }}>
				{(formAPI) => {
					capturedForm = formAPI;
					return <div data-testid="form">{JSON.stringify(formAPI.values)}</div>;
				}}
			</tanstackAdapter.FormProvider>
		);
		expect(capturedForm).not.toBeNull();
		const form = capturedForm as unknown as FormAPI;
		expect(typeof form.handleSubmit).toBe("function");
		expect(typeof form.reset).toBe("function");
		expect(form.isSubmitting).toBe(false);
	});
	it("Field reads value from form state", () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
				{(_formAPI) => (
					<tanstackAdapter.Field name="name">
						{(field) => (
							<input
								data-testid="input"
								onChange={vi.fn()}
								value={field.value as string}
							/>
						)}
					</tanstackAdapter.Field>
				)}
			</tanstackAdapter.FormProvider>
		);
		const input = screen.getByTestId("input") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("Field.onChange updates form state", () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "" }}>
				{(_formAPI) => (
					<tanstackAdapter.Field name="name">
						{(field) => (
							<input
								data-testid="input"
								onChange={(e) => field.onChange(e.target.value)}
								value={field.value as string}
							/>
						)}
					</tanstackAdapter.Field>
				)}
			</tanstackAdapter.FormProvider>
		);
		const input = screen.getByTestId("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "Jane" } });
		expect(input.value).toBe("Jane");
	});
});
