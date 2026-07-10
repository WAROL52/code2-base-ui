import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { formischAdapter } from "../../src/adapters/formisch";

describe("formischAdapter", () => {
	it("has name 'formisch'", () => {
		expect(formischAdapter.name).toBe("formisch");
	});

	it("FormProvider provides formAPI to children", () => {
		render(
			<formischAdapter.FormProvider defaultValues={{ name: "" }}>
				{(formAPI) => {
					expect(typeof formAPI.handleSubmit).toBe("function");
					expect(typeof formAPI.reset).toBe("function");
					return <div data-testid="form">{JSON.stringify(formAPI.values)}</div>;
				}}
			</formischAdapter.FormProvider>
		);
	});

	it("isSubmitting is initially false", () => {
		render(
			<formischAdapter.FormProvider defaultValues={{ name: "" }}>
				{(formAPI) => {
					expect(formAPI.isSubmitting).toBe(false);
					return null;
				}}
			</formischAdapter.FormProvider>
		);
	});

	it("handleSubmit calls onSubmit with form values", async () => {
		const onSubmit = vi.fn();
		render(
			<formischAdapter.FormProvider
				defaultValues={{ name: "John" }}
				onSubmit={onSubmit}
			>
				{(formAPI) => (
					<button
						data-testid="submit-btn"
						onClick={() => formAPI.handleSubmit()}
						type="button"
					>
						Submit
					</button>
				)}
			</formischAdapter.FormProvider>
		);
		fireEvent.click(screen.getByTestId("submit-btn"));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalled();
		});
	});

	it("Field isTouched is initially false", () => {
		render(
			<formischAdapter.FormProvider defaultValues={{ name: "" }}>
				{(_formAPI) => (
					<formischAdapter.Field name="name">
						{(field) => (
							<span data-testid="touched">{String(field.isTouched)}</span>
						)}
					</formischAdapter.Field>
				)}
			</formischAdapter.FormProvider>
		);
		expect(screen.getByTestId("touched").textContent).toBe("false");
	});

	it("Field isTouched becomes true on blur", () => {
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
								<span data-testid="touched">{String(field.isTouched)}</span>
							</div>
						)}
					</formischAdapter.Field>
				)}
			</formischAdapter.FormProvider>
		);
		expect(screen.getByTestId("touched").textContent).toBe("false");
		fireEvent.blur(screen.getByTestId("input"));
		expect(screen.getByTestId("touched").textContent).toBe("true");
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
