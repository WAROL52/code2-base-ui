"use client";

import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@code2-base-ui/ui/components/field";
import { AutoFormBuilder } from "./auto-form-builder";
import { AutoFormField } from "./auto-form-field";
import type { AutoFormProps } from "./types";

export function AutoForm({
	schema,
	adapter,
	registry,
	defaultValues,
	onSubmit,
	className,
	children,
}: AutoFormProps) {
	return (
		<AutoFormBuilder
			adapter={adapter}
			defaultValues={defaultValues}
			onSubmit={onSubmit}
			schema={schema}
		>
			{({ fields, form }) => (
				<form
					className={className}
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<FieldSet>
						{"title" in schema && typeof schema.title === "string" && (
							<FieldLegend className="mb-2">{schema.title}</FieldLegend>
						)}
						{"description" in schema &&
							typeof schema.description === "string" && (
								<FieldDescription>{schema.description}</FieldDescription>
							)}
						<FieldGroup>
							{fields.map((field) => (
								<AutoFormField
									adapter={adapter}
									fieldMeta={field}
									key={field.path}
									registry={registry}
								/>
							))}
						</FieldGroup>
					</FieldSet>
					{children ?? (
						<button
							className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
							type="submit"
						>
							Envoyer
						</button>
					)}
				</form>
			)}
		</AutoFormBuilder>
	);
}
