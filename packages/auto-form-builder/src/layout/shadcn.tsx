"use client";

import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@code2-base-ui/ui/components/field";
import type { FormLayout } from "./types";

export const shadcnLayout: FormLayout = {
	FieldSet,
	FieldGroup,
	FieldLegend,
	FieldDescription,
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
	ArrayField: ({ fieldMeta, children, onAdd, onRemove }) => (
		<FieldSet className="border-l pl-4">
			{fieldMeta.label && (
				<FieldLegend className="mb-2">{fieldMeta.label}</FieldLegend>
			)}
			{fieldMeta.description && (
				<FieldDescription>{fieldMeta.description}</FieldDescription>
			)}
			<FieldGroup>
				{children.map((child, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: form array items are inherently indexed
					<div className="mb-2 flex items-start gap-2" key={index}>
						<div className="flex-1">{child}</div>
						<button
							className="mt-6 rounded bg-destructive/10 px-2 py-1 text-destructive text-xs hover:bg-destructive/20"
							onClick={() => onRemove(index)}
							type="button"
						>
							Supprimer
						</button>
					</div>
				))}
			</FieldGroup>
			<button
				className="mt-2 rounded bg-secondary px-3 py-1 text-secondary-foreground text-sm hover:bg-secondary/80"
				onClick={() => onAdd()}
				type="button"
			>
				Ajouter
			</button>
		</FieldSet>
	),
	CompositionsField: ({
		fieldMeta,
		children,
		onSelect,
		options,
		selectedIndex,
	}) => (
		<FieldSet className="border-l pl-4">
			{fieldMeta.label && (
				<FieldLegend className="mb-2">{fieldMeta.label}</FieldLegend>
			)}
			{fieldMeta.description && (
				<FieldDescription>{fieldMeta.description}</FieldDescription>
			)}
			{options.length > 0 && (
				<div className="mb-3 flex flex-wrap gap-2">
					{options.map((option, index) => (
						<button
							className={
								index === selectedIndex
									? "rounded bg-primary px-3 py-1 text-primary-foreground text-sm"
									: "rounded bg-secondary px-3 py-1 text-secondary-foreground text-sm hover:bg-secondary/80"
							}
							key={option.label}
							onClick={() => onSelect(index)}
							type="button"
						>
							{option.label}
						</button>
					))}
				</div>
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
