# json-schema-toolkit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `@code2-base-ui/json-schema-toolkit` package — a library of copy-paste JSON Schema utilities conforming to Standard Schema, with TypeBox integration, FieldRegistry, and SchemaAdapter interface.

**Architecture:** Single Nx package (`packages/json-schema-toolkit`) with `@code2-base-ui/json-schema-toolkit` scope. Uses TypeBox for typed schema definition, `@standard-schema/spec` for validation standard, vitest with `expectTypeOf` for type-first TDD.

**Tech Stack:** `@sinclair/typebox`, `@standard-schema/spec`, vitest, TypeScript 6, React 19 types (for FieldRegistry).

## Global Constraints

- `verbatimModuleSyntax: true` — always `import type` for types
- `noUncheckedIndexedAccess: true` — array/index access always `| undefined`
- Indentation: tabs
- Quotes: double
- No barrel files — import directly from source files
- All types need JSDoc comments
- Type-first TDD: write `expectTypeOf` tests before any runtime implementation
- Package is universal (browser + server), except `registry/` which is React-only

---

### Task 1: Scaffold the package

**Files:**
- Create: `packages/json-schema-toolkit/package.json`
- Create: `packages/json-schema-toolkit/tsconfig.json`
- Create: `packages/json-schema-toolkit/vitest.config.ts`
- Create: `packages/json-schema-toolkit/tests/types.test.ts` (stub)
- Create: `packages/json-schema-toolkit/src/index.ts` (stub)
- Create: `packages/json-schema-toolkit/.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces: the package scaffold that all later tasks build on

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@code2-base-ui/json-schema-toolkit",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./core": "./src/core/index.ts",
    "./utils": "./src/utils/index.ts",
    "./registry": "./src/registry/index.ts",
    "./adapter": "./src/adapter/index.ts"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@sinclair/typebox": "^0.34.0",
    "@standard-schema/spec": "^1.1.0"
  },
  "peerDependencies": {
    "react": "^19.2.6"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "devDependencies": {
    "@code2-base-ui/config": "workspace:*",
    "typescript": "catalog:",
    "vitest": "^3.1.0",
    "@types/react": "catalog:"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "@code2-base-ui/config/tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ESNext", "DOM"],
    "jsx": "react-jsx",
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules
dist
*.tsbuildinfo
```

- [ ] **Step 5: Create stub files**

`src/index.ts`:
```ts
export {};
```

`tests/types.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("types", () => {
  it("passes placeholder", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 6: Install dependencies and verify**

```bash
pnpm install
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: PASS (placeholder test)

- [ ] **Step 7: Commit**

```bash
git add packages/json-schema-toolkit/
git commit -m "feat: scaffold json-schema-toolkit package"
```

---

### Task 2: Define core types + type tests

**Files:**
- Create: `packages/json-schema-toolkit/src/types.ts`
- Modify: `packages/json-schema-toolkit/tests/types.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `JsonSchema`, `ValidationResult`, `ValidationError`, `FieldMeta`, `GroupCriteria`, `RegistrySelector`, `FieldComponent`, `RegistryEntry`

- [ ] **Step 1: Write the type tests first (`tests/types.test.ts`)**

```ts
import { describe, it, expectTypeOf } from "vitest";
import type { JsonSchema, ValidationResult, ValidationError, FieldMeta, GroupCriteria, RegistrySelector, FieldComponent, RegistryEntry } from "../src/types";

describe("core types", () => {
  it("JsonSchema allows standard properties", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
    };
    expectTypeOf(schema).toMatchTypeOf<JsonSchema>();
  });

  it("JsonSchema allows additional properties", () => {
    const schema: JsonSchema = {
      type: "string",
      format: "email",
      description: "User email",
    };
    expectTypeOf(schema).toMatchTypeOf<JsonSchema>();
  });

  it("ValidationResult has success and errors", () => {
    const result: ValidationResult = { success: true, errors: [] };
    expectTypeOf(result.success).toBeBoolean();
    expectTypeOf(result.errors).toBeArray();
  });

  it("ValidationError has path and message", () => {
    const error: ValidationError = { path: "name", message: "Required" };
    expectTypeOf(error.path).toBeString();
    expectTypeOf(error.message).toBeString();
  });

  it("FieldMeta has required fields", () => {
    const meta: FieldMeta = {
      path: "user.name",
      type: "string",
      format: "email",
      required: true,
      description: "User's full name",
    };
    expectTypeOf(meta.path).toBeString();
    expectTypeOf(meta.type).toBeString();
    expectTypeOf(meta.format).toEqualTypeOf<string | undefined>();
  });

  it("GroupCriteria accepts 'type' string", () => {
    const criteria: GroupCriteria = { by: "type" };
    expectTypeOf(criteria).toMatchTypeOf<GroupCriteria>();
  });

  it("GroupCriteria accepts a function", () => {
    const criteria: GroupCriteria = { by: (field: FieldMeta) => field.type };
    expectTypeOf(criteria).toMatchTypeOf<GroupCriteria>();
  });
});

