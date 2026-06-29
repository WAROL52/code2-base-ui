// =============================================================================
// AutoForm — Composant Principal
// =============================================================================

import type * as Type from "@code2-base-ui/json-schema-toolkit/typebox";
import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSet,
} from "@code2-base-ui/ui/components/field";
import type {
	FormAsyncValidateOrFn,
	FormValidateOrFn,
} from "@tanstack/react-form";
import { AutoFormBuilder } from "./auto-form-builder";
import { AutoFormField } from "./auto-form-field";
import type { AutoFormProps, TObject } from "./types";

export function AutoForm<
	T extends TObject,
	TOnMount extends undefined | FormValidateOrFn<Type.Static<T>> = undefined,
	TOnChange extends undefined | FormValidateOrFn<Type.Static<T>> = undefined,
	TOnChangeAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<T>> = undefined,
	TOnBlur extends undefined | FormValidateOrFn<Type.Static<T>> = undefined,
	TOnBlurAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<T>> = undefined,
	TOnSubmit extends undefined | FormValidateOrFn<Type.Static<T>> = undefined,
	TOnSubmitAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<T>> = undefined,
	TOnDynamic extends undefined | FormValidateOrFn<Type.Static<T>> = undefined,
	TOnDynamicAsync extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<T>> = undefined,
	TOnServer extends
		| undefined
		| FormAsyncValidateOrFn<Type.Static<T>> = undefined,
	TSubmitMeta = undefined,
>({
	schema,
	registry,
	defaultValues,
	onSubmit,
	className,
	children,
}: AutoFormProps<
	T,
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
	return (
		<AutoFormBuilder<
			T,
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
		>
			defaultValues={defaultValues}
			onSubmit={onSubmit}
			schema={schema}
		>
			{({ form, fields }) => {
				const renderSubmit = () => {
					if (children) {
						return children;
					}
					return (
						<button
							className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
							type="submit"
						>
							Envoyer
						</button>
					);
				};
				return (
					<form
						className={className}
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<FieldSet>
							{schema.title && (
								<FieldLegend className="mb-2">{schema.title}</FieldLegend>
							)}
							{schema.description && (
								<FieldDescription>{schema.description}</FieldDescription>
							)}
							<FieldGroup>
								{fields.map((field) => (
									<AutoFormField<
										T,
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
									>
										fieldMeta={field}
										form={form}
										key={field.path}
										registry={registry}
									/>
								))}
							</FieldGroup>
						</FieldSet>
						{renderSubmit()}
					</form>
				);
			}}
		</AutoFormBuilder>
	);
}
