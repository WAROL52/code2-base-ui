"use client";

import {
	type FieldMeta,
	type ResolvedSchema,
	resolveSchema,
	traverseSchema,
} from "@code2-base-ui/json-schema-toolkit";
import { useMemo } from "react";
import type { FormAdapter, FormAPI } from "./adapters/types";

export interface AutoFormBuilderChildrenProps {
	fields: FieldMeta[];
	form: FormAPI;
	resolvedSchema: ResolvedSchema;
}

export interface AutoFormBuilderProps {
	adapter: FormAdapter;
	children: (props: AutoFormBuilderChildrenProps) => React.ReactNode;
	defaultValues?: Record<string, unknown>;
	onSubmit?: (data: unknown) => void | Promise<void>;
	schema: Record<string, unknown>;
}

export function AutoFormBuilder({
	schema,
	adapter,
	defaultValues,
	onSubmit,
	children,
}: AutoFormBuilderProps) {
	const resolvedSchema = useMemo(() => resolveSchema(schema), [schema]);
	const fields = useMemo(
		() => traverseSchema(resolvedSchema),
		[resolvedSchema]
	);

	return (
		<adapter.FormProvider defaultValues={defaultValues} onSubmit={onSubmit}>
			{(formAPI) => children({ form: formAPI, fields, resolvedSchema })}
		</adapter.FormProvider>
	);
}
