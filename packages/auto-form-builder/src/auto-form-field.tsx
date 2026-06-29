"use client";

import type {
	FieldMeta,
	FieldRegistry,
} from "@code2-base-ui/json-schema-toolkit";
import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@code2-base-ui/ui/components/field";
import type { FormAdapter } from "./adapters/types";

export interface AutoFormFieldProps {
	adapter: FormAdapter;
	fieldMeta: FieldMeta;
	registry: FieldRegistry;
}

export function AutoFormField({
	fieldMeta,
	adapter,
	registry,
}: AutoFormFieldProps) {
	const { path, label, description, uiHidden, placeholder } = fieldMeta;

	if (uiHidden) {
		return null;
	}

	if (fieldMeta.kind === "object" && fieldMeta.children) {
		return (
			<FieldSet className="border-l pl-4">
				{label && <FieldLegend className="mb-2">{label}</FieldLegend>}
				{description && <FieldDescription>{description}</FieldDescription>}
				<FieldGroup>
					{fieldMeta.children.map((child) => (
						<AutoFormField
							adapter={adapter}
							fieldMeta={child}
							key={child.path}
							registry={registry}
						/>
					))}
				</FieldGroup>
			</FieldSet>
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
