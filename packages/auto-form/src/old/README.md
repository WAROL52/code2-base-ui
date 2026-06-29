# JSON Schema Toolkit

> Écosystème d'outils copy-paste (à la shadcn/ui) pour générer des interfaces UI dynamiques à partir de JSON Schema.

## Philosophie

- **Copy-paste friendly** : copie uniquement les modules dont tu as besoin
- **Zéro couplage** : chaque module est indépendant
- **Tailwind v4 natif** : aucune config `tailwind.config.js` requise
- **TypeScript strict** : inférence de types complète

## Modules Disponibles

| Module | Rôle | Dépendances |
|---|---|---|
| [`core/`](./core/core.md) | Moteur headless (résolution $ref, traversal, i18n) | Aucune |
| `adapters/zod/` | JSON Schema ↔ Zod | `zod`, `json-schema-to-zod`, `zod-to-json-schema` |
| `adapters/valibot/` | JSON Schema ↔ Valibot | `valibot` |
| `adapters/typebox/` | JSON Schema ↔ TypeBox | `@sinclair/typebox` |
| `registry/` | Mapping type+format → Composant React | `react` |
| `components/AutoFormBuilder/` | Formulaires dynamiques | `@tanstack/react-form`, shadcn/ui |
| `components/AutoTableBuilder/` | Tableaux dynamiques | `@tanstack/react-table`, shadcn/ui |
| `components/AutoFilterBuilder/` | Filtres persistés dans l'URL | `nuqs`, shadcn/ui |

## Installation Minimale (Core uniquement)

```bash
# Aucune dépendance runtime requise pour le core
cp -r json-schema-toolkit/core/ ./src/lib/
```

## Exemple Rapide

```typescript
import { resolveSchema, traverseSchema } from "@/lib/json-schema-toolkit/core";

const schema = {
  type: "object",
  properties: {
    name: { type: "string", title: "Full Name" },
    email: { type: "string", format: "email" },
    age: { type: "number", minimum: 0 },
  },
  required: ["name", "email"],
};

const fields = traverseSchema(resolveSchema(schema));
// → [{ name: "name", label: "Full Name", required: true, type: "string" }, ...]
```

## Tests

```bash
pnpm test          # Lancer tous les tests
pnpm test:watch    # Mode watch
pnpm test:ui       # Interface Vitest UI
```
