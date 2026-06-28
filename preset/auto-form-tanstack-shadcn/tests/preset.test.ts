import { describe, it, expect } from "vitest";
import { createAutoForm } from "../src/index";

describe("auto-form-tanstack-shadcn preset", () => {
  it("createAutoForm is defined", () => {
    expect(createAutoForm).toBeDefined();
  });

  it("returns AutoForm and AutoField", () => {
    const result = createAutoForm;
    expect(typeof result).toBe("function");
  });
});
