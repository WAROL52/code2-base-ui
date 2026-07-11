import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { formischAdapter } from "../src/adapters/formisch";
import { rhfAdapter } from "../src/adapters/rhf";
import { tanstackAdapter } from "../src/adapters/tanstack";
import { AutoFormBuilder } from "../src/auto-form-builder";

const loginSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		email: { type: "string", format: "email", title: "Email" },
		password: { type: "string", title: "Mot de passe" },
		rememberMe: { type: "boolean", title: "Se souvenir de moi" },
	},
	required: ["email", "password"],
};

const EMAIL_REQUIRED_RE = /email is required/i;
const PASSWORD_REQUIRED_RE = /password is required/i;

function renderForm(adapter: typeof tanstackAdapter) {
	return render(
		<AutoFormBuilder
			adapter={adapter}
			defaultValues={{
				email: "",
				password: "",
				rememberMe: false,
			}}
			schema={loginSchema}
		>
			{({ fields, form }) => (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					{fields.map((field) => (
						<adapter.Field key={field.path} name={field.path}>
							{({ error, value, onChange }) => (
								<div>
									<input
										onChange={(e) => onChange(e.target.value)}
										value={value as string}
									/>
									{error && (
										<span role="alert">
											{typeof error === "string" ? error : error.message}
										</span>
									)}
								</div>
							)}
						</adapter.Field>
					))}
					<button type="submit">Submit</button>
				</form>
			)}
		</AutoFormBuilder>
	);
}

describe("TanStack adapter validation", () => {
	it("shows error after submitting with empty required fields", async () => {
		renderForm(tanstackAdapter);
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(2);
			expect(screen.getByText(EMAIL_REQUIRED_RE)).toBeTruthy();
			expect(screen.getByText(PASSWORD_REQUIRED_RE)).toBeTruthy();
		});
	});

	it("clears errors after valid submission", async () => {
		renderForm(tanstackAdapter);
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			expect(screen.getByText(EMAIL_REQUIRED_RE)).toBeTruthy();
		});
		const inputs = screen.getAllByRole("textbox");
		const emailInput = inputs[0];
		const passwordInput = inputs[1];
		fireEvent.change(emailInput as Element, {
			target: { value: "test@example.com" },
		});
		fireEvent.change(passwordInput as Element, { target: { value: "secret" } });
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			expect(screen.queryByRole("alert")).toBeNull();
		});
	});
});

describe("RHF adapter validation", () => {
	it("shows error after submitting with empty required fields", async () => {
		renderForm(rhfAdapter);
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(2);
			expect(screen.getByText(EMAIL_REQUIRED_RE)).toBeTruthy();
			expect(screen.getByText(PASSWORD_REQUIRED_RE)).toBeTruthy();
		});
	});

	it("clears errors after valid submission", async () => {
		renderForm(rhfAdapter);
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			expect(screen.getByText(EMAIL_REQUIRED_RE)).toBeTruthy();
		});
		const inputs = screen.getAllByRole("textbox");
		const emailInput = inputs[0];
		const passwordInput = inputs[1];
		fireEvent.change(emailInput as Element, {
			target: { value: "test@example.com" },
		});
		fireEvent.change(passwordInput as Element, { target: { value: "secret" } });
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			expect(screen.queryByRole("alert")).toBeNull();
		});
	});
});

describe("Formisch adapter validation", () => {
	it("shows error after submitting with empty required fields", async () => {
		renderForm(formischAdapter);
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			const alerts = screen.getAllByRole("alert");
			expect(alerts.length).toBeGreaterThanOrEqual(2);
		});
	});

	it("clears errors after valid submission", async () => {
		renderForm(formischAdapter);
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(2);
		});
		const inputs = screen.getAllByRole("textbox");
		const emailInput = inputs[0];
		const passwordInput = inputs[1];
		fireEvent.change(emailInput as Element, {
			target: { value: "test@example.com" },
		});
		fireEvent.change(passwordInput as Element, { target: { value: "secret" } });
		fireEvent.click(screen.getByText("Submit"));
		await waitFor(() => {
			expect(screen.queryByRole("alert")).toBeNull();
		});
	});
});
