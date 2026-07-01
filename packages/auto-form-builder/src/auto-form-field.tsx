"use client";

import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
import type { AutoFormFieldProps } from "./auto-form-field-types";
import { UnionFieldHandler } from "./auto-form-union-field";
import { useFormLayout } from "./layout/context";

function getDefaultForType(type?: string): unknown {
	switch (type) {
		case "string":
			return "";
		case "number":
			return 0;
		case "boolean":
			return false;
		case "object":
			return {};
		case "array":
			return [];
		default:
			return "";
	}
}

export function AutoFormField({
	fieldMeta,
	adapter,
	form,
	registry,
	unionFieldRenderer: UnionRenderer,
}: AutoFormFieldProps) {
	const layout = useFormLayout();
	const { path, label, uiHidden, placeholder } = fieldMeta;
	const RenderUnion = UnionRenderer ?? UnionFieldHandler;

	if (uiHidden) {
		return null;
	}

	if (fieldMeta.kind === "object" && fieldMeta.children) {
		return (
			<layout.ObjectField fieldMeta={fieldMeta}>
				{fieldMeta.children.map((child) => (
					<AutoFormField
						adapter={adapter}
						fieldMeta={child}
						form={form}
						key={child.path}
						registry={registry}
						unionFieldRenderer={UnionRenderer}
					/>
				))}
			</layout.ObjectField>
		);
	}

	if (fieldMeta.kind === "array" && fieldMeta.itemMeta) {
		const itemMeta = fieldMeta.itemMeta;
		const values = (form?.values[path] as unknown[]) ?? [];
		const items = values.map((_val, index) => {
			const indexedMeta: FieldMeta = {
				...itemMeta,
				path: `${path}[${index}]`,
			};
			return (
				<AutoFormField
					adapter={adapter}
					fieldMeta={indexedMeta}
					form={form}
					key={indexedMeta.path}
					registry={registry}
					unionFieldRenderer={UnionRenderer}
				/>
			);
		});

		return (
			<layout.ArrayField
				fieldMeta={fieldMeta}
				onAdd={() =>
					form?.appendFieldValue(path, getDefaultForType(itemMeta.type))
				}
				onRemove={(index) => form?.removeFieldValue(path, index)}
			>
				{items}
			</layout.ArrayField>
		);
	}

	if (fieldMeta.kind === "union" && fieldMeta.variants) {
		const renderChild = (childMeta: FieldMeta) => (
			<AutoFormField
				adapter={adapter}
				fieldMeta={childMeta}
				form={form}
				key={childMeta.path}
				registry={registry}
				unionFieldRenderer={UnionRenderer}
			/>
		);

		return (
			<RenderUnion
				adapter={adapter}
				fieldMeta={fieldMeta}
				form={form}
				key={fieldMeta.path}
				registry={registry}
				renderChild={renderChild}
				unionFieldRenderer={UnionRenderer}
			/>
		);
	}

	const Component = registry.resolve(fieldMeta);

	return (
		<adapter.Field name={path}>
			{(field) => (
				<Component
					className={fieldMeta.uiReadonly ? "opacity-50" : ""}
					disabled={fieldMeta.uiReadonly}
					error={field.error}
					field={fieldMeta}
					id={path}
					key={path}
					label={label}
					onChange={(val: unknown) => field.onChange(val)}
					placeholder={placeholder}
					value={field.value}
				/>
			)}
		</adapter.Field>
	);
}
