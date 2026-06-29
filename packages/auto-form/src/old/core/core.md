# `core/` — Moteur JSON Schema Toolkit

> **Zéro dépendance UI/React.** Ce module peut être utilisé dans n'importe quel contexte TypeScript (Node.js, navigateur, Edge Runtime).

## Installation (aucune dépendance runtime)

```bash
# Uniquement les devDependencies TypeScript
npm i -D typescript
```

## API Publique

### `resolveSchema(rawSchema, draftHint?)`

Résout un JSON Schema complet :
1. Extrait les définitions (`$defs` / `definitions`)
2. Remplace chaque `$ref` par une copie profonde de sa définition (protection anti-boucle)
3. Fusionne tous les `allOf` rencontrés

```typescript
import { resolveSchema } from "./core";

const resolved = resolveSchema(myJsonSchema);
// resolved.root       → schéma racine résolu
// resolved.definitions → dictionnaire des définitions
// resolved.draft      → "draft-7" | "draft-2020-12"
```

### `traverseSchema(resolved)`

Convertit un `ResolvedSchema` en tableau de `FieldMeta[]`.

```typescript
import { resolveSchema, traverseSchema } from "./core";

const fields = traverseSchema(resolveSchema(mySchema));
// fields[0].name        → "email"
// fields[0].type        → "string"
// fields[0].required    → true
// fields[0].kind        → "primitive" | "object" | "array" | "enum" | "union"
// fields[0].children    → FieldMeta[] (si kind === "object")
// fields[0].itemMeta    → FieldMeta   (si kind === "array")
// fields[0].variants    → FieldMeta[][] (si kind === "union")
```

### `getFieldMeta(resolved, path)`

Retourne le `FieldMeta` d'un champ spécifique par son path pointé.

```typescript
const field = getFieldMeta(resolveSchema(mySchema), "user.address.city");
// field?.format → "string"
// field?.required → true
```

---

## FieldMeta — Structure Complète

```typescript
interface FieldMeta {
  path: string;           // "user.address.city"
  name: string;           // "city"
  type: JsonSchemaType;   // "string" | "number" | "object" | "array" | ...
  kind: FieldKind;        // "primitive" | "object" | "array" | "enum" | "union"
  required: boolean;
  label: string;          // title > x-ui-label > name (auto-capitalisé)
  description?: string;
  format?: string;        // "email" | "date" | "uri" | ...
  uiWidget?: string;      // "x-ui-widget" custom
  uiHidden?: boolean;
  uiReadonly?: boolean;
  uiOrder?: number;
  enum?: unknown[];
  defaultValue?: unknown;
  constraints?: FieldConstraints;
  children?: FieldMeta[];     // si kind === "object"
  itemMeta?: FieldMeta;       // si kind === "array"
  variants?: FieldMeta[][];   // si kind === "union"
  discriminantKey?: string;   // propriété discriminante pour union
  resolvedSchema: JsonSchema; // schéma JSON brut résolu
}
```

---

## Extensions UI personnalisées (x-ui-*)

Le core reconnaît nativement ces propriétés d'extension :

| Propriété | Type | Rôle |
|---|---|---|
| `x-ui-widget` | `string` | Forcer un composant spécifique (ex: `"markdown"`, `"color-picker"`) |
| `x-ui-label` | `string` | Label custom (priorité sur `title`) |
| `x-ui-description` | `string` | Description custom |
| `x-ui-order` | `number` | Ordre d'affichage |
| `x-ui-hidden` | `boolean` | Masquer le champ dans l'UI |
| `x-ui-readonly` | `boolean` | Champ en lecture seule |

```json
{
  "type": "object",
  "properties": {
    "bio": {
      "type": "string",
      "x-ui-widget": "markdown",
      "x-ui-order": 5,
      "x-ui-label": "Biographie"
    }
  }
}
```

---

## i18n — Messages de Validation

```typescript
import { getMessages, registerLocale } from "./core";

// Utiliser une locale enregistrée
const msg = getMessages("fr");
msg.required;              // "Ce champ est obligatoire"
msg.minLength(3);          // "Doit contenir au moins 3 caractère(s)"

// Surcharger des messages spécifiques
const customMsg = getMessages("fr", {
  required: "Champ manquant !",
});

// Enregistrer une nouvelle locale
registerLocale("de", {
  required: "Dieses Feld ist erforderlich",
  minLength: (min) => `Mindestens ${min} Zeichen`,
  // ...
});
```

---

## Cas Supportés

| Feature | Supporté |
|---|---|
| `$ref` local (`#/$defs/`, `#/definitions/`) | ✅ |
| Draft 7 (`definitions`) | ✅ |
| Draft 2020-12 (`$defs`, `prefixItems`) | ✅ |
| `allOf` (fusion deep) | ✅ |
| `oneOf` / `anyOf` (variants) | ✅ |
| Référence circulaire (`$ref` → lui-même) | ✅ (placeholder) |
| `enum` et `const` | ✅ |
| `x-ui-*` extensions | ✅ |
| Tri par `x-ui-order` | ✅ |
| Contraintes validation | ✅ |
| i18n (fr, en) | ✅ |
| `$ref` externe (URL) | ❌ (hors scope) |
| `if/then/else` | ⚠️ (résolution partielle) |

---

## Lancer les Tests

```bash
pnpm test
# ou en mode watch
pnpm test:watch
```