describe("registry types", () => {
  it("RegistrySelector has optional fields", () => {
    const selector: RegistrySelector = { type: "string", format: "email" };
    expectTypeOf(selector.type).toEqualTypeOf<string | undefined>();
  });

  it("FieldComponent is a React component type", () => {
    const Comp: FieldComponent<{ label: string }> = (props: { label: string }) => null;
    expectTypeOf(Comp).toMatchTypeOf<FieldComponent>();
  });

  it("RegistryEntry has selector, component and priority", () => {
    const entry: RegistryEntry = {
      selector: { type: "string" },
      component: () => null,
      priority: 1,
    };
    expectTypeOf(entry.priority).toBeNumber();
  });
});
```

- [ ] **Step 2: Run tests — should fail (types not defined yet)**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: FAIL — cannot find types module

- [ ] **Step 3: Create `src/types.ts`**

```ts
/**
 * A generic JSON Schema object, loosely typed for flexibility.
 * Supports all standard JSON Schema properties plus custom ones.
 */
export interface JsonSchema {
  type?: string | string[];
  format?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: unknown[];
  const?: unknown;
  description?: string;
  default?: unknown;
  [key: string]: unknown;
}

/**
 * Result of a schema validation.
 */
export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
}

/**
 * A single validation error.
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * Metadata for a single field extracted from a JSON Schema.
 */
export interface FieldMeta {
  path: string;
  type: string;
  format?: string;
  uiWidget?: string;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
  enum?: unknown[];
  properties?: Record<string, FieldMeta>;
}

/**
 * Criteria for grouping fields.
 */
export interface GroupCriteria {
  by: "type" | "format" | "required" | ((field: FieldMeta) => string);
}

/**
 * Selector used to match a field to a registered component.
 */
export interface RegistrySelector {
  type?: string;
  format?: string;
  widget?: string;
}

/**
 * A React component that renders a field.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldComponent<TProps = Record<string, any>> = React.ComponentType<TProps>;

/**
 * An entry in the FieldRegistry.
 */
export interface RegistryEntry {
  selector: RegistrySelector;
  component: FieldComponent;
  priority: number;
}
```

- [ ] **Step 4: Run tests — should pass**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: PASS (type tests)

- [ ] **Step 5: Commit**

```bash
git add packages/json-schema-toolkit/src/types.ts packages/json-schema-toolkit/tests/types.test.ts
git commit -m "feat(json-schema-toolkit): add core types with type tests"
```

---

### Task 3: Core — Standard Schema + TypeBox bridge

**Files:**
- Create: `packages/json-schema-toolkit/src/core/index.ts`
- Create: `packages/json-schema-toolkit/src/core/schema.ts`
- Create: `packages/json-schema-toolkit/tests/core/schema.test.ts`

**Interfaces:**
- Consumes: `JsonSchema`, `ValidationResult`, `ValidationError` from `types.ts`
- Produces: `StandardSchema`, `createSchema()`, `toJsonSchema()`, `validateStandard()`, `validateSchema()`

- [ ] **Step 1: Write type tests for core/schema.ts**

Create `tests/core/schema.test.ts`:
```ts
import { describe, it, expectTypeOf } from "vitest";
import type { TSchema } from "@sinclair/typebox";

describe("core/schema types", () => {
  it("imports compile", () => {
    // Just verify TypeBox types are importable
    expectTypeOf<TSchema>().toBeObject();
  });
});
```

- [ ] **Step 2: Create `src/core/schema.ts`**

```ts
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Type, type TSchema } from "@sinclair/typebox";
import type { JsonSchema, ValidationResult, ValidationError } from "../types";

/**
 * A schema that conforms to both TypeBox and Standard Schema.
 */
export type StandardSchema = TSchema & StandardSchemaV1;

/**
 * Creates a TypeBox string schema.
 * Conforms to StandardSchemaV1.
 */
export function stringSchema(): StandardSchema {
  return Type.String() as StandardSchema;
}

/**
 * Creates a TypeBox number schema.
 * Conforms to StandardSchemaV1.
 */
export function numberSchema(): StandardSchema {
  return Type.Number() as StandardSchema;
}

/**
 * Creates a TypeBox object schema from a properties definition.
 * Conforms to StandardSchemaV1.
 */
export function objectSchema(properties: Record<string, TSchema>): StandardSchema {
  return Type.Object(properties) as StandardSchema;
}

/**
 * Converts a TypeBox schema to raw JSON Schema.
 */
