import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { ComponentType, ReactNode } from "react";

export interface ObjectFieldProps {
	children: ReactNode;
	fieldMeta: FieldMeta;
}

export interface ArrayFieldProps {
	children: ReactNode[];
	fieldMeta: FieldMeta;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export interface FormLayout {
	ArrayField: ComponentType<ArrayFieldProps>;
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
