// =============================================================================
// AutoForm — Types
// =============================================================================

import type * as Type from "@sinclair/typebox";
import type {
  FormAsyncValidateOrFn,
  FormOptions,
  FormValidateOrFn,
  ReactFormExtendedApi,
  useForm,
} from "@tanstack/react-form";
import type { ReactNode } from "react";
import type { SchemaAdapter } from "../../adapters";
import type { JsonSchema } from "../../core/types";
import type { FieldRegistry } from "../../registry";

export type TObject = Type.TObject;
// Omit<Type.TObject, "required"> & {
// 	title?: string
// 	description?: string
// 	required?: string[]
// }

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
  /** Schéma JSON brut. */
  schema: TData;
  /** Adaptateur pour la validation et conversion (Zod, Valibot...). */
  adapter?: SchemaAdapter<any>;
  /** Registre des composants UI. */
  registry?: FieldRegistry;
  /** Classes CSS additionnelles pour le formulaire. */
  className?: string;
  /** Enfants optionnels (ex: boutons custom). */
  children?: ReactNode;
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
  >,
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
