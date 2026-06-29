# Adapter TypeBox

Ce module permet de lier JSON Schema à TypeBox.

## Installation

```bash
pnpm add @sinclair/typebox
```

## Usage

```typescript
import { typeboxAdapter } from "./typebox";

const tbSchema = typeboxAdapter.fromJsonSchema({ type: "string" });
const result = typeboxAdapter.validate(tbSchema, "hello");
```