export function toJsonSchema(schema: TSchema): JsonSchema {
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Validates data against a Standard Schema-compliant schema.
 */
export function validateSchema(
  schema: StandardSchema,
  data: unknown,
): ValidationResult {
  const result = schema["~standard"].validate(data);

  if (result instanceof Promise) {
    return {
      success: false,
      errors: [{ path: "", message: "Async validation not supported yet" }],
    };
  }

  if (!result.issues || result.issues.length === 0) {
    return { success: true, errors: [] };
  }

  return {
    success: false,
    errors: result.issues.map((issue: { message?: string; path?: Array<{ key: string } | string> }) => ({
      path: issue.path?.map((p) => (typeof p === "string" ? p : p.key)).join(".") ?? "",
      message: issue.message ?? "Validation error",
    })),
  };
}
```

- [ ] **Step 3: Create `src/core/index.ts`**

```ts
export {
  type StandardSchema,
  stringSchema,
  numberSchema,
  objectSchema,
  toJsonSchema,
  validateSchema,
} from "./schema";
```

- [ ] **Step 4: Write unit tests for core/schema.ts**

```ts
import { describe, it, expect } from "vitest";
import { stringSchema, numberSchema, objectSchema, toJsonSchema, validateSchema } from "../../src/core/schema";

describe("core/schema", () => {
  it("creates a string schema", () => {
    const schema = stringSchema();
    expect(schema).toBeDefined();
    expect(schema["~standard"].version).toBe(1);
  });

  it("converts to JSON Schema", () => {
    const schema = stringSchema();
    const json = toJsonSchema(schema);
    expect(json.type).toBe("string");
  });

  it("validates correct data", () => {
    const schema = stringSchema();
    const result = validateSchema(schema, "hello");
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates incorrect data", () => {
    const schema = numberSchema();
    const result = validateSchema(schema, "not a number");
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("creates an object schema", () => {
    const schema = objectSchema({
      name: stringSchema(),
      age: numberSchema(),
    });
    const json = toJsonSchema(schema);
    expect(json.type).toBe("object");
    expect(json.properties).toBeDefined();
    expect(json.properties?.name).toBeDefined();
  });

  it("validates a correct object", () => {
    const schema = objectSchema({
      name: stringSchema(),
    });
    const result = validateSchema(schema, { name: "Alice" });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 5: Run all tests**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add packages/json-schema-toolkit/src/core/ packages/json-schema-toolkit/tests/core/
git commit -m "feat(json-schema-toolkit): add Standard Schema + TypeBox bridge"
```

---

### Task 4: flatfields util

**Files:**
- Create: `packages/json-schema-toolkit/src/utils/flatfields.ts`
- Create: `packages/json-schema-toolkit/src/utils/index.ts`
- Create: `packages/json-schema-toolkit/tests/utils/flatfields.test.ts`

**Interfaces:**
- Consumes: `JsonSchema`, `FieldMeta` from `types.ts`
- Produces: `flatfields(schema: JsonSchema, prefix?: string): FieldMeta[]`

- [ ] **Step 1: Write type tests for flatfields**

```ts
import { describe, it, expectTypeOf } from "vitest";
import type { flatfields } from "../../src/utils/flatfields";
import type { FieldMeta, JsonSchema } from "../../src/types";

describe("flatfields types", () => {
  it("returns FieldMeta array", () => {
    type Result = ReturnType<typeof flatfields>;
    expectTypeOf<Result>().toMatchTypeOf<FieldMeta[]>();
  });
});
```

- [ ] **Step 2: Run test — should fail**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run tests/utils/flatfields.test.ts
```

- [ ] **Step 3: Implement `src/utils/flatfields.ts`**

```ts
import type { FieldMeta, JsonSchema } from "../types";

/**
 * Flattens a JSON Schema's nested properties into a flat array of FieldMeta.
 * Each nested field gets a dot-separated path.
 *
 * @param schema - The JSON Schema to flatten
 * @param prefix - Optional prefix for nested paths (used internally for recursion)
 * @returns An array of FieldMeta objects
 */
export function flatfields(schema: JsonSchema, prefix = ""): FieldMeta[] {
  const fields: FieldMeta[] = [];
  const properties = schema.properties;

  if (!properties) return fields;

  for (const [key, value] of Object.entries(properties)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const meta: FieldMeta = {
      path,
      type: (Array.isArray(value.type) ? value.type[0] : value.type) ?? "unknown",
      format: value.format,
      required: Array.isArray(schema.required) && schema.required.includes(key),
      description: value.description,
      defaultValue: value.default,
      enum: value.enum,
    };

    if (value.type === "object" && value.properties) {
      meta.properties = value.properties as Record<string, JsonSchema>;
    }

    fields.push(meta);

    if (value.type === "object" && value.properties) {
      fields.push(...flatfields(value as JsonSchema, path));
    }
  }

  return fields;
}
```

- [ ] **Step 4: Add the test content to flatfields.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { flatfields } from "../../src/utils/flatfields";
import type { JsonSchema } from "../../src/types";

describe("flatfields", () => {
  it("returns empty array for schema without properties", () => {
    expect(flatfields({ type: "string" })).toEqual([]);
  });

  it("flattens top-level fields", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name"],
    };
    const result = flatfields(schema);
    expect(result).toHaveLength(2);
    expect(result[0]?.path).toBe("name");
    expect(result[0]?.type).toBe("string");
    expect(result[0]?.required).toBe(true);
    expect(result[1]?.path).toBe("age");
    expect(result[1]?.required).toBe(false);
  });

  it("flattens nested fields with dot notation", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            address: {
              type: "object",
              properties: {
                city: { type: "string" },
              },
            },
          },
        },
      },
    };
    const result = flatfields(schema);
    expect(result).toHaveLength(3);
    expect(result.map((f) => f.path)).toEqual([
      "user",
      "user.name",
      "user.address",
      "user.address.city",
    ]);
  });

  it("includes format, description, default, enum", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        email: {
          type: "string",
          format: "email",
          description: "User email",
          default: "test@example.com",
        },
        role: {
          type: "string",
          enum: ["admin", "user"],
        },
      },
    };
    const result = flatfields(schema);
    expect(result[0]?.format).toBe("email");
    expect(result[0]?.description).toBe("User email");
    expect(result[0]?.defaultValue).toBe("test@example.com");
    expect(result[1]?.enum).toEqual(["admin", "user"]);
  });
});
```

- [ ] **Step 5: Create `src/utils/index.ts`**

```ts
export { flatfields } from "./flatfields";
```

- [ ] **Step 6: Run tests**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add packages/json-schema-toolkit/src/utils/ packages/json-schema-toolkit/tests/utils/
git commit -m "feat(json-schema-toolkit): add flatfields util"
```

