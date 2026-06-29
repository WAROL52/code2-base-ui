# Adapter Zod

Ce module permet de lier JSON Schema à Zod.

## Installation

```bash
pnpm add zod zod-to-json-schema json-schema-to-zod
```

## Usage

```typescript
import { zodAdapter } from "./zod";

const zodSchema = zodAdapter.fromJsonSchema({ type: "string" });
const result = zodAdapter.validate(zodSchema, "hello");
```
