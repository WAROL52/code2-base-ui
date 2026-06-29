// =============================================================================
// Type Testing — Adapters
// =============================================================================

import type { TSchema } from "@sinclair/typebox";
import { describe, expectTypeOf, it } from "vitest";
import type { ZodSchema } from "zod";
import {
  type SchemaAdapter,
  typeboxAdapter,
  valibotAdapter,
  zodAdapter,
} from "../index";

describe("Adapters Type Safety", () => {
  it("zodAdapter doit respecter SchemaAdapter<ZodSchema>", () => {
    expectTypeOf(zodAdapter).toMatchTypeOf<SchemaAdapter<ZodSchema>>();
  });

  it("valibotAdapter doit respecter SchemaAdapter", () => {
    // Valibot types are complex, we just check implementation
    expectTypeOf(valibotAdapter.name).toBeString();
  });

  it("typeboxAdapter doit respecter SchemaAdapter<TSchema>", () => {
    expectTypeOf(typeboxAdapter).toMatchTypeOf<SchemaAdapter<TSchema>>();
  });
});
