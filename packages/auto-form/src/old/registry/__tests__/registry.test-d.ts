// =============================================================================
// Type Testing — Registry
// =============================================================================

import type React from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { FieldComponent, FieldComponentProps } from "../types";

describe("Registry Type Safety", () => {
  it("FieldComponent doit être compatible avec React.ComponentType", () => {
    type Expected = React.ComponentType<FieldComponentProps>;
    expectTypeOf<FieldComponent>().toMatchTypeOf<Expected>();
  });

  it("FieldComponentProps doit avoir les propriétés obligatoires", () => {
    type Props = FieldComponentProps<string>;
    expectTypeOf<Props>().toHaveProperty("field");
    expectTypeOf<Props>().toHaveProperty("value");
    expectTypeOf<Props>().toHaveProperty("onChange");
    expectTypeOf<Props>().toHaveProperty("id");
    expectTypeOf<Props>().toHaveProperty("className");
  });

  it("FieldComponentProps doit accepter des props additionnelles via P", () => {
    type CustomProps = { customLabel: string };
    type Props = FieldComponentProps<string, CustomProps>;

    expectTypeOf<Props>().toHaveProperty("customLabel");
    expectTypeOf<Props["customLabel"]>().toBeString();
  });
});
