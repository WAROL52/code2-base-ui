import {
	FieldRegistry,
	type ResolvedSchema,
} from "@code2-base-ui/json-schema-toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createAutoForm } from "../src/create-auto-form";
import type { FormLayout } from "../src/layout";
import {
	arrayConstraintsSchema,
	choiceSchema,
	createSchemaValidator,
	mixedSchema,
	numberConstraintsSchema,
	stringConstraintsSchema,
	widgetSchema,
} from "./schemas/validation-schemas";
import { createMockAdapterWithValidation, mockAdapter } from "./test-utils";

function getForm(container: HTMLElement): HTMLFormElement {
	const form = container.querySelector("form");
	if (!form) {
		throw new Error("Form not found");
	}
	return form;
}

function toErrorString(error: unknown): string {
	if (!error) {
		return "";
	}
	if (typeof error === "string") {
		return error;
	}
	if (typeof error === "object" && error !== null && "message" in error) {
		return (error as { message: string }).message;
	}
	return "";
}

const errorRegistry = new FieldRegistry();
vi.spyOn(errorRegistry, "resolve").mockImplementation(
	(_field) =>
		(({ value, onChange, error }: Record<string, unknown>) => (
			<div>
				<input
					data-testid="auto-input"
					onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
					value={(value as string) ?? ""}
				/>
				{error ? (
					<span data-testid="field-error" role="alert">
						{toErrorString(error)}
					</span>
				) : null}
			</div>
		)) as React.ComponentType<Record<string, unknown>>
);

const testSchema: Record<string, unknown> = {
	type: "object",
	title: "Test Form",
	description: "A test form",
	properties: {
		name: { type: "string", title: "Name" },
	},
};

const registry = new FieldRegistry();
vi.spyOn(registry, "resolve").mockImplementation(
	(_field) =>
		(({ value, onChange }: Record<string, unknown>) => (
			<input
				data-testid="auto-input"
				onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
				value={(value as string) ?? ""}
			/>
		)) as React.ComponentType<Record<string, unknown>>
);

const TestForm = createAutoForm({
	adapter: mockAdapter,
	registry,
});

describe("createAutoForm", () => {
	it("renders form with title and fields", () => {
		render(<TestForm defaultValues={{ name: "John" }} schema={testSchema} />);
		expect(screen.getByText("Test Form")).toBeDefined();
		expect(screen.getByText("A test form")).toBeDefined();
		const input = screen.getByTestId("auto-input") as HTMLInputElement;
		expect(input.value).toBe("John");
	});

	it("renders submit button when no children", () => {
		render(<TestForm schema={testSchema} />);
		expect(screen.getByText("Envoyer")).toBeDefined();
	});

	it("renders with custom layout", () => {
		const customLayout: Partial<FormLayout> = {
			FieldSet: ({ children }) => (
				<div data-testid="custom-fieldset">{children}</div>
			),
			FieldGroup: ({ children }) => (
				<div data-testid="custom-group">{children}</div>
			),
			FieldLegend: ({ children }) => (
				<div data-testid="custom-legend">{children}</div>
			),
			FieldDescription: ({ children }) => (
				<div data-testid="custom-desc">{children}</div>
			),
			SubmitButton: () => (
				<button data-testid="custom-submit" type="submit">
					Save
				</button>
			),
		};

		const CustomForm = createAutoForm({
			adapter: mockAdapter,
			layout: customLayout,
			registry,
		});

		render(<CustomForm schema={testSchema} />);

		expect(screen.getByTestId("custom-fieldset")).toBeDefined();
		expect(screen.getByTestId("custom-legend")).toBeDefined();
		expect(screen.getByTestId("custom-desc")).toBeDefined();
		expect(screen.getByTestId("custom-group")).toBeDefined();
		expect(screen.getByTestId("custom-submit")).toBeDefined();
	});

	it("passes resolveSchema to AutoFormBuilder", () => {
		const customResolve = vi.fn(
			(_raw: unknown): ResolvedSchema => ({
				definitions: {},
				draft: "draft-7",
				root: {
					type: "object",
					properties: {
						mockField: { type: "string" },
					},
				},
			})
		);

		const ResolveForm = createAutoForm({
			adapter: mockAdapter,
			registry,
			resolveSchema: customResolve,
		});

		render(<ResolveForm schema={testSchema} />);

		expect(customResolve).toHaveBeenCalledTimes(1);
	});

	it("calls handleSubmit on form submission", async () => {
		const onSubmit = vi.fn();
		const { container } = render(
			<TestForm
				defaultValues={{ name: "John" }}
				onSubmit={onSubmit}
				schema={testSchema}
			/>
		);

		const form = container.querySelector("form");
		expect(form).toBeTruthy();
		fireEvent.submit(form as HTMLFormElement);
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({ name: "John" });
		});
	});

	it("calls preventDefault on form submit", () => {
		const onSubmit = vi.fn();
		const { container } = render(
			<TestForm
				defaultValues={{ name: "John" }}
				onSubmit={onSubmit}
				schema={testSchema}
			/>
		);
		const form = getForm(container);
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true })
		);
		expect(onSubmit).toHaveBeenCalled();
	});
});

