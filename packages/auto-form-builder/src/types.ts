import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";
import type { ComponentType, ReactNode } from "react";
import type { FormAdapter } from "./adapters/types";
import type { AutoFormFieldProps } from "./auto-form-field";
import type { FormLayout } from "./layout/types";

export interface AutoFormProps {
	adapter: FormAdapter;
	children?: ReactNode;
	className?: string;
	defaultValues?: Record<string, unknown>;
	layout?: FormLayout;
	onSubmit?: (data: unknown) => void | Promise<void>;
	registry: FieldRegistry;
	schema: Record<string, unknown>;
	unionFieldRenderer?: ComponentType<AutoFormFieldProps>;
}