---

### Task 5: entries + fromEntries utils

**Files:**
- Create: `packages/json-schema-toolkit/src/utils/entries.ts`
- Create: `packages/json-schema-toolkit/src/utils/from-entries.ts`
- Create: `packages/json-schema-toolkit/tests/utils/entries.test.ts`
- Create: `packages/json-schema-toolkit/tests/utils/from-entries.test.ts`
- Modify: `packages/json-schema-toolkit/src/utils/index.ts`

**Interfaces:**
- Produces: `entries(schema: JsonSchema): [string, FieldMeta][]`, `fromEntries(entries: [string, FieldMeta][]): JsonSchema`

- [ ] **Step 1: Write tests for `entries`**

`tests/utils/entries.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { entries } from "../../src/utils/entries";
import type { JsonSchema } from "../../src/types";

describe("entries", () => {
  it("returns empty array for empty schema", () => {
    expect(entries({ type: "object" })).toEqual([]);
  });

  it("returns key-value pairs for each property", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
    };
    const result = entries(schema);
    expect(result).toHaveLength(2);
    expect(result[0]?.[0]).toBe("name");
    expect(result[0]?.[1].type).toBe("string");
    expect(result[1]?.[0]).toBe("age");
  });
});
```

- [ ] **Step 2: Implement `entries.ts`**

```ts
import type { FieldMeta, JsonSchema } from "../types";
import { flatfields } from "./flatfields";

/**
 * Extracts [key, FieldMeta] pairs from a JSON Schema.
 * Useful for generating UI components from schema definitions.
 *
 * @param schema - The JSON Schema to extract entries from
 * @returns An array of [key, FieldMeta] tuples
 */
export function entries(schema: JsonSchema): [string, FieldMeta][] {
  return flatfields(schema).map((field) => [field.path, field]);
}
```

- [ ] **Step 3: Write tests for `fromEntries`**

`tests/utils/from-entries.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { fromEntries } from "../../src/utils/from-entries";
import type { JsonSchema, FieldMeta } from "../../src/types";

describe("fromEntries", () => {
  it("reconstructs a simple schema", () => {
    const input: [string, FieldMeta][] = [
      ["name", { path: "name", type: "string" }],
      ["age", { path: "age", type: "number" }],
    ];
    const result = fromEntries(input);
    expect(result.type).toBe("object");
    expect(result.properties?.name?.type).toBe("string");
    expect(result.properties?.age?.type).toBe("number");
  });
});
```

- [ ] **Step 4: Implement `from-entries.ts`**

```ts
import type { FieldMeta, JsonSchema } from "../types";

/**
 * Reconstructs a JSON Schema from an array of [key, FieldMeta] entries.
 * Useful for rebuilding schemas after transformation.
 *
 * @param entries - Array of [key, FieldMeta] tuples
 * @returns A JSON Schema object
 */
export function fromEntries(entries: [string, FieldMeta][]): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const [key, meta] of entries) {
    const prop: JsonSchema = { type: meta.type };
    if (meta.format) prop.format = meta.format;
    if (meta.description) prop.description = meta.description;
    if (meta.defaultValue !== undefined) prop.default = meta.defaultValue;
    if (meta.enum) prop.enum = meta.enum;
    properties[key] = prop;

    if (meta.required) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}
```

- [ ] **Step 5: Update `src/utils/index.ts`**

```ts
export { flatfields } from "./flatfields";
export { entries } from "./entries";
export { fromEntries } from "./from-entries";
```

- [ ] **Step 6: Run tests**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add packages/json-schema-toolkit/src/utils/entries.ts packages/json-schema-toolkit/src/utils/from-entries.ts packages/json-schema-toolkit/tests/utils/
git commit -m "feat(json-schema-toolkit): add entries and fromEntries utils"
```

---

### Task 6: groupBy + keys utils

**Files:**
- Create: `packages/json-schema-toolkit/src/utils/group-by.ts`
- Create: `packages/json-schema-toolkit/src/utils/keys.ts`
- Create: `packages/json-schema-toolkit/tests/utils/group-by.test.ts`
- Create: `packages/json-schema-toolkit/tests/utils/keys.test.ts`
- Modify: `packages/json-schema-toolkit/src/utils/index.ts`

**Interfaces:**
- Produces: `groupBy(schema: JsonSchema, criteria: GroupCriteria): Record<string, FieldMeta[]>`, `keys(schema: JsonSchema): string[]`

- [ ] **Step 1: Implement `group-by.ts`**

```ts
import type { FieldMeta, GroupCriteria, JsonSchema } from "../types";
import { flatfields } from "./flatfields";

