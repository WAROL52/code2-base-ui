import { describe, it, expect } from "vitest";
import { createShadcnRegistry } from "../src/shadcn-registry";
import { FieldRegistry } from "@code2-base-ui/json-schema-toolkit/registry";
import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";

describe("createShadcnRegistry", () => {
  it("returns a FieldRegistry instance", () => {
    const registry = createShadcnRegistry();
    expect(registry).toBeInstanceOf(FieldRegistry);
  });

  it("resolves a component for string type", () => {
    const registry = createShadcnRegistry();
    const field: FieldMeta = { path: "name", type: "string", label: "Name" };
    const component = registry.resolve(field);
    expect(component).toBeDefined();
  });

  it("resolves a component for boolean type", () => {
    const registry = createShadcnRegistry();
    const field: FieldMeta = { path: "active", type: "boolean", label: "Active" };
    const component = registry.resolve(field);
    expect(component).toBeDefined();
  });

  it("resolves a component for email format", () => {
    const registry = createShadcnRegistry();
    const field: FieldMeta = { path: "email", type: "string", format: "email", label: "Email" };
    const component = registry.resolve(field);
    expect(component).toBeDefined();
  });

  it("resolves a component for number type", () => {
    const registry = createShadcnRegistry();
    const field: FieldMeta = { path: "age", type: "number", label: "Age" };
    const component = registry.resolve(field);
    expect(component).toBeDefined();
  });

  it("resolves different components for different field types", () => {
    const registry = createShadcnRegistry();
    const stringField: FieldMeta = { path: "name", type: "string", label: "Name" };
    const boolField: FieldMeta = { path: "active", type: "boolean", label: "Active" };
    const stringComp = registry.resolve(stringField);
    const boolComp = registry.resolve(boolField);
    expect(stringComp).not.toBe(boolComp);
  });
});
