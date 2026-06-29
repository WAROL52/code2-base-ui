// =============================================================================
// AutoForm — Composant Principal
// =============================================================================

import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@code-base-ui/ui";
import type * as Type from "@sinclair/typebox";
import type { FormAsyncValidateOrFn, FormValidateOrFn } from "@tanstack/react-form";
import { defaultSchemaAdapter } from "../../adapters";
import { AutoFormBuilder } from "./auto-form-builder";
import { AutoFormField } from "./auto-form-field";
import type { AutoFormProps, TObject, UseFormHookReturn } from "./types";

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
  adapter = defaultSchemaAdapter,
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
      onSubmit={onSubmit}
      defaultValues={defaultValues}
      schema={schema}
    >
      {({ form, fields }) => {
        const renderSubmit = () => {
          if (children) return children;
          return (
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
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
                    key={field.path}
                    fieldMeta={field}
                    form={form}
                    adapter={adapter}
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
