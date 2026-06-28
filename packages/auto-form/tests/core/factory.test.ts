import { describe, it, expectTypeOf } from "vitest";
import type { createAutoForm } from "../../src/core/factory";

describe("createAutoForm types", () => {
  it("returns the correct set of keys", () => {
    type Result = ReturnType<typeof createAutoForm>;
    type Keys = keyof Result;
    expectTypeOf<Keys>().toEqualTypeOf<
      "useForm" | "useField" | "AutoForm" | "AutoField" | "AutoFormProvider"
    >();
  });

  it("returns function properties", () => {
    type Result = ReturnType<typeof createAutoForm>;
    expectTypeOf<Result["useForm"]>().toMatchTypeOf<() => unknown>();
    expectTypeOf<Result["useField"]>().toMatchTypeOf<(name: string) => unknown>();
    expectTypeOf<Result["AutoField"]>().toMatchTypeOf<(props: { name: string }) => unknown>();
  });
});
