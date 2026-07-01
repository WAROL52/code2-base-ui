"use client";

import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { AutoFormFieldProps } from "./auto-form-field-types";
import { ArrayFieldHandler } from "./handlers/array-handler";
import { LeafFieldHandler } from "./handlers/leaf-handler";
import { ObjectFieldHandler } from "./handlers/object-handler";
import { UnionFieldHandler } from "./handlers/union-handler";

export function AutoFormField({
	fieldMeta,
	adapter,
	form,
	registry,
	unionFieldRenderer: UnionRenderer,
}: AutoFormFieldProps) {
	const { uiHidden } = fieldMeta;

	if (uiHidden) {
		return null;
	}

	const renderField = (childMeta: FieldMeta) => (
		<AutoFormField
			adapter={adapter}
			fieldMeta={childMeta}
			form={form}
			key={childMeta.path}
			registry={registry}
			unionFieldRenderer={UnionRenderer}
		/>
	);

	if (fieldMeta.kind === "object" && fieldMeta.children) {
		return (
			<ObjectFieldHandler fieldMeta={fieldMeta} renderField={renderField} />
		);
	}

	if (fieldMeta.kind === "array" && fieldMeta.itemMeta) {
		return (
			<ArrayFieldHandler
				fieldMeta={fieldMeta}
				form={form}
				renderField={renderField}
			/>
		);
	}

	if (fieldMeta.kind === "union" && fieldMeta.variants) {
		return UnionRenderer ? (
			<UnionRenderer
				adapter={adapter}
				fieldMeta={fieldMeta}
				form={form}
				key={fieldMeta.path}
				registry={registry}
				renderChild={renderField}
				unionFieldRenderer={UnionRenderer}
			/>
		) : (
			<UnionFieldHandler
				fieldMeta={fieldMeta}
				key={fieldMeta.path}
				renderField={renderField}
			/>
		);
	}

	return (
		<LeafFieldHandler
			adapter={adapter}
			fieldMeta={fieldMeta}
			registry={registry}
		/>
	);
}
