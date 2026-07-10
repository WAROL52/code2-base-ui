"use client";

import type {
	FieldMeta,
	FieldRegistry,
	JsonSchemaDraft,
	ResolvedSchema,
} from "@code2-base-ui/json-schema-toolkit";
import type { ComponentType, ReactNode } from "react";
import { useMemo } from "react";
import type { FormAdapter } from "./adapters/types";
import { AutoFormBuilder } from "./auto-form-builder";
import { AutoFormField } from "./auto-form-field";
import type { AutoFormFieldProps } from "./auto-form-field-types";
import { FormLayoutCtx } from "./layout/context";
import { shadcnLayout } from "./layout/shadcn";
import type { FormLayout } from "./layout/types";

interface AutoFormProps {
	adapter: FormAdapter;
	children?: ReactNode;
	className?: string;
	defaultValues?: Record<string, unknown>;
	layout?: Partial<FormLayout>;
	onSubmit?: (data: unknown) => void | Promise<void>;
	registry: FieldRegistry;
	resolveSchema?: (
		rawSchema: unknown,
		draftHint?: JsonSchemaDraft
	) => ResolvedSchema;
	schema: Record<string, unknown>;
	traverseSchema?: (resolved: ResolvedSchema) => FieldMeta[];
	unionFieldRenderer?: ComponentType<AutoFormFieldProps>;
}

function AutoForm({
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

export interface CreateAutoFormConfig {
	adapter: FormAdapter;
	layout?: Partial<FormLayout>;
	registry: FieldRegistry;
	resolveSchema?: (
		rawSchema: unknown,
		draftHint?: JsonSchemaDraft
	) => ResolvedSchema;
	traverseSchema?: (resolved: ResolvedSchema) => FieldMeta[];
	unionFieldRenderer?: ComponentType<AutoFormFieldProps>;
}

export interface CreatedAutoFormProps {
	children?: ReactNode;
	className?: string;
	defaultValues?: Record<string, unknown>;
	onSubmit?: (data: unknown) => void | Promise<void>;
	schema: Record<string, unknown>;
}

export function createAutoForm(config: CreateAutoFormConfig) {
	const { adapter, registry, ...rest } = config;

	function CreatedAutoForm(props: CreatedAutoFormProps) {
		return (
			<AutoForm adapter={adapter} registry={registry} {...rest} {...props} />
		);
	}

	return CreatedAutoForm;
}
