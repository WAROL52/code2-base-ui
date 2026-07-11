"use client";

import {
	resolveSchema as defaultResolve,
	traverseSchema as defaultTraverse,
	type FieldMeta,
	type JsonSchemaDraft,
	type ResolvedSchema,
} from "@code2-base-ui/json-schema-toolkit";
import { useMemo, useRef } from "react";
import type { FormAdapter, FormAPI } from "./adapters/types";
import { createSchemaValidator } from "./validate";

const PATH_SEPARATOR_RE = /[.[\]]+/;

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
	resolveSchema?: (
		rawSchema: unknown,
		draftHint?: JsonSchemaDraft
	) => ResolvedSchema;
	schema: Record<string, unknown>;
	traverseSchema?: (resolved: ResolvedSchema) => FieldMeta[];
}

export function AutoFormBuilder({
	schema,
	adapter,
	defaultValues,
	onSubmit,
	children,
	resolveSchema: resolveSchemaProp,
	traverseSchema: traverseSchemaProp,
}: AutoFormBuilderProps) {
	const fnResolve = resolveSchemaProp ?? defaultResolve;
	const fnTraverse = traverseSchemaProp ?? defaultTraverse;
	const resolveRef = useRef(fnResolve);
	resolveRef.current = fnResolve;
	const traverseRef = useRef(fnTraverse);
	traverseRef.current = fnTraverse;

	const resolvedSchema = useMemo(() => resolveRef.current(schema), [schema]);
	const fields = useMemo(
		() => traverseRef.current(resolvedSchema),
		[resolvedSchema]
	);
	const completeDefaults = useMemo(() => {
		const result: Record<string, unknown> = { ...defaultValues };
		for (const field of fields) {
			if (!field.path) {
				continue;
			}
			const parts = field.path.split(PATH_SEPARATOR_RE).filter(Boolean);
			if (parts.length !== 1) {
				continue;
			}
			const key = parts[0];
			if (key && !(key in result)) {
				result[key] = field.defaultValue ?? "";
			}
		}
		return result;
	}, [defaultValues, fields]);

	const validate = useMemo(() => createSchemaValidator(schema), [schema]);

	return (
		<adapter.FormProvider
			defaultValues={completeDefaults}
			onSubmit={onSubmit}
			schema={schema}
			validate={validate}
		>
			{(formAPI) => children({ form: formAPI, fields, resolvedSchema })}
		</adapter.FormProvider>
	);
}
