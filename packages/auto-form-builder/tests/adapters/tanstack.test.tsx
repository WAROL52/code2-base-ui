import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { tanstackAdapter } from "../../src/adapters/tanstack";

describe("tanstackAdapter", () => {
	it("has name 'tanstack'", () => {
		expect(tanstackAdapter.name).toBe("tanstack");
	});

	it("FormProvider provides formAPI to children", () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "" }}>
				{(formAPI) => {
					expect(typeof formAPI.handleSubmit).toBe("function");
					expect(typeof formAPI.reset).toBe("function");
					expect(formAPI.isSubmitting).toBe(false);
					return <div data-testid="form">{JSON.stringify(formAPI.values)}</div>;
				}}
			</tanstackAdapter.FormProvider>
		);
	});

	it("handleSubmit calls tanstack form.handleSubmit", async () => {
		const onSubmit = vi.fn();
		render(
			<tanstackAdapter.FormProvider
				defaultValues={{ name: "" }}
				onSubmit={onSubmit}
			>
				{(formAPI) => (
					<div>
						<button
							data-testid="submit-btn"
							onClick={() => formAPI.handleSubmit()}
							type="button"
						>
							Submit
						</button>
					</div>
				)}
			</tanstackAdapter.FormProvider>
		);
		fireEvent.click(screen.getByTestId("submit-btn"));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalled();
		});
	});

	it("reset clears form values", () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "John" }}>
				{(formAPI) => (
					<div>
						<tanstackAdapter.Field name="name">
							{(field) => (
								<input
									data-testid="input"
									onChange={(e) => field.onChange(e.target.value)}
									value={field.value as string}
								/>
							)}
						</tanstackAdapter.Field>
						<button
							data-testid="reset-btn"
							onClick={() => formAPI.reset()}
							type="button"
						>
							Reset
						</button>
					</div>
				)}
			</tanstackAdapter.FormProvider>
		);
		const input = screen.getByTestId("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "Jane" } });
		expect(input.value).toBe("Jane");
		fireEvent.click(screen.getByTestId("reset-btn"));
		expect(input.value).toBe("John");
	});

	it("appendFieldValue adds an item to an array field", async () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ tags: [] }}>
				{(formAPI) => (
					<div>
						<button
							data-testid="append-btn"
							onClick={() => formAPI.appendFieldValue("tags", "new-tag")}
							type="button"
						>
							Append
						</button>
						<tanstackAdapter.Field name="tags">
							{(field) => (
								<span data-testid="tag-count">
									{String((field.value as string[])?.length ?? 0)}
								</span>
							)}
						</tanstackAdapter.Field>
					</div>
				)}
			</tanstackAdapter.FormProvider>
		);
		expect(screen.getByTestId("tag-count").textContent).toBe("0");
		fireEvent.click(screen.getByTestId("append-btn"));
		await waitFor(() => {
			expect(screen.getByTestId("tag-count").textContent).toBe("1");
		});
	});

	it("removeFieldValue removes an item from an array field", async () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ tags: ["a", "b"] }}>
				{(formAPI) => (
					<div>
						<button
							data-testid="remove-btn"
							onClick={() => formAPI.removeFieldValue("tags", 0)}
							type="button"
						>
							Remove
						</button>
						<tanstackAdapter.Field name="tags">
							{(field) => (
								<span data-testid="tag-count">
									{String((field.value as string[])?.length ?? 0)}
								</span>
							)}
						</tanstackAdapter.Field>
					</div>
				)}
			</tanstackAdapter.FormProvider>
		);
		expect(screen.getByTestId("tag-count").textContent).toBe("2");
		fireEvent.click(screen.getByTestId("remove-btn"));
		await waitFor(() => {
			expect(screen.getByTestId("tag-count").textContent).toBe("1");
		});
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

	it("Field provides error, isTouched, and onBlur", () => {
		render(
			<tanstackAdapter.FormProvider defaultValues={{ name: "" }}>
				{(_formAPI) => (
					<tanstackAdapter.Field name="name">
						{(field) => (
							<div>
								<input
									data-testid="input"
									onBlur={() => field.onBlur()}
									onChange={vi.fn()}
									value={field.value as string}
								/>
								<span data-testid="error">{String(field.error ?? "")}</span>
								<span data-testid="touched">{String(field.isTouched)}</span>
							</div>
						)}
					</tanstackAdapter.Field>
				)}
			</tanstackAdapter.FormProvider>
		);
		expect(screen.getByTestId("error").textContent).toBe("");
		expect(screen.getByTestId("touched").textContent).toBe("false");
		fireEvent.blur(screen.getByTestId("input"));
		expect(screen.getByTestId("touched").textContent).toBe("true");
	});

	it("throws when Field is rendered outside FormProvider", () => {
		expect(() =>
			render(
				<tanstackAdapter.Field name="name">
					{() => <div />}
				</tanstackAdapter.Field>
			)
		).toThrow("tanstackAdapter: missing FormProvider");
	});
});
