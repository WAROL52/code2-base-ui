// =============================================================================
// AutoForm — Types
// =============================================================================

import type { FieldRegistry } from "@code2-base-ui/json-schema-toolkit";
import type * as Type from "@code2-base-ui/json-schema-toolkit/typebox";
import type {
	FormApi,
	FormAsyncValidateOrFn,
	FormOptions,
	FormValidateOrFn,
	ReactFormApi,
} from "@tanstack/react-form";
import type { ReactNode } from "react";

export type ReactFormExtendedApi<
	TFormData,
	TOnMount extends undefined | FormValidateOrFn<TFormData>,
	TOnChange extends undefined | FormValidateOrFn<TFormData>,
	TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
	TOnBlur extends undefined | FormValidateOrFn<TFormData>,
	TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
	TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
	TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
	TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
	TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
	TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
	TSubmitMeta,
> = FormApi<
	TFormData,
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
> &
	ReactFormApi<
		TFormData,
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

export type TObject = Type.TObject;

export interface AutoFormProps<
	TData extends TObject,
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
> extends Omit<
		UseFormHookOption<
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
		>,
		""
	> {
	/** Enfants optionnels (ex: boutons custom). */
	children?: ReactNode;
	/** Classes CSS additionnelles pour le formulaire. */
	className?: string;
	/** Registre des composants UI. */
	registry: FieldRegistry;
	/** Schéma JSON brut. */
	schema: TData;
}

export type UseFormHookOption<
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
> = FormOptions<
	Type.Static<TData>,
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
export type UseFormHookReturn<
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
> = ReactFormExtendedApi<
	Type.Static<TData>,
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

export type UseFormHook<
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
> = (
	opts?: UseFormHookOption<
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
	>
) => UseFormHookReturn<
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
