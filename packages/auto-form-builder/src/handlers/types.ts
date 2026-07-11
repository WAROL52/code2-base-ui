import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import type React from "react";
import type { FormAdapter, FormAPI } from "../adapters/types";
import type { FormLayout } from "../layout/types";

export interface HandlerProps {
	adapter: FormAdapter;
	fieldMeta: FieldMeta;
	form: FormAPI;
	layout: FormLayout;
	registry: FieldRegistry;
	renderChild: (childMeta: FieldMeta) => React.ReactNode;
	unionFieldRenderer?: React.ComponentType<HandlerProps>;
}
