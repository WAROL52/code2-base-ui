// =============================================================================
// AutoFormField — Rendu récursif des champs
// =============================================================================

import type { SchemaProvider } from "@code2-base-ui/auto-form";
import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";
import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@code2-base-ui/ui";
import type * as Type from "@sinclair/typebox";
import type {
	FormAsyncValidateOrFn,
	FormValidateOrFn,
} from "@tanstack/react-form";
import type { FieldMeta } from "./core/types";
// import { defaultRegistry, type FieldRegistry } from "./registry";
import type { TObject, UseFormHookReturn } from "./types";

export interface AutoFormFieldProps<
	TData extends TObject = TObject,
	TOnMount extends undefined | FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnChange extends
		| undefined
		| FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnChangeAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TOnBlur extends undefined | FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnBlurAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TOnSubmit extends
		| undefined
		| FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnSubmitAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TOnDynamic extends
		| undefined
		| FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnDynamicAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TOnServer extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TSubmitMeta = undefined,
> {
	adapter: SchemaProvider;
	fieldMeta: FieldMeta;
	form: UseFormHookReturn<
		TData,
		TOnMount,
		TOnChange,
		TOnChangeAsync,
		TOnBlur,
		TOnBlurAsync,
		TOnSubmit,
		TOnSubmitAsync,
		TOnDynamic,
		TOnDynamicAsync,
		TOnServer,
		TSubmitMeta
	>;
	registry: FieldRegistry;
}

export function AutoFormField<
	TData extends TObject = TObject,
	TOnMount extends undefined | FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnChange extends
		| undefined
		| FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnChangeAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TOnBlur extends undefined | FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnBlurAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TOnSubmit extends
		| undefined
		| FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnSubmitAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TOnDynamic extends
		| undefined
		| FormValidateOrFn<Type.Static<TData>> = undefined,
	TOnDynamicAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TOnServer extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<TData>> = undefined,
	TSubmitMeta = undefined,
>({
	fieldMeta,
	form,
	adapter,
	registry,
}: AutoFormFieldProps<
	TData,
	TOnMount,
	TOnChange,
	TOnChangeAsync,
	TOnBlur,
	TOnBlurAsync,
	TOnSubmit,
	TOnSubmitAsync,
	TOnDynamic,
	TOnDynamicAsync,
	TOnServer,
	TSubmitMeta
>) {
	const { path, label, description, uiHidden, resolvedSchema, placeholder } =
		fieldMeta;

	if (uiHidden) {
		return null;
	}

	// Si c'est un objet, on rend les enfants récursivement
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
							form={form}
							key={child.path}
							registry={registry}
						/>
					))}
				</FieldGroup>
			</FieldSet>
		);
	}

	// Pour les types primitifs, on utilise le registre
	const Component = registry.resolve(fieldMeta);

	return (
		<form.Field
			name={path}
			validators={{
				onChange: ({ value }: { value: unknown }) => {
					const nativeSchema = adapter.fromJsonSchema(resolvedSchema);
					const result = adapter.validate(nativeSchema, value);
					return result.success ? undefined : result.errors?.[0]?.message;
				},
			}}
		>
			{(field) => (
				<Component
					className={fieldMeta.uiReadonly ? "opacity-50" : ""}
					disabled={fieldMeta.uiReadonly}
					error={field.state.meta.errors?.[0]?.toString()}
					field={fieldMeta}
					id={path}
					key={path}
					label={label}
					// biome-ignore lint/suspicious/noExplicitAny: this is a generic component, so we can't type the value here
					onChange={(val: any) => field.handleChange(val)}
					placeholder={placeholder}
					value={field.state.value}
				/>
			)}
		</form.Field>
	);
}