describe("submit and validation", () => {
	const createValidatedForm = (schema: Record<string, unknown>) => {
		const validate = createSchemaValidator(schema);
		const adapter = createMockAdapterWithValidation(validate);
		return createAutoForm({ adapter, registry });
	};

	describe("string constraints", () => {
		const Form = createValidatedForm(stringConstraintsSchema);

		it("submits valid string data", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						username: "john_doe",
						bio: "Hello",
						zipCode: "75001",
						email: "john@test.com",
					}}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledWith({
					username: "john_doe",
					bio: "Hello",
					zipCode: "75001",
					email: "john@test.com",
				});
			});
		});

		it("blocks submit when required string is missing", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ zipCode: "75001" }}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when minLength is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ username: "ab", email: "a@b.com" }}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when maxLength is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						username: "john",
						bio: "x".repeat(201),
						email: "a@b.com",
					}}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when pattern is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						username: "john",
						zipCode: "abc",
						email: "a@b.com",
					}}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when email format is invalid", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						username: "john",
						email: "not-an-email",
					}}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("number constraints", () => {
		const Form = createValidatedForm(numberConstraintsSchema);

		it("submits valid number data", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ age: 25, price: 10.5, score: 3.5, quantity: 2 }}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledWith({
					age: 25,
					price: 10.5,
					score: 3.5,
					quantity: 2,
				});
			});
		});

		it("blocks submit when minimum is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ age: -1, price: 5 }}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when maximum is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ age: 200, price: 5 }}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when exclusiveMinimum is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ age: 25, price: 0 }}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when multipleOf is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ age: 25, price: 5, score: 1.2, quantity: 1 }}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("choice fields (boolean + enum)", () => {
		const Form = createValidatedForm(choiceSchema);

		it("submits valid choice data", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ agree: true, role: "admin", status: 1 }}
					onSubmit={onSubmit}
					schema={choiceSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledWith({
					agree: true,
					role: "admin",
					status: 1,
				});
			});
		});

		it("blocks submit when enum value is invalid", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ agree: true, role: "superadmin" }}
					onSubmit={onSubmit}
					schema={choiceSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("array constraints", () => {
		const Form = createValidatedForm(arrayConstraintsSchema);

		it("submits valid array data", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ tags: ["a", "b"], nums: [1, 2] }}
					onSubmit={onSubmit}
					schema={arrayConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledWith({
					tags: ["a", "b"],
					nums: [1, 2],
				});
			});
		});

		it("blocks submit when minItems is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ tags: [], nums: [1] }}
					onSubmit={onSubmit}
					schema={arrayConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when maxItems is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ tags: ["a", "b", "c", "d", "e", "f"], nums: [1] }}
					onSubmit={onSubmit}
					schema={arrayConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("blocks submit when uniqueItems is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ tags: ["a"], nums: [1, 1] }}
					onSubmit={onSubmit}
					schema={arrayConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("widget variations (textarea, password, date)", () => {
		const Form = createValidatedForm(widgetSchema);

		it("submits valid widget data", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						message: "Hello World!",
						password: "secret123",
						birth: "2000-01-01",
					}}
					onSubmit={onSubmit}
					schema={widgetSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledWith({
					message: "Hello World!",
					password: "secret123",
					birth: "2000-01-01",
				});
			});
		});

		it("blocks submit when password minLength is violated", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ message: "Hello World!", password: "short" }}
					onSubmit={onSubmit}
					schema={widgetSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("mixed schema (all field types)", () => {
		const Form = createValidatedForm(mixedSchema);

		it("submits valid mixed data", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						name: "John",
						email: "john@test.com",
						age: 25,
						role: "admin",
						tags: ["dev"],
						agree: true,
					}}
					onSubmit={onSubmit}
					schema={mixedSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalledWith({
					name: "John",
					email: "john@test.com",
					age: 25,
					role: "admin",
					tags: ["dev"],
					agree: true,
				});
			});
		});

		it("blocks submit when multiple constraints fail simultaneously", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						name: "J",
						email: "invalid",
						age: 10,
						role: "superadmin",
						tags: [],
					}}
					onSubmit={onSubmit}
					schema={mixedSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});
});