/**
 * Groups fields from a JSON Schema by a given criteria.
 *
 * @param schema - The JSON Schema
 * @param criteria - How to group fields
 * @returns A record of group key → FieldMeta[]
 */
export function groupBy(
  schema: JsonSchema,
  criteria: GroupCriteria,
): Record<string, FieldMeta[]> {
  const fields = flatfields(schema);
  const groups: Record<string, FieldMeta[]> = {};

  for (const field of fields) {
    const key = typeof criteria.by === "function"
      ? criteria.by(field)
      : String(field[criteria.by] ?? "undefined");
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key]!.push(field);
  }

  return groups;
}
```

- [ ] **Step 2: Write tests for `group-by.ts`**

```ts
import { describe, it, expect } from "vitest";
import { groupBy } from "../../src/utils/group-by";
import type { JsonSchema } from "../../src/types";

describe("groupBy", () => {
  const schema: JsonSchema = {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      age: { type: "number" },
    },
  };

  it("groups by type", () => {
    const result = groupBy(schema, { by: "type" });
    expect(result.string).toHaveLength(2);
    expect(result.number).toHaveLength(1);
  });

  it("groups by required", () => {
    const result = groupBy(schema, { by: "required" });
    expect(result.false).toBeDefined();
  });
});
```

- [ ] **Step 3: Implement `keys.ts`**

```ts
import type { JsonSchema } from "../types";
import { flatfields } from "./flatfields";

/**
 * Extracts the keys (field paths) from a JSON Schema.
 *
 * @param schema - The JSON Schema
 * @returns An array of field path strings
 */
export function keys(schema: JsonSchema): string[] {
  return flatfields(schema).map((f) => f.path);
}
```

- [ ] **Step 4: Write tests for `keys`**

```ts
import { describe, it, expect } from "vitest";
import { keys } from "../../src/utils/keys";
import type { JsonSchema } from "../../src/types";

describe("keys", () => {
  it("returns field paths", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
    };
    expect(keys(schema)).toEqual(["name", "age"]);
  });
});
```

- [ ] **Step 5: Update `src/utils/index.ts`**

```ts
export { flatfields } from "./flatfields";
export { entries } from "./entries";
export { fromEntries } from "./from-entries";
export { groupBy } from "./group-by";
export { keys } from "./keys";
```

- [ ] **Step 6: Run tests**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add packages/json-schema-toolkit/
git commit -m "feat(json-schema-toolkit): add groupBy and keys utils"
```

---

### Task 7: validate-schema util

**Files:**
- Create: `packages/json-schema-toolkit/src/utils/validate-schema.ts`
- Create: `packages/json-schema-toolkit/tests/utils/validate-schema.test.ts`
- Modify: `packages/json-schema-toolkit/src/utils/index.ts`

**Interfaces:**
- Consumes: `JsonSchema`, `ValidationResult` from types, `StandardSchema`, `toJsonSchema` from core
- Produces: `validateSchema(schema: JsonSchema, data: unknown): ValidationResult`

- [ ] **Step 1: Implement `validate-schema.ts`**

```ts
import { Type } from "@sinclair/typebox";
import type { JsonSchema, ValidationResult } from "../types";

/**
 * Validates data against a raw JSON Schema by converting it to a TypeBox schema first.
 *
 * @param schema - The JSON Schema to validate against
 * @param data - The data to validate
 * @returns A ValidationResult
 */
export function validateSchema(
  schema: JsonSchema,
  data: unknown,
): ValidationResult {
  try {
    // Convert JSON Schema to TypeBox using Type() constructor
    const typeBoxSchema = Type.Object(
      schema.properties as Record<string, unknown>,
      { additionalProperties: true },
    ) as import("@sinclair/typebox").TObject;
    
    const result = typeBoxSchema["~standard"].validate(data);
    
    if (result instanceof Promise) {
      return { success: false, errors: [{ path: "", message: "Async validation not supported" }] };
    }

    if (!result.issues || result.issues.length === 0) {
      return { success: true, errors: [] };
    }

    return {
      success: false,
      errors: result.issues.map(
        (issue: { message?: string; path?: Array<{ key: string } | string> }) => ({
          path: issue.path?.map((p) => (typeof p === "string" ? p : p.key)).join(".") ?? "",
          message: issue.message ?? "Validation error",
        }),
      ),
    };
  } catch {
    return { success: false, errors: [{ path: "", message: "Schema conversion failed" }] };
  }
}
```

- [ ] **Step 2: Write tests**

