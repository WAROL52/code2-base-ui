"use client";

import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@code2-base-ui/ui/components/field";
import type { FormLayout } from "./types";

export const shadcnLayout: FormLayout = {
	FieldSet: ({ children, className }) => (
		<FieldSet className={className}>{children}</FieldSet>
	),
	FieldGroup: ({ children }) => <FieldGroup>{children}</FieldGroup>,
	FieldLegend: ({ children, className }) => (
		<FieldLegend className={className}>{children}</FieldLegend>
	),
	FieldDescription: ({ children }) => (
		<FieldDescription>{children}</FieldDescription>
	),
	ObjectField: ({ fieldMeta, children }) => (
		<FieldSet className="border-l pl-4">
			{fieldMeta.label && (
				<FieldLegend className="mb-2">{fieldMeta.label}</FieldLegend>
			)}
			{fieldMeta.description && (
				<FieldDescription>{fieldMeta.description}</FieldDescription>
			)}
			<FieldGroup>{children}</FieldGroup>
		</FieldSet>
	),
	SubmitButton: ({ children, disabled = false }) => (
		<button
			className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
			disabled={disabled}
			type="submit"
		>
			{children ?? "Envoyer"}
		</button>
	),
};
