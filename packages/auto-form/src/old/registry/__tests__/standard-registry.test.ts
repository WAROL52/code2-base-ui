// =============================================================================
// Tests — Standard Registry
// =============================================================================
import { describe, expect, it } from "vitest";
import type { FieldMeta } from "../../core/types";
import { FieldRegistry } from "../field-registry";
import {
  type StandardComponents,
  setupStandardRegistry,
} from "../standard-registry";

describe("setupStandardRegistry", () => {
  const comps: StandardComponents = {
    Input: () => null,
    NumberInput: () => null,
    Checkbox: () => null,
    DatePicker: () => null,
    Textarea: () => null,
  };

  it("doit configurer les types de base", () => {
    const registry = new FieldRegistry();
    setupStandardRegistry(registry, comps);

    expect(
      registry.resolve({ type: "string", path: "s" } as unknown as FieldMeta),
    ).toBe(comps.Input);
    expect(
      registry.resolve({ type: "number", path: "n" } as unknown as FieldMeta),
    ).toBe(comps.NumberInput);
    expect(
      registry.resolve({ type: "boolean", path: "b" } as unknown as FieldMeta),
    ).toBe(comps.Checkbox);
  });

  it("doit configurer les formats et widgets", () => {
    const registry = new FieldRegistry();
    setupStandardRegistry(registry, comps);

    expect(
      registry.resolve({
        type: "string",
        format: "date",
        path: "d",
      } as unknown as FieldMeta),
    ).toBe(comps.DatePicker);
    expect(
      registry.resolve({
        type: "string",
        uiWidget: "textarea",
        path: "t",
      } as unknown as FieldMeta),
    ).toBe(comps.Textarea);
  });

  it("doit fonctionner avec des composants optionnels manquants", () => {
    const registry = new FieldRegistry();
    setupStandardRegistry(registry, {
      Input: comps.Input,
      NumberInput: comps.NumberInput,
      Checkbox: comps.Checkbox,
    });

    expect(
      registry.resolve({
        type: "string",
        format: "date",
        path: "d",
      } as unknown as FieldMeta),
    ).toBe(comps.Input); // Fallback
  });
});