```ts
import { describe, it, expect } from "vitest";
import { validateSchema } from "../../src/utils/validate-schema";
import type { JsonSchema } from "../../src/types";

describe("validateSchema", () => {
  it("validates a correct object", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    };
    const result = validateSchema(schema, { name: "Alice" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid data", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        age: { type: "number" },
      },
    };
    const result = validateSchema(schema, { age: "not-a-number" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Update `src/utils/index.ts`**

```ts
export { flatfields } from "./flatfields";
export { entries } from "./entries";
export { fromEntries } from "./from-entries";
export { groupBy } from "./group-by";
export { keys } from "./keys";
export { validateSchema } from "./validate-schema";
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add packages/json-schema-toolkit/
git commit -m "feat(json-schema-toolkit): add validateSchema util"
```

---

### Task 8: SchemaAdapter interface

**Files:**
- Create: `packages/json-schema-toolkit/src/adapter/types.ts`
- Create: `packages/json-schema-toolkit/src/adapter/index.ts`
- Create: `packages/json-schema-toolkit/tests/adapter/types.test.ts`

**Interfaces:**
- Produces: `SchemaAdapter<N>` interface

- [ ] **Step 1: Write type tests**

```ts
import { describe, it, expectTypeOf } from "vitest";
import type { SchemaAdapter } from "../../src/adapter/types";
import type { JsonSchema, ValidationResult } from "../../src/types";

describe("SchemaAdapter types", () => {
  it("requires a name", () => {
    type Adapter = SchemaAdapter;
    // The name must be a string
    expectTypeOf<Adapter["name"]>().toBeString();
  });

  it("has fromJsonSchema method", () => {
    type Adapter = SchemaAdapter<string>;
    expectTypeOf<Adapter["fromJsonSchema"]>().toMatchTypeOf<
      (schema: JsonSchema) => string
    >();
  });

  it("has validate method returning ValidationResult", () => {
    type Adapter = SchemaAdapter;
    expectTypeOf<Adapter["validate"]>().toMatchTypeOf<
      (nativeSchema: unknown, data: unknown) => ValidationResult
    >();
  });
});
```

- [ ] **Step 2: Implement `src/adapter/types.ts`**

```ts
import type { JsonSchema, ValidationResult } from "../types";

/**
 * Adapts between JSON Schema and a native validator's schema format.
 * Implement this interface to support custom validators (Zod, Valibot, etc.).
 */
export interface SchemaAdapter<N = unknown> {
  /** Name of the adapter (e.g. "zod", "valibot") */
  readonly name: string;

  /**
   * Converts a raw JSON Schema to the native schema format.
   */
  fromJsonSchema: (schema: JsonSchema) => N;

  /**
   * Converts a native schema format back to raw JSON Schema.
   */
  toJsonSchema: (nativeSchema: N) => JsonSchema;

  /**
   * Validates data against a native schema and returns a normalized result.
   */
  validate: (nativeSchema: N, data: unknown) => ValidationResult;
}
```

- [ ] **Step 3: Create `src/adapter/index.ts`**

```ts
export type { SchemaAdapter } from "./types";
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add packages/json-schema-toolkit/src/adapter/ packages/json-schema-toolkit/tests/adapter/
git commit -m "feat(json-schema-toolkit): add SchemaAdapter interface"
```

---

### Task 9: FieldRegistry

**Files:**
- Create: `packages/json-schema-toolkit/src/registry/field-registry.ts`
- Create: `packages/json-schema-toolkit/src/registry/index.ts`
- Create: `packages/json-schema-toolkit/tests/registry/field-registry.test.tsx`

**Interfaces:**
- Consumes: `RegistrySelector`, `FieldComponent`, `RegistryEntry`, `FieldMeta` from types
- Produces: `FieldRegistry` class

- [ ] **Step 1: Write tests**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { FieldRegistry } from "../../src/registry/field-registry";
import type { FieldMeta } from "../../src/types";
import React from "react";

describe("FieldRegistry", () => {
  let registry: FieldRegistry;
  const StringField = (props: { label?: string }) => React.createElement("input", props);
  const NumberField = (props: { label?: string }) => React.createElement("input", { type: "number", ...props });

  beforeEach(() => {
    registry = new FieldRegistry();
  });

  it("registers and resolves a component by type", () => {
    registry.register({ type: "string" }, StringField);
    const result = registry.resolve({ path: "name", type: "string" });
    expect(result).toBe(StringField);
  });

  it("resolves by format with higher priority", () => {
    registry.register({ type: "string" }, StringField, 0);
    registry.register({ type: "string", format: "email" }, StringField, 10);
    const field: FieldMeta = { path: "email", type: "string", format: "email" };
    expect(registry.resolve(field)).toBe(StringField);
  });

  it("throws when no match and no fallback", () => {
    expect(() => {
      registry.resolve({ path: "x", type: "unknown" });
    }).toThrow("Aucun composant enregistré");
  });

  it("uses fallback when no match", () => {
    registry.setFallback(StringField);
    const result = registry.resolve({ path: "x", type: "unknown" });
    expect(result).toBe(StringField);
  });

  it("clears all entries", () => {
    registry.register({ type: "string" }, StringField);
    registry.clear();
    expect(() => registry.resolve({ path: "x", type: "string" })).toThrow();
  });

  it("matches by widget", () => {
    registry.register({ widget: "textarea" }, StringField);
    const field: FieldMeta = { path: "bio", type: "string", uiWidget: "textarea" };
    expect(registry.resolve(field)).toBe(StringField);
  });
});
```

