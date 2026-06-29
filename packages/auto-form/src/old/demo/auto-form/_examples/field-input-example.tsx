"use client";

import { AutoForm } from "@code-base-ui/json-schema-toolkit/components";
import { Button } from "@code-base-ui/ui";
import * as Type from "@sinclair/typebox";
import { myAutoFormRegistry } from "../registry";
import { ViewResult } from "../view-result";

const schema = Type.Object(
  {
    username: Type.String({
      title: "Username",
      description: "Choose a unique username for your account.",
      minLength: 3,
      maxLength: 50,
      "auto-form": {
        variant: "test",
        placeholder: "Max Leiter",
        icon: "users",
      },
    }),
    password: Type.String({
      title: "Password",
      description: "Must be at least 8 characters long.",
      placeholder: "********",
      minLength: 8,
      format: "password",
    }),
  },
  {
    title: "User Login",
    description: "Please enter your username and password to log in.",
  },
);

export function FieldInputExample() {
  return (
    <ViewResult
      title="Exemple de champ Input personnalisé"
      description="Cet exemple montre comment utiliser un champ Input personnalisé dans AutoForm en utilisant un registre personnalisé. Le champ Input est stylisé avec Tailwind CSS et gère les erreurs de validation."
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
