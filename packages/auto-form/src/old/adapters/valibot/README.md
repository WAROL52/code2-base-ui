# Adapter Valibot

Ce module permet de lier JSON Schema à Valibot.

## Installation

```bash
pnpm add valibot @valibot/to-json-schema
```

## Usage

```typescript
import { valibotAdapter } from "./valibot";

const valiSchema = valibotAdapter.fromJsonSchema({ type: "string" });
const result = valibotAdapter.validate(valiSchema, "hello");
```
