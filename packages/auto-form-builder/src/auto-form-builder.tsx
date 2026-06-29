"use client";

import {
	type FieldMeta,
	type ResolvedSchema,
	resolveSchema,
	traverseSchema,
} from "@code2-base-ui/json-schema-toolkit";
import type * as Type from "@code2-base-ui/json-schema-toolkit/typebox";
import {
	type FormAsyncValidateOrFn,
	type FormValidateOrFn,
	useForm,
} from "@tanstack/react-form";
import { useMemo } from "react";
import type { TObject, UseFormHookOption, UseFormHookReturn } from "./types";

export interface AutoFormBuilderChildrenProps<
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
> {
	fields: FieldMeta[];
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
	resolvedSchema: ResolvedSchema;
}

export type AutoFormBuilderProps<
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
> = UseFormHookOption<
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
> & {
	className?: string;
	schema: TData;
	children: (
		props: AutoFormBuilderChildrenProps<
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
	) => React.ReactNode;
};

export function AutoFormBuilder<
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
>(
	props: AutoFormBuilderProps<
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
) {
	const { schema, children, className, ...formOptions } = props;
	// 1. Résoudre le schéma ($ref, allOf...)
	const resolvedSchema = useMemo(() => resolveSchema(schema), [schema]);

	// 2. Générer les métadonnées de champs
	const fields = useMemo(
		() => traverseSchema(resolvedSchema),
		[resolvedSchema]
	);

	// 3. Initialiser TanStack Form
	const form = useForm(formOptions);

	return (
		<div className={className}>
			{children({ form, fields, resolvedSchema })}
		</div>
	);
}
