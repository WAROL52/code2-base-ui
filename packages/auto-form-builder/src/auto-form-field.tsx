// =============================================================================
// AutoFormField — Rendu récursif des champs
// =============================================================================

import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";
import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@code2-base-ui/ui/components/field";
import type * as Type from "@code2-base-ui/json-schema-toolkit/typebox";
import type {
	FormAsyncValidateOrFn,
	FormValidateOrFn,
} from "@tanstack/react-form";
import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";
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
	const { path, label, description, uiHidden, placeholder } =
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
		<form.Field name={path}>
			{(field) => (
				<Component
					className={fieldMeta.uiReadonly ? "opacity-50" : ""}
					disabled={fieldMeta.uiReadonly}
					error={field.state.meta.errors?.[0] as string | undefined}
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
