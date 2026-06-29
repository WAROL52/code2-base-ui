// =============================================================================
// Tests — Field Registry
// =============================================================================
import { describe, expect, it } from "vitest";
import type { FieldMeta } from "../../core/types";
import { FieldRegistry } from "../field-registry";

describe("FieldRegistry", () => {
  const MockComponent = () => null;
  const FallbackComponent = () => null;
  const CustomComponent = () => null;

  it("doit enregistrer et résoudre par type", () => {
    const registry = new FieldRegistry();
    registry.register({ type: "string" }, MockComponent);

    const field = { type: "string", path: "test" } as unknown as FieldMeta;
    expect(registry.resolve(field)).toBe(MockComponent);
  });

  it("doit privilégier le widget sur le type via priorité", () => {
    const registry = new FieldRegistry();
    registry.register({ type: "string" }, MockComponent, 1);
    registry.register({ widget: "password" }, CustomComponent, 10);

    const field = {
      type: "string",
      path: "test",
      uiWidget: "password",
    } as unknown as FieldMeta;

    expect(registry.resolve(field)).toBe(CustomComponent);
  });

  it("doit gérer les non-correspondances de widget, format et type", () => {
    const registry = new FieldRegistry();
    registry.register({ widget: "text" }, CustomComponent);
    registry.register({ format: "email" }, CustomComponent);
    registry.register({ type: "number" }, CustomComponent);
    registry.setFallback(FallbackComponent);

    // Widget mismatch
    expect(
      registry.resolve({
        type: "string",
        path: "a",
        uiWidget: "other",
      } as unknown as FieldMeta),
    ).toBe(FallbackComponent);
    // Format mismatch
    expect(
      registry.resolve({
        type: "string",
        format: "date",
        path: "b",
      } as unknown as FieldMeta),
    ).toBe(FallbackComponent);
    // Type mismatch
    expect(
      registry.resolve({ type: "boolean", path: "c" } as unknown as FieldMeta),
    ).toBe(FallbackComponent);
  });

  it("doit respecter la priorité si plusieurs sélecteurs matchent", () => {
    const registry = new FieldRegistry();
    registry.register({ type: "string" }, MockComponent, 1);
    registry.register({ type: "string", format: "email" }, CustomComponent, 2);

    const field = {
      type: "string",
      format: "email",
      path: "test",
    } as unknown as FieldMeta;

    expect(registry.resolve(field)).toBe(CustomComponent);
  });

  it("doit utiliser le fallback si aucun match", () => {
    const registry = new FieldRegistry();
    registry.setFallback(FallbackComponent);

    const field = { type: "unknown", path: "test" } as unknown as FieldMeta;
    expect(registry.resolve(field)).toBe(FallbackComponent);
  });

  it("doit lever une erreur si aucun match et pas de fallback", () => {
    const registry = new FieldRegistry();
    const field = { type: "unknown", path: "test" } as unknown as FieldMeta;
    expect(() => registry.resolve(field)).toThrow("Aucun composant enregistré");
  });

  it("doit ignorer les sélecteurs vides", () => {
    const registry = new FieldRegistry();
    registry.register({} as any, CustomComponent);

    const field = { type: "string", path: "test" } as unknown as FieldMeta;
    expect(() => registry.resolve(field)).toThrow();
  });

  it("clear() doit vider le registre", () => {
    const registry = new FieldRegistry();
    registry.register({ type: "string" }, MockComponent);
    registry.clear();
    const field = { type: "string", path: "test" } as unknown as FieldMeta;
    expect(() => registry.resolve(field)).toThrow();
  });
});
