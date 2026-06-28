import { describe, it, expect, beforeEach } from "vitest";
import { FieldRegistry } from "../../src/registry/field-registry";
import type { FieldMeta } from "../../src/types";
import React from "react";

describe("FieldRegistry", () => {
  let registry: FieldRegistry;
  const StringField = (props: { label?: string }) => React.createElement("input", props);

  beforeEach(() => {
    registry = new FieldRegistry();
  });

  it("registers and resolves a component by type", () => {
    registry.register({ type: "string" }, StringField);
    const result = registry.resolve({ path: "name", type: "string", label: "Name" });
    expect(result).toBe(StringField);
  });

  it("resolves by format with higher priority", () => {
    registry.register({ type: "string" }, StringField, 0);
    registry.register({ type: "string", format: "email" }, StringField, 10);
    const field: FieldMeta = { path: "email", type: "string", format: "email", label: "Email" };
    expect(registry.resolve(field)).toBe(StringField);
  });

  it("throws when no match and no fallback", () => {
    expect(() => {
      registry.resolve({ path: "x", type: "unknown", label: "X" });
    }).toThrow("Aucun composant enregistré");
  });

  it("uses fallback when no match", () => {
    registry.setFallback(StringField);
    const result = registry.resolve({ path: "x", type: "unknown", label: "X" });
    expect(result).toBe(StringField);
  });

  it("clears all entries", () => {
    registry.register({ type: "string" }, StringField);
    registry.clear();
    expect(() => registry.resolve({ path: "x", type: "string", label: "X" })).toThrow();
  });

  it("matches by widget", () => {
    registry.register({ widget: "textarea" }, StringField);
    const field: FieldMeta = { path: "bio", type: "string", uiWidget: "textarea", label: "Bio" };
    expect(registry.resolve(field)).toBe(StringField);
  });
});