import { describe, it, expectTypeOf } from "vitest";
import type { ZodProvider } from "../src/zod-provider";
import type { SchemaProvider } from "@code2-base-ui/auto-form";
import type { z } from "zod";

describe("ZodProvider types", () => {
  it("implements SchemaProvider", () => {
    type Provider = ZodProvider<z.ZodObject<{ name: z.ZodString }>>;
    expectTypeOf<Provider>().toMatchTypeOf<SchemaProvider>();
  });
});
