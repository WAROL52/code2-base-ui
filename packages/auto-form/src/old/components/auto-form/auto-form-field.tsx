// =============================================================================
// AutoFormField — Rendu récursif des champs
// =============================================================================

import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@code-base-ui/ui";
import type * as Type from "@sinclair/typebox";
import type { FormAsyncValidateOrFn, FormValidateOrFn } from "@tanstack/react-form";
import type React from "react";
import type { SchemaAdapter } from "../../adapters";
import type { FieldMeta } from "../../core/types";
import { defaultRegistry, type FieldRegistry } from "../../registry";
import type { TObject, UseFormHookReturn } from "./types";

export type AutoFormFieldProps<
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
> = {
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
  adapter: SchemaAdapter;
  registry?: FieldRegistry;
};

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
  registry = defaultRegistry,
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

  if (uiHidden) return null;

  // Si c'est un objet, on rend les enfants récursivement
  if (fieldMeta.kind === "object" && fieldMeta.children) {
    return (
      <FieldSet className="border-l pl-4">
        {label && <FieldLegend className="mb-2">{label}</FieldLegend>}
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldGroup>
          {fieldMeta.children.map((child) => (
            <AutoFormField
              key={child.path}
              fieldMeta={child}
              form={form}
              adapter={adapter}
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
      name={path as any}
      validators={{
        onChange: ({ value }: { value: unknown }) => {
          const nativeSchema = adapter.fromJsonSchema(resolvedSchema);
          const result = adapter.validate(nativeSchema, value);
          return result.success ? undefined : result.errors?.[0]?.message;
        },
      }}
    >
      {(field: any) => (
        <Component
          field={fieldMeta}
          id={path}
          key={path}
          value={field.state.value}
          onChange={(val: unknown) => field.handleChange(val)}
          error={field.state.meta.errors?.[0]?.toString()}
          disabled={fieldMeta.uiReadonly}
          className={fieldMeta.uiReadonly ? "opacity-50" : ""}
          label={label}
          placeholder={placeholder}
        />
      )}
    </form.Field>
  );
}
