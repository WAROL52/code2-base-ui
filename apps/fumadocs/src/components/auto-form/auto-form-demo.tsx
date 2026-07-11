"use client";

import type { FieldAPI } from "@code2-base-ui/auto-form-builder";
import {
	AutoFormBuilder,
	tanstackAdapter,
} from "@code2-base-ui/auto-form-builder";
import {
	ShadcnBooleanField,
	ShadcnEnumField,
	ShadcnNumberField,
	ShadcnPasswordField,
	ShadcnTextField,
} from "@code2-base-ui/auto-form-builder/fields";
import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import { FieldRegistry } from "@code2-base-ui/json-schema-toolkit/registry";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@code2-base-ui/ui/components/field";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import type { ReactNode } from "react";

function createRegistry(): FieldRegistry {
	const r = new FieldRegistry();
	r.register({ type: "string", kind: "enum" }, ShadcnEnumField, 20);
	r.register({ type: "string", widget: "password" }, ShadcnPasswordField, 10);
	r.register({ type: "string", kind: "primitive" }, ShadcnTextField, 0);
	r.register({ type: "number" }, ShadcnNumberField, 0);
	r.register({ type: "integer" }, ShadcnNumberField, 0);
	r.register({ type: "boolean", kind: "primitive" }, ShadcnBooleanField, 0);
	r.setFallback(ShadcnTextField);
	return r;
}

function renderField(field: FieldMeta, fieldAPI: FieldAPI): ReactNode {
	const r = createRegistry();
	const Component = r.resolve(field);
	return (
		<Component
			error={fieldAPI.error}
			field={field}
			id={field.path}
			label={field.label}
			onChange={(v: unknown) => fieldAPI.onChange(v)}
			value={fieldAPI.value}
		/>
	);
}

const simpleSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		title: { type: "string", title: "Titre", minLength: 1 },
		category: {
			type: "string",
			title: "Catégorie",
			enum: ["tech", "design", "business"],
		},
		published: { type: "boolean", title: "Publié" },
	},
	required: ["title"],
};

const userSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		name: { type: "string", title: "Nom", minLength: 2 },
		email: { type: "string", format: "email", title: "Email" },
		age: { type: "integer", title: "Âge", minimum: 18 },
		role: {
			type: "string",
			title: "Rôle",
			enum: ["admin", "user", "guest"],
		},
		bio: { type: "string", title: "Bio", "x-ui-widget": "textarea" },
	},
	required: ["name", "email", "role"],
};

const signupSchema: Record<string, unknown> = {
	type: "object",
	properties: {
		username: { type: "string", title: "Nom d'utilisateur", minLength: 3 },
		password: {
			type: "string",
			title: "Mot de passe",
			minLength: 8,
			"x-ui-widget": "password",
		},
		email: { type: "string", format: "email", title: "Email" },
	},
	required: ["username", "password", "email"],
};

function FormRenderer({
	fields,
	form,
	className,
}: {
	fields: FieldMeta[];
	form: { handleSubmit: () => void; isSubmitting: boolean };
	className?: string;
}): ReactNode {
	return (
		<form
			className={className}
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			{fields.map((field) => (
				<tanstackAdapter.Field key={field.path} name={field.path}>
					{(fieldAPI) => renderField(field, fieldAPI)}
				</tanstackAdapter.Field>
			))}
			<button
				className="rounded bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
				disabled={form.isSubmitting}
				type="submit"
			>
				Envoyer
			</button>
		</form>
	);
}

function FormDemo({
	schema,
	title,
	code,
}: {
	schema: Record<string, unknown>;
	title: string;
	code: string;
}): ReactNode {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-sm">{title}</h3>
			<div className="rounded-lg border p-4">
				<AutoFormBuilder adapter={tanstackAdapter} schema={schema}>
					{({ fields, form }) => <FormRenderer fields={fields} form={form} />}
				</AutoFormBuilder>
			</div>
			<CodeBlock title="schema.ts">
				<Pre>{code}</Pre>
			</CodeBlock>
		</div>
	);
}

export function SimpleForm(): ReactNode {
	return (
		<FormDemo
			code={JSON.stringify(simpleSchema, null, 2)}
			schema={simpleSchema}
			title="Formulaire simple (titre, catégorie, publication)"
		/>
	);
}

export function UserForm(): ReactNode {
	return (
		<FormDemo
			code={JSON.stringify(userSchema, null, 2)}
			schema={userSchema}
			title="Profil utilisateur (nom, email, âge, rôle, bio)"
		/>
	);
}

export function SignupForm(): ReactNode {
	return (
		<FormDemo
			code={JSON.stringify(signupSchema, null, 2)}
			schema={signupSchema}
			title="Inscription (username, password, email)"
		/>
	);
}

function FieldWrapper({
	field,
	fieldAPI,
	colSpan,
}: {
	field: FieldMeta;
	fieldAPI: FieldAPI;
	colSpan?: boolean;
}): ReactNode {
	const r = createRegistry();
	const Component = r.resolve(field);
	return (
		<Field
			className={colSpan ? "col-span-2" : ""}
			data-invalid={!!fieldAPI.error || undefined}
			orientation="vertical"
		>
			{field.label && <FieldLabel>{field.label}</FieldLabel>}
			<FieldContent>
				<Component
					error={fieldAPI.error}
					field={field}
					id={field.path}
					label={field.label}
					onChange={(v: unknown) => fieldAPI.onChange(v)}
					value={fieldAPI.value}
				/>
				{fieldAPI.error && (
					<FieldError>
						{typeof fieldAPI.error === "string"
							? fieldAPI.error
							: fieldAPI.error.message}
					</FieldError>
				)}
			</FieldContent>
		</Field>
	);
}

export function CustomLayoutForm(): ReactNode {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-sm">
				Mode composé avec layout personnalisé
			</h3>
			<div className="rounded-lg border p-4">
				<AutoFormBuilder adapter={tanstackAdapter} schema={simpleSchema}>
					{({ fields, form }) => (
						<form
							className="grid grid-cols-2 gap-3"
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
						>
							{fields.map((field) => (
								<tanstackAdapter.Field key={field.path} name={field.path}>
									{(fieldAPI) => (
										<FieldWrapper
											colSpan={field.path === "published"}
											field={field}
											fieldAPI={fieldAPI}
										/>
									)}
								</tanstackAdapter.Field>
							))}
							<button
								className="col-span-2 rounded bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
								type="submit"
							>
								Envoyer
							</button>
						</form>
					)}
				</AutoFormBuilder>
			</div>
			<CodeBlock title="grid-cols-2 layout">
				<Pre>{`<form className="grid grid-cols-2 gap-3">\n  {/* champs en grille */}\n</form>`}</Pre>
			</CodeBlock>
		</div>
	);
}
