// =============================================================================
// Standard Registry Helpers
// =============================================================================
import type { FieldRegistry } from "./field-registry";
import type { FieldComponent } from "./types";

export interface StandardComponents {
  Input: FieldComponent<string>;
  NumberInput: FieldComponent<number>;
  Checkbox: FieldComponent<boolean>;
  Switch?: FieldComponent<boolean>;
  Textarea?: FieldComponent<string>;
  Select?: FieldComponent;
  DatePicker?: FieldComponent<Date>;
}

/**
 * Configure un registre avec des composants standards.
 */
export function setupStandardRegistry<
  T extends StandardComponents = StandardComponents,
>(registry: FieldRegistry, components: T): void {
  // Primitives
  registry.register({ type: "string" }, components.Input, 0);
  registry.register({ type: "number" }, components.NumberInput, 0);
  registry.register({ type: "integer" }, components.NumberInput, 0);
  registry.register({ type: "boolean" }, components.Checkbox, 0);

  // Formats
  if (components.DatePicker) {
    registry.register({ format: "date" }, components.DatePicker, 10);
    registry.register({ format: "date-time" }, components.DatePicker, 10);
  }

  // Widgets
  if (components.Textarea) {
    registry.register({ widget: "textarea" }, components.Textarea, 20);
  }

  // Fallback
  registry.setFallback(components.Input);
}
