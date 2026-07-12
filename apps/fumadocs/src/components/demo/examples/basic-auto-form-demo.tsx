"use client";

import type { FieldAPI } from "@code2-base-ui/auto-form-builder";
import {
	AutoFormBuilder,
	createShadcnRegistry,
	tanstackAdapter,
} from "@code2-base-ui/auto-form-builder";
import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@code2-base-ui/ui/components/field";
import type { ReactNode } from "react";

const demoRegistry = createShadcnRegistry();

function renderField(field: FieldMeta, fieldAPI: FieldAPI): ReactNode {
	const Component = demoRegistry.resolve(field);
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

const schema = {
	type: "object",
	properties: {
		name: { type: "string", title: "Name", minLength: 2 },
		email: { type: "string", format: "email", title: "Email" },
		age: { type: "integer", title: "Age", minimum: 18 },
		role: {
			type: "string",
			kind: "enum",
			title: "Role",
			enum: ["Admin", "User", "Editor"],
		},
		bio: { type: "string", "x-ui-widget": "textarea", title: "Bio" },
		newsletter: { type: "boolean", title: "Subscribe" },
	},
	required: ["name", "email"],
};

export function BasicAutoFormDemo() {
	return (
		<div className="w-full max-w-lg space-y-6">
			<AutoFormBuilder adapter={tanstackAdapter} schema={schema}>
				{({ fields, form }) => (
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						{fields.map((field) => (
							<Field key={field.path}>
								<FieldLabel>{field.label}</FieldLabel>
								<FieldContent>
									<tanstackAdapter.Field name={field.path}>
										{(fieldAPI) => renderField(field, fieldAPI)}
									</tanstackAdapter.Field>
								</FieldContent>
								<FieldError />
							</Field>
						))}
						<button
							className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
							type="submit"
						>
							Submit
						</button>
					</form>
				)}
			</AutoFormBuilder>
		</div>
	);
}
