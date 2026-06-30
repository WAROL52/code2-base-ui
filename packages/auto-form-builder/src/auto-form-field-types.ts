import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import type { ComponentType } from "react";
import type { FormAdapter, FormAPI } from "./adapters/types";

export interface AutoFormFieldProps {
	adapter: FormAdapter;
	fieldMeta: FieldMeta;
	form?: FormAPI;
	registry: FieldRegistry;
	unionFieldRenderer?: ComponentType<AutoFormFieldProps>;
}
