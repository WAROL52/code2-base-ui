"use client";

import { AutoFormBuilder } from "./auto-form-builder";
import { AutoFormField } from "./auto-form-field";
import { FormLayoutCtx } from "./layout/context";
import { shadcnLayout } from "./layout/shadcn";
import type { AutoFormProps } from "./types";

export function AutoForm({
	schema,
	adapter,
	registry,
	defaultValues,
	onSubmit,
	className,
	children,
	layout = shadcnLayout,
}: AutoFormProps) {
	return (
		<AutoFormBuilder
			adapter={adapter}
			defaultValues={defaultValues}
			onSubmit={onSubmit}
			schema={schema}
		>
			{({ fields, form }) => (
				<FormLayoutCtx.Provider value={layout}>
					<form
						className={className}
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<layout.FieldSet>
							{"title" in schema && typeof schema.title === "string" && (
								<layout.FieldLegend className="mb-2">
									{schema.title}
								</layout.FieldLegend>
							)}
							{"description" in schema &&
								typeof schema.description === "string" && (
									<layout.FieldDescription>
										{schema.description}
									</layout.FieldDescription>
								)}
							<layout.FieldGroup>
								{fields.map((field) => (
									<AutoFormField
										adapter={adapter}
										fieldMeta={field}
										form={form}
										key={field.path}
										registry={registry}
									/>
								))}
							</layout.FieldGroup>
						</layout.FieldSet>
						{children ?? <layout.SubmitButton />}
					</form>
				</FormLayoutCtx.Provider>
			)}
		</AutoFormBuilder>
	);
}
