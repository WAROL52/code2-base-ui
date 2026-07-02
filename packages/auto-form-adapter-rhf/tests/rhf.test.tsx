import type { FormAPI } from "@code2-base-ui/auto-form-builder";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { rhfAdapter } from "../src/rhf";

describe("rhfAdapter", () => {
	it("has name 'rhf'", () => {
		expect(rhfAdapter.name).toBe("rhf");
	});

	it("FormProvider provides formAPI to children", () => {
		let capturedForm: FormAPI | null = null;
		render(
			<rhfAdapter.FormProvider defaultValues={{ name: "" }}>
				{(formAPI) => {
					capturedForm = formAPI;
					return <div data-testid="form">{JSON.stringify(formAPI.values)}</div>;
				}}
			</rhfAdapter.FormProvider>
		);
		expect(capturedForm).not.toBeNull();
		const form = capturedForm as unknown as FormAPI;
		expect(typeof form.handleSubmit).toBe("function");
		expect(typeof form.reset).toBe("function");
		expect(form.isSubmitting).toBe(false);
	});

	it("handleSubmit calls onSubmit with form values", async () => {
		const onSubmit = vi.fn();
		render(
			<rhfAdapter.FormProvider
				defaultValues={{ name: "John" }}
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
			</rhfAdapter.FormProvider>
		);
		fireEvent.click(screen.getByTestId("submit-btn"));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({ name: "John" });
		});
	});

	it("reset clears form values to default", () => {
		render(
			<rhfAdapter.FormProvider defaultValues={{ name: "John" }}>
				{(formAPI) => (
					<div>
						<rhfAdapter.Field name="name">
							{(field) => (
								<input
									data-testid="input"
									onChange={(e) => field.onChange(e.target.value)}
									value={field.value as string}
								/>
							)}
						</rhfAdapter.Field>
						<button
							data-testid="reset-btn"
							onClick={() => formAPI.reset()}
							type="button"
						>
							Reset
						</button>
					</div>
				)}
			</rhfAdapter.FormProvider>
		);
		const input = screen.getByTestId("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "Jane" } });
		expect(input.value).toBe("Jane");
		fireEvent.click(screen.getByTestId("reset-btn"));
		expect(input.value).toBe("John");
	});

	it("appendFieldValue adds an item to an array field", async () => {
		render(
			<rhfAdapter.FormProvider defaultValues={{ tags: [] }}>
				{(formAPI) => (
					<div>
						<button
							data-testid="append-btn"
							onClick={() => formAPI.appendFieldValue("tags", "new-tag")}
							type="button"
						>
							Append
						</button>
						<rhfAdapter.Field name="tags">
							{(field) => (
								<span data-testid="tag-count">
									{String((field.value as string[])?.length ?? 0)}
								</span>
							)}
						</rhfAdapter.Field>
					</div>
				)}
			</rhfAdapter.FormProvider>
		);
		expect(screen.getByTestId("tag-count").textContent).toBe("0");
		fireEvent.click(screen.getByTestId("append-btn"));
		await waitFor(() => {
			expect(screen.getByTestId("tag-count").textContent).toBe("1");
		});
	});

	it("removeFieldValue removes an item from an array field", async () => {
		render(
			<rhfAdapter.FormProvider defaultValues={{ tags: ["a", "b"] }}>
				{(formAPI) => (
					<div>
						<button
							data-testid="remove-btn"
							onClick={() => formAPI.removeFieldValue("tags", 0)}
							type="button"
						>
							Remove
						</button>
						<rhfAdapter.Field name="tags">
							{(field) => (
								<span data-testid="tag-count">
									{String((field.value as string[])?.length ?? 0)}
								</span>
							)}
						</rhfAdapter.Field>
					</div>
				)}
			</rhfAdapter.FormProvider>
		);
		expect(screen.getByTestId("tag-count").textContent).toBe("2");
		fireEvent.click(screen.getByTestId("remove-btn"));
		await waitFor(() => {
			expect(screen.getByTestId("tag-count").textContent).toBe("1");
		});
	});

	it("Field reads value from form state", () => {
		render(
			<rhfAdapter.FormProvider defaultValues={{ name: "John" }}>
				{(_formAPI) => (
					<rhfAdapter.Field name="name">
						{(field) => (
							<input
								data-testid="input"
								onChange={vi.fn()}
								value={field.value as string}
							/>
						)}
					</rhfAdapter.Field>
				)}
			</rhfAdapter.FormProvider>
		);
		const input = screen.getByTestId("input") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("Field.onChange updates form state", () => {
		render(
			<rhfAdapter.FormProvider defaultValues={{ name: "" }}>
				{(_formAPI) => (
					<rhfAdapter.Field name="name">
						{(field) => (
							<input
								data-testid="input"
								onChange={(e) => field.onChange(e.target.value)}
								value={field.value as string}
							/>
						)}
					</rhfAdapter.Field>
				)}
			</rhfAdapter.FormProvider>
		);
		const input = screen.getByTestId("input") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "Jane" } });
		expect(input.value).toBe("Jane");
	});

	it("Field provides error and isTouched", () => {
		render(
			<rhfAdapter.FormProvider defaultValues={{ name: "" }}>
				{(_formAPI) => (
					<rhfAdapter.Field name="name">
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
					</rhfAdapter.Field>
				)}
			</rhfAdapter.FormProvider>
		);
		expect(screen.getByTestId("error").textContent).toBe("");
		expect(screen.getByTestId("touched").textContent).toBe("false");
		fireEvent.blur(screen.getByTestId("input"));
		expect(screen.getByTestId("touched").textContent).toBe("true");
	});

	it("throws when Field is rendered outside FormProvider", () => {
		expect(() =>
			render(<rhfAdapter.Field name="name">{() => <div />}</rhfAdapter.Field>)
		).toThrow("rhfAdapter: missing FormProvider");
	});
});
