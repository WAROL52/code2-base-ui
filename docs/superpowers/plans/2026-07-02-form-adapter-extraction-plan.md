# FormAdapter Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract `tanstackAdapter` from `auto-form-builder` into its own package `auto-form-adapter-tanstack`, and replace all test usages with a mock adapter.

**Architecture:** New `packages/auto-form-adapter-tanstack/` contains the tanstack adapter + its tests. `auto-form-builder` keeps only the `FormAdapter` interface (types), no form manager dependency. A mock adapter replaces `tanstackAdapter` in auto-form-builder's own tests to keep them decoupled.

**Tech Stack:** pnpm workspace, Nx monorepo, React 19, Vitest, @tanstack/react-form

## Global Constraints

- `verbatimModuleSyntax: true` — always use `import type` for types
- `noUncheckedIndexedAccess: true` — array access always `| undefined`
- Indentation: tabs (Biome config)
- Quotes: double in JS/TS
- Each adapter is a separate `@code2-base-ui/auto-form-adapter-*` package

---

### Task 1: Create `packages/auto-form-adapter-tanstack/` package

**Files:**
- Create: `packages/auto-form-adapter-tanstack/package.json`
- Create: `packages/auto-form-adapter-tanstack/tsconfig.json`
- Create: `packages/auto-form-adapter-tanstack/src/index.ts`
- Create: `packages/auto-form-adapter-tanstack/src/tanstack.tsx` (copy from `auto-form-builder/src/adapters/tanstack.tsx`)
- Create: `packages/auto-form-adapter-tanstack/tests/tanstack.test.tsx` (copy from `auto-form-builder/tests/adapters/tanstack.test.tsx`)
- Create: `packages/auto-form-adapter-tanstack/vitest.config.ts`

**Interfaces:**
- Produces: `@code2-base-ui/auto-form-adapter-tanstack` package with `export { tanstackAdapter }`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@code2-base-ui/auto-form-adapter-tanstack",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "check": "biome check src/ tests/",
    "fix": "biome check --write src/ tests/",
    "test": "vitest run"
  },
  "dependencies": {
    "@code2-base-ui/auto-form-builder": "workspace:*",
    "@tanstack/react-form": "catalog:"
  },
  "peerDependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "@code2-base-ui/config": "workspace:*",
    "@testing-library/react": "^16.3.2",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "jsdom": "^29.1.1",
    "typescript": "catalog:",
    "vitest": "^3.1.0"
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
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 4: Copy `tanstack.tsx` from auto-form-builder**

Run:
```bash
cp packages/auto-form-builder/src/adapters/tanstack.tsx packages/auto-form-adapter-tanstack/src/tanstack.tsx
```

- [ ] **Step 5: Create `src/index.ts`**

```ts
export { tanstackAdapter } from "./tanstack";
```

- [ ] **Step 6: Copy `tanstack.test.tsx` from auto-form-builder**

Run:
```bash
cp packages/auto-form-builder/tests/adapters/tanstack.test.tsx packages/auto-form-adapter-tanstack/tests/tanstack.test.tsx
```

Then update the import in the copied test file: change `../../src/adapters/tanstack` to `../src/tanstack` and `../../src/adapters/types` to `../src/tanstack`.

Actually, the test currently imports:
```ts
import { tanstackAdapter } from "../../src/adapters/tanstack";
import type { FormAPI } from "../../src/adapters/types";
```

We need to change it (relative to `packages/auto-form-adapter-tanstack/tests/tanstack.test.tsx`):

```ts
import { tanstackAdapter } from "../src/tanstack";
import type { FormAPI } from "@code2-base-ui/auto-form-builder";
```

- [ ] **Step 7: Run tests to verify**

```bash
pnpm --filter @code2-base-ui/auto-form-adapter-tanstack test
```

Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/auto-form-adapter-tanstack/
git commit -m "feat(auto-form-adapter-tanstack): extract tanstack adapter into its own package"
```

### Task 2: Create mock adapter and update auto-form-builder tests

**Files:**
- Create: `packages/auto-form-builder/tests/test-utils.tsx`
- Modify: `packages/auto-form-builder/tests/auto-form.test.tsx`
- Modify: `packages/auto-form-builder/tests/auto-form-builder.test.tsx`
- Modify: `packages/auto-form-builder/tests/auto-form-field.test.tsx`
- Modify: `packages/auto-form-builder/tests/auto-form-union-field.test.tsx`

**Interfaces:**
- Produces: `mockAdapter` — a `FormAdapter` implemented with plain `useState`

- [ ] **Step 1: Create `tests/test-utils.tsx`**

```tsx
import {
	createContext,
	useContext,
	useRef,
	useState,
	type ReactNode,
} from "react";
import type {
	FieldAPI,
	FieldProps,
	FormAdapter,
	FormAPI,
	FormProviderProps,
} from "../src/adapters/types";

interface MockCtxValue {
	getFieldValue: (name: string) => unknown;
	setFieldValue: (name: string, value: unknown) => void;
	valuesRef: { current: Record<string, unknown> };
}

const MockCtx = createContext<MockCtxValue | null>(null);

