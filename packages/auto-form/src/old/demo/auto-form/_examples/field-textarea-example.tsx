"use client";

import { AutoForm } from "@code-base-ui/json-schema-toolkit/components";
import { Button } from "@code-base-ui/ui";
import * as Type from "@sinclair/typebox";
import { myAutoFormRegistry } from "../registry";
import { ViewResult } from "../view-result";

const schema = Type.Object(
  {
    feedback: Type.String({
      title: "Your Feedback",
      description: "Please provide your feedback in the textarea below.",
      placeholder: "I really enjoyed using this product because...",
      minLength: 10,
    }),
  },
  {
    title: "Feedback Form",
    description: "Please provide your feedback below.",
    "x-ui-widget": "Textarea", // Spécifie que ce champ doit utiliser le widget Textarea personnalisé
  },
);

export function FieldTextareaExample() {
  return (
    <ViewResult
      title="Exemple de champ Textarea personnalisé"
      description="Cet exemple montre comment utiliser un champ Textarea personnalisé dans AutoForm en utilisant un registre personnalisé. Le champ Textarea est stylisé avec Tailwind CSS et gère les erreurs de validation."
    >
      {({ onSubmit }) => {
        return (
          <AutoForm
            schema={schema}
            registry={myAutoFormRegistry}
            onSubmit={onSubmit}
          >
            <div className="pt-4">
              <Button type="submit">Valider</Button>
            </div>
          </AutoForm>
        );
      }}
    </ViewResult>
  );
}