- [ ] **Step 2: Implement `src/registry/field-registry.ts`**

```ts
import type {
  FieldMeta,
  RegistrySelector,
  RegistryEntry,
  FieldComponent,
} from "../types";

/**
 * Manages a registry of field components for dynamic UI generation.
 * Resolves the best matching component based on type, format, and widget.
 */
export class FieldRegistry {
  private entries: RegistryEntry[] = [];
  private db: Map<string, RegistryEntry> = new Map();
  private fallbackComponent: FieldComponent | null = null;

  /**
   * Registers a component for a given selector.
   *
   * @param selector - The selector criteria (type, format, widget)
   * @param component - The React component to register
   * @param priority - Higher priority wins when multiple matches exist
   */
  register<T extends FieldComponent>(
    selector: RegistrySelector,
    component: T,
    priority = 0,
  ): void {
    this.entries.push({ selector, component, priority });
    this.entries.sort((a, b) => b.priority - a.priority);
    const key = JSON.stringify([selector.type, selector.format, selector.widget]);
    this.db.set(key, { selector, component, priority });
  }

  /**
   * Sets the default component when no match is found.
   */
  setFallback(component: FieldComponent): void {
    this.fallbackComponent = component;
  }

  /**
   * Generates selector keys for a given selector.
   */
  static selectorKeys(selector: RegistrySelector): string[] {
    return [JSON.stringify([selector.type, selector.format, selector.widget])];
  }

  /**
   * Finds the best matching component for a given field.
   *
   * @param field - The field metadata to resolve
   * @returns The matched component
   * @throws If no match and no fallback is set
   */
  resolve(field: FieldMeta): FieldComponent {
    const keys = FieldRegistry.selectorKeys({
      type: field.type,
      format: field.format,
      widget: field.uiWidget,
    });

    for (const key of keys) {
      const entry = this.db.get(key);
      if (entry) return entry.component;
    }

    if (this.fallbackComponent) return this.fallbackComponent;

    throw new Error(
      `Aucun composant enregistré pour le champ "${field.path}" (${field.type}:${field.format ?? "none"})`,
    );
  }

  /**
   * Clears all registered entries and the fallback.
   */
  clear(): void {
    this.entries = [];
    this.db = new Map();
    this.fallbackComponent = null;
  }
}
```

- [ ] **Step 3: Create `src/registry/index.ts`**

```ts
export { FieldRegistry } from "./field-registry";
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add packages/json-schema-toolkit/src/registry/ packages/json-schema-toolkit/tests/registry/
git commit -m "feat(json-schema-toolkit): add FieldRegistry class"
```

---

### Task 10: Exports, index.ts, and verify

**Files:**
- Modify: `packages/json-schema-toolkit/src/index.ts`
- Modify: `packages/json-schema-toolkit/tests/types.test.ts`

- [ ] **Step 1: Wire up `src/index.ts`**

```ts
export type {
  JsonSchema,
  ValidationResult,
  ValidationError,
  FieldMeta,
  GroupCriteria,
  RegistrySelector,
  FieldComponent,
  RegistryEntry,
} from "./types";

export { FieldRegistry } from "./registry/field-registry";
export type { SchemaAdapter } from "./adapter/types";

export {
  flatfields,
  entries,
  fromEntries,
  groupBy,
  keys,
  validateSchema,
} from "./utils";

export {
  type StandardSchema,
  stringSchema,
  numberSchema,
  objectSchema,
  toJsonSchema,
  validateSchema as validateWithCore,
} from "./core";
```

- [ ] **Step 2: Run full test suite**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec vitest run
```

Expected: ALL PASS

- [ ] **Step 3: Run type check**

```bash
pnpm --filter @code2-base-ui/json-schema-toolkit exec tsc --noEmit
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/json-schema-toolkit/
git commit -m "feat(json-schema-toolkit): wire up public exports"
```

---

### Task 11: Fumadocs documentation page

**Files:**
- Create: `apps/fumadocs/content/docs/json-schema-toolkit/index.mdx`
- Create: `apps/fumadocs/content/docs/json-schema-toolkit/installation.mdx`
- Create: `apps/fumadocs/content/docs/json-schema-toolkit/core.mdx`
- Create: `apps/fumadocs/content/docs/json-schema-toolkit/utils.mdx`
- Create: `apps/fumadocs/content/docs/json-schema-toolkit/registry.mdx`
- Create: `apps/fumadocs/content/docs/json-schema-toolkit/adapter.mdx`
- Modify: `apps/fumadocs/content/docs/meta.json`

- [ ] **Step 1: Create `apps/fumadocs/content/docs/json-schema-toolkit/index.mdx`**

```mdx
---
title: json-schema-toolkit
description: JSON Schema toolkit with Standard Schema compliance, TypeBox integration, and FieldRegistry
---

# json-schema-toolkit

