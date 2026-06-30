# 0001 — Consolidation de l'écosystème auto-form

Status: accepted

L'écosystème auto-form comptait 6 packages parallèles (`auto-form-builder`, `auto-form`, `auto-form-provider-zod`, `auto-form-adapter-tanstack`, `auto-form-render-shadcn`, `preset-auto-form-tanstack-shadcn`) qui faisaient la même chose avec deux architectures radicalement différentes.

On garde **un seul package** : `@code2-base-ui/auto-form-builder`, basé sur le pattern **FormAdapter** (render-prop, 2 composants React : FormProvider + Field). Il est plus simple, mieux testé (18 tests), et son adaptateur TanStack est réel. Les 5 autres packages sont supprimés progressivement.

## Options considérées

- **Garder les deux** — charge mentale + maintenance, confus pour l'IA
- **Garder auto-form (V2), supprimer le builder** — la V2 est incomplète (stub adapter), le builder a déjà la solution
- **Fusionner** — possible plus tard via un wrapper FormStateAdapter → FormAdapter

## Conséquences

- `auto-form` ne sera plus maintenu ; les fonctionnalités manquantes (validation, i18n, FieldComponentProps) devront être implémentées dans `auto-form-builder`
- Les composants shadcn de `auto-form-render-shadcn` devront être migrés ou réécrits dans le nouveau système
- Le ZodProvider est candidat à migrer comme source d'entrée JSON Schema pour le builder