describe("error display", () => {
	function createErrorDisplayForm(schema: Record<string, unknown>) {
		const validate = createSchemaValidator(schema);
		const adapter = createMockAdapterWithValidation(validate);
		return createAutoForm({ adapter, registry: errorRegistry });
	}

	describe("string constraints", () => {
		const Form = createErrorDisplayForm(stringConstraintsSchema);

		it("shows required error when username is missing", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ zipCode: "75001" }}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(screen.getByText("username is required")).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows minLength error when username is too short", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ username: "ab", email: "a@b.com" }}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("username must be at least 3 characters")
				).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows maxLength error when bio is too long", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						username: "john",
						bio: "x".repeat(201),
						email: "a@b.com",
					}}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("bio must be at most 200 characters")
				).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows pattern error when zipCode does not match", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ username: "john", zipCode: "abc", email: "a@b.com" }}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(screen.getByText("zipCode does not match pattern")).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows format error when email is invalid", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ username: "john", email: "not-an-email" }}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(screen.getByText("email must be a valid email")).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("clears errors on successful resubmit", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ username: "ab", email: "a@b.com" }}
					onSubmit={onSubmit}
					schema={stringConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("username must be at least 3 characters")
				).toBeTruthy();
			});
			const inputs = screen.getAllByTestId("auto-input");
			const input = inputs[0];
			if (!input) {
				throw new Error("Input not found");
			}
			fireEvent.change(input, {
				target: { value: "john_doe" },
			});
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.queryByText("username must be at least 3 characters")
				).toBeNull();
				expect(onSubmit).toHaveBeenCalledWith({
					username: "john_doe",
					bio: "",
					zipCode: "",
					email: "a@b.com",
				});
			});
		});
	});

	describe("number constraints", () => {
		const Form = createErrorDisplayForm(numberConstraintsSchema);

		it("shows minimum error when age is below minimum", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ age: -1, price: 5.5, score: 3.5, quantity: 1 }}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(screen.getByText("age must be at least 0")).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows type error when price is a string", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						age: 25,
						price: "abc" as unknown as number,
						score: 3.5,
						quantity: 1,
					}}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(screen.getByText("price must be a number")).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows exclusiveMinimum error when price is 0", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ age: 25, price: 0, score: 3.5, quantity: 1 }}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(screen.getByText("price must be greater than 0")).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows multipleOf error when score is not a multiple", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ age: 25, price: 5.5, score: 1.2, quantity: 1 }}
					onSubmit={onSubmit}
					schema={numberConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("score must be a multiple of 0.5")
				).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("choice constraints", () => {
		const Form = createErrorDisplayForm(choiceSchema);

		it("shows enum error when role is not in allowed values", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ agree: true, role: "superadmin" }}
					onSubmit={onSubmit}
					schema={choiceSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("role must be one of: admin, user, moderator")
				).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("widget constraints", () => {
		const Form = createErrorDisplayForm(widgetSchema);

		it("shows minLength error when password is too short", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ message: "Hello World!", password: "short" }}
					onSubmit={onSubmit}
					schema={widgetSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("password must be at least 8 characters")
				).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("array constraints", () => {
		const Form = createErrorDisplayForm(arrayConstraintsSchema);

		it("shows minItems error when tags is empty", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ tags: [], nums: [1] }}
					onSubmit={onSubmit}
					schema={arrayConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("tags must have at least 1 item(s)")
				).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows maxItems error when tags exceeds limit", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ tags: ["a", "b", "c", "d", "e", "f"], nums: [1] }}
					onSubmit={onSubmit}
					schema={arrayConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("tags must have at most 5 item(s)")
				).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it("shows uniqueItems error when nums has duplicates", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{ tags: ["a"], nums: [1, 1] }}
					onSubmit={onSubmit}
					schema={arrayConstraintsSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(screen.getByText("nums items must be unique")).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe("mixed constraints", () => {
		const Form = createErrorDisplayForm(mixedSchema);

		it("shows multiple errors when several constraints fail simultaneously", async () => {
			const onSubmit = vi.fn();
			const { container } = render(
				<Form
					defaultValues={{
						name: "J",
						email: "invalid",
						age: 10,
						role: "superadmin",
						tags: [],
					}}
					onSubmit={onSubmit}
					schema={mixedSchema}
				/>
			);
			fireEvent.submit(getForm(container));
			await waitFor(() => {
				expect(
					screen.getByText("name must be at least 2 characters")
				).toBeTruthy();
				expect(screen.getByText("email must be a valid email")).toBeTruthy();
				expect(screen.getByText("age must be at least 18")).toBeTruthy();
				expect(
					screen.getByText("role must be one of: admin, user")
				).toBeTruthy();
				expect(
					screen.getByText("tags must have at least 1 item(s)")
				).toBeTruthy();
				expect(screen.getByText("agree is required")).toBeTruthy();
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});
});