`@code2-base-ui/json-schema-toolkit` est un écosystème d'outils copy-paste basé sur JSON Schema, intégrant le **Standard Schema** via `@sinclair/typebox`.

## Installation

```bash
pnpm add @code2-base-ui/json-schema-toolkit
```

Le package est conçu pour fonctionner en environnement **browser et serveur**.

## Modules

| Module | Description |
|--------|-------------|
| `core` | Standard Schema + TypeBox bridge |
| `utils` | Utilitaires de manipulation de schémas |
| `registry` | FieldRegistry pour composants React |
| `adapter` | Interface SchemaAdapter |
```

- [ ] **Step 2: Create `installation.mdx`**

```mdx
---
title: Installation
description: Installation and setup of json-schema-toolkit
---

# Installation

```bash
pnpm add @code2-base-ui/json-schema-toolkit
```

Ensure your project has `react` available (for FieldRegistry support):
```bash
pnpm add react
```

## Configurer la documentation

Ajoutez un lien vers la documentation dans votre fichier `source.config.ts` si nécessaire.
```

- [ ] **Step 3: Create `core.mdx`**

```mdx
---
title: Core
description: Standard Schema and TypeBox integration
---

# Core

Le module `core` intègre **TypeBox** avec **Standard Schema**.

```ts
import { stringSchema, numberSchema, objectSchema, toJsonSchema, validateSchema } from "@code2-base-ui/json-schema-toolkit/core";
```

## Créer des schémas

```ts
const StringSchema = stringSchema();   // Type.String() avec StandardSchemaV1
const NumSchema = numberSchema();      // Type.Number() avec StandardSchemaV1
const UserSchema = objectSchema({
  name: stringSchema(),
  age: numberSchema(),
});
```

## Valider des données

```ts
const result = validateSchema(UserSchema, { name: "Alice", age: 30 });
if (result.success) {
  console.log("Données valides");
}
```

## Exporter en JSON Schema brut

```ts
const json = toJsonSchema(UserSchema);
// { type: "object", properties: { name: { type: "string" }, age: { type: "number" } } }
```
```

- [ ] **Step 4: Create `utils.mdx`**

```mdx
---
title: Utilitaires
description: Utility functions for JSON Schema manipulation
---

# Utilitaires

```ts
import { flatfields, entries, fromEntries, groupBy, keys, validateSchema } from "@code2-base-ui/json-schema-toolkit/utils";
```

## flatfields

Aplatit les propriétés imbriquées en tableau plat de `FieldMeta`.

```ts
const fields = flatfields(userSchema);
// [{ path: "name", type: "string" }, { path: "address.city", type: "string" }]
```

## entries

Retourne les paires `[key, FieldMeta]`.

```ts
const pairs = entries(userSchema);
```

## fromEntries

Reconstruit un JSON Schema depuis des entrées.

## groupBy

Groupe les champs par critère.

```ts
const groups = groupBy(schema, { by: "type" });
// { string: [...], number: [...] }
```

## keys

Extrait les chemins de tous les champs.

```ts
const fieldPaths = keys(schema);
// ["name", "email", "age"]
```
```

- [ ] **Step 5: Create `registry.mdx`**

```mdx
---
title: Registry
description: FieldRegistry component registration
---

# FieldRegistry

Le `FieldRegistry` permet d'enregistrer et de résoudre des composants React par type/format/widget.

```ts
import { FieldRegistry } from "@code2-base-ui/json-schema-toolkit/registry";
import type { FieldMeta } from "@code2-base-ui/json-schema-toolkit";

const registry = new FieldRegistry();

registry.register({ type: "string" }, StringInput);
registry.register({ type: "string", format: "email" }, EmailInput, 10);
registry.setFallback(DefaultInput);

const component = registry.resolve({ path: "email", type: "string", format: "email" });
```
```

- [ ] **Step 6: Create `adapter.mdx`**

```mdx
---
title: Adapter
description: SchemaAdapter for custom validators
---

# SchemaAdapter

L'interface `SchemaAdapter` permet d'adapter des validateurs externes (Zod, Valibot, etc.) au JSON Schema.

```ts
import type { SchemaAdapter } from "@code2-base-ui/json-schema-toolkit/adapter";

const myAdapter: SchemaAdapter<MySchema> = {
  name: "my-validator",
  fromJsonSchema: (schema) => { /* ... */ },
  toJsonSchema: (native) => { /* ... */ },
  validate: (native, data) => { /* ... */ },
};
```
```

- [ ] **Step 7: Update meta.json to include the new section**

- [ ] **Step 4: Verify docs build locally**

```bash
pnpm nx build fumadocs
```

- [ ] **Step 5: Commit**

```bash
git add apps/fumadocs/content/docs/json-schema-toolkit/
git commit -m "docs: add json-schema-toolkit documentation pages"
```

---

### Task 12: Update AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add json-schema-toolkit to the Architecture section**

```markdown
- `packages/json-schema-toolkit` — Utilitaires JSON Schema avec Standard Schema, TypeBox, FieldRegistry
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add json-schema-toolkit to AGENTS.md"
```
