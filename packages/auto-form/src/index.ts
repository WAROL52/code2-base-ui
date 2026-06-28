export { createAutoForm } from "./core/factory";

export type {
  SchemaProvider,
  SchemaProviderFactory,
  FormStateAdapter,
  FormAPI,
  FieldController,
  AutoFormProps,
  LayoutStrategy,
} from "./core/types";

export {
  AutoFormProvider,
  AutoFormContextProvider,
  useFormContext,
  useAutoFormContext,
  useFieldContext,
  FieldProvider,
  type FormContextValue,
  type AutoFormContextValue,
} from "./core/context";
