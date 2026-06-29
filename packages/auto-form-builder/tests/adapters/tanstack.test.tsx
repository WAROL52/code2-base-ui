import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { tanstackAdapter } from "../../src/adapters/tanstack";

describe("tanstackAdapter", () => {
	it("has name 'tanstack'", () => {
		expect(tanstackAdapter.name).toBe("tanstack");
	});

	it("FormProvider provides formAPI to children", () => {
		let capturedForm: any = null;
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "" }}>
				{(formAPI) => {
					capturedForm = formAPI;
					return <div data-testid="form">{JSON.stringify(formAPI.values)}</div>;
				}}
			</tanstackAdapter.FormProvider>
		);
		expect(capturedForm).not.toBeNull();
		expect(typeof capturedForm.handleSubmit).toBe("function");
		expect(typeof capturedForm.reset).toBe("function");
		expect(capturedForm.isSubmitting).toBe(false);
	});

	it("Field reads value from form state", () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
				{(_formAPI) => (
					<tanstackAdapter.Field name="name">
						{(field) => (
							<input
								data-testid="input"
								value={field.value as string}
								onChange={() => {}}
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
								value={field.value as string}
								onChange={(e) => field.onChange(e.target.value)}
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
