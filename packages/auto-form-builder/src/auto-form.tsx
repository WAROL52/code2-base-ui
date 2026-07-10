"use client";

import { useMemo } from "react";
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
	layout,
	resolveSchema,
	traverseSchema,
	unionFieldRenderer,
}: AutoFormProps) {
	const mergedLayout = useMemo(
		() => ({ ...shadcnLayout, ...layout }),
		[layout]
	);

	return (
		<AutoFormBuilder
			adapter={adapter}
			defaultValues={defaultValues}
			onSubmit={onSubmit}
			resolveSchema={resolveSchema}
			schema={schema}
			traverseSchema={traverseSchema}
		>
			{({ fields, form }) => (
				<FormLayoutCtx.Provider value={mergedLayout}>
					<form
						className={className}
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<mergedLayout.FieldSet>
							{"title" in schema && typeof schema.title === "string" && (
								<mergedLayout.FieldLegend className="mb-2">
									{schema.title}
								</mergedLayout.FieldLegend>
							)}
							{"description" in schema &&
								typeof schema.description === "string" && (
									<mergedLayout.FieldDescription>
										{schema.description}
									</mergedLayout.FieldDescription>
								)}
							<mergedLayout.FieldGroup>
								{fields.map((field) => (
									<AutoFormField
										adapter={adapter}
										fieldMeta={field}
										form={form}
										key={field.path}
										registry={registry}
										unionFieldRenderer={unionFieldRenderer}
									/>
								))}
							</mergedLayout.FieldGroup>
						</mergedLayout.FieldSet>
						{children ?? <mergedLayout.SubmitButton />}
					</form>
				</FormLayoutCtx.Provider>
			)}
		</AutoFormBuilder>
	);
}