export const mockAdapter: FormAdapter = {
	name: "mock",

	FormProvider({ defaultValues = {}, onSubmit, children }: FormProviderProps) {
		const [values, setValues] = useState<Record<string, unknown>>(defaultValues);
		const valuesRef = useRef(values);
		valuesRef.current = values;

		const ctx: MockCtxValue = {
			getFieldValue: (name) => values[name],
			setFieldValue: (name, value) => {
				setValues((prev) => ({ ...prev, [name]: value }));
			},
			valuesRef,
		};

		const formAPI: FormAPI = {
			get values() {
				return values;
			},
			isSubmitting: false,
			handleSubmit: () => onSubmit?.(values),
			reset: () => setValues(defaultValues),
			appendFieldValue: (name, value) => {
				setValues((prev) => {
					const arr = (prev[name] as unknown[]) ?? [];
					return { ...prev, [name]: [...arr, value] };
				});
			},
			removeFieldValue: (name, index) => {
				setValues((prev) => {
					const arr = (prev[name] as unknown[]) ?? [];
					return {
						...prev,
						[name]: arr.filter((_, i) => i !== index),
					};
				});
			},
		};

		return (
			<MockCtx.Provider value={ctx}>
				{children(formAPI)}
			</MockCtx.Provider>
		);
	},

	Field({ name, children }: FieldProps) {
		const ctx = useContext(MockCtx);
		if (!ctx) {
			throw new Error("mockAdapter: missing FormProvider");
		}

		return children({
			value: ctx.getFieldValue(name),
			onChange: (val: unknown) => ctx.setFieldValue(name, val),
			onBlur: () => {},
			error: undefined,
			isTouched: false,
		});
	},
};
```

- [ ] **Step 2: Update `tests/auto-form-builder.test.tsx`**

Change the import from:
```ts
import { tanstackAdapter } from "../src/adapters/tanstack";
import type { FormAPI } from "../src/adapters/types";
```

To:
```ts
import type { FormAPI } from "../src/adapters/types";
import { mockAdapter } from "./test-utils";
```

Replace all occurrences of `tanstackAdapter` with `mockAdapter` in the JSX. There are 4 usages (lines 42, 69, 93, 113).

- [ ] **Step 3: Update `tests/auto-form.test.tsx`**

Change the import from:
```ts
import { tanstackAdapter } from "../src/adapters/tanstack";
```

To:
```ts
import { mockAdapter } from "./test-utils";
```

Replace all 5 occurrences of `tanstackAdapter` with `mockAdapter`.

- [ ] **Step 4: Update `tests/auto-form-field.test.tsx`**

Change the import from:
```ts
import { tanstackAdapter } from "../src/adapters/tanstack";
```

To:
```ts
import { mockAdapter } from "./test-utils";
```

Replace all 12 occurrences of `tanstackAdapter` with `mockAdapter` throughout the file.

- [ ] **Step 5: Update `tests/auto-form-union-field.test.tsx`**

Change the import from:
```ts
import { tanstackAdapter } from "../src/adapters/tanstack";
```

To:
```ts
import { mockAdapter } from "./test-utils";
```

Replace all 10 occurrences of `tanstackAdapter` with `mockAdapter` throughout the file.

- [ ] **Step 6: Run tests to verify**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test
```

Expected: all tests PASS (tests still use old import paths because we haven't removed tanstack.tsx from auto-form-builder yet).

- [ ] **Step 7: Commit**

```bash
git add packages/auto-form-builder/tests/
git commit -m "test(auto-form-builder): replace tanstackAdapter with mockAdapter in tests"
```

### Task 3: Remove tanstackAdapter from auto-form-builder source

**Files:**
- Modify: `packages/auto-form-builder/src/index.ts`
- Modify: `packages/auto-form-builder/src/adapters/index.ts`
- Modify: `packages/auto-form-builder/package.json`

- [ ] **Step 1: Update `src/index.ts`**

Remove line 1: `export { tanstackAdapter } from "./adapters/tanstack";`

- [ ] **Step 2: Update `src/adapters/index.ts`**

Replace content. Remove the `export { tanstackAdapter }` line:
```ts
export type { FieldAPI, FieldError, FormAdapter, FormAPI } from "./types";
```

The `toErrorString` function remains exported from `types.ts` directly (same as before).

- [ ] **Step 3: Update `package.json`**

Remove `"@tanstack/react-form": "catalog:"` from the `dependencies` object.

- [ ] **Step 4: Run tests and type checks**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test
pnpm --filter @code2-base-ui/auto-form-builder check-types
```

Expected: both PASS.

- [ ] **Step 5: Run the adapter package tests too**

```bash
pnpm --filter @code2-base-ui/auto-form-adapter-tanstack test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/auto-form-builder/src/ packages/auto-form-builder/package.json
git commit -m "feat(auto-form-builder): remove tanstackAdapter and @tanstack/react-form dependency"
```

### Task 4: Delete the old tanstack files from auto-form-builder

**Files:**
- Delete: `packages/auto-form-builder/src/adapters/tanstack.tsx`
- Delete: `packages/auto-form-builder/tests/adapters/tanstack.test.tsx`

- [ ] **Step 1: Delete old files**

```bash
rm packages/auto-form-builder/src/adapters/tanstack.tsx
rm packages/auto-form-builder/tests/adapters/tanstack.test.tsx
```

- [ ] **Step 2: Run full verification**

```bash
pnpm --filter @code2-base-ui/auto-form-builder test
pnpm --filter @code2-base-ui/auto-form-builder check-types
pnpm --filter @code2-base-ui/auto-form-adapter-tanstack test
```

Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(auto-form-builder): delete old tanstack files (moved to auto-form-adapter-tanstack)"
```
