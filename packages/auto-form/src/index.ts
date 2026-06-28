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
  useFormContext,
  useFieldContext,
  FieldProvider,
  type FormContextValue,
} from "./core/context";
