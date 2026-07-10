import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { ComponentType, ReactNode } from "react";
import type { FieldError } from "../adapters/types";

export interface ObjectFieldProps {
	children: ReactNode;
	fieldMeta: FieldMeta;
}

export interface ArrayFieldProps {
	children: ReactNode[];
	error?: FieldError;
	fieldMeta: FieldMeta;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export interface CompositionsFieldProps {
	children: ReactNode;
	fieldMeta: FieldMeta;
	onSelect: (index: number) => void;
	options: { label: string }[];
	selectedIndex: number;
}

export interface FormLayout {
	ArrayField: ComponentType<ArrayFieldProps>;
	CompositionsField: ComponentType<CompositionsFieldProps>;
	FieldDescription: ComponentType<{ children: ReactNode }>;
	FieldGroup: ComponentType<{ children: ReactNode }>;
	FieldLegend: ComponentType<{ children: ReactNode; className?: string }>;
	FieldSet: ComponentType<{ children: ReactNode; className?: string }>;
	ObjectField: ComponentType<ObjectFieldProps>;
	SubmitButton: ComponentType<{
		children?: ReactNode;
		disabled?: boolean;
		isSubmitting?: boolean;
	}>;
}
