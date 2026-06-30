import type { ComponentType, ReactNode } from "react";

export interface FormLayout {
	FieldSet: ComponentType<{ children: ReactNode; className?: string }>;
	FieldGroup: ComponentType<{ children: ReactNode }>;
	FieldLegend: ComponentType<{ children: ReactNode; className?: string }>;
	FieldDescription: ComponentType<{ children: ReactNode }>;
	SubmitButton: ComponentType<{
		children?: ReactNode;
		disabled?: boolean;
		isSubmitting?: boolean;
	}>;
}
