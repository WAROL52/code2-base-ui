"use client";

import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";
import { useFormLayout } from "../layout/context";

export interface ObjectFieldHandlerProps {
	fieldMeta: FieldMeta;
	renderField: (childMeta: FieldMeta) => ReactNode;
}

export function ObjectFieldHandler({
	fieldMeta,
	renderField,
}: ObjectFieldHandlerProps) {
	const layout = useFormLayout();

	return (
		<layout.ObjectField fieldMeta={fieldMeta}>
			{fieldMeta.children?.map((child) => renderField(child))}
		</layout.ObjectField>
	);
}
