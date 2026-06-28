import { describe, it, expect } from "vitest";
import { InputField } from "../../src/components/input-field";
import { createShadcnRegistry } from "../../src/shadcn-registry";
import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";

describe("InputField", () => {
  it("is a valid React component", () => {
    expect(InputField).toBeInstanceOf(Function);
  });

  it("is resolved by the registry for string type", () => {
    const registry = createShadcnRegistry();
    const field: FieldMeta = { path: "name", type: "string" };
    const component = registry.resolve(field);
    expect(component).toBe(InputField);
  });

  it("is resolved by the registry for email format", () => {
    const registry = createShadcnRegistry();
    const field: FieldMeta = { path: "email", type: "string", format: "email" };
    const component = registry.resolve(field);
    expect(component).toBe(InputField);
  });
});
