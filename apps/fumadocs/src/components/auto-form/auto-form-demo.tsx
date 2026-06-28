"use client";

import { zodProvider } from "@code2-base-ui/auto-form-provider-zod";
import { z } from "zod";
import { createAutoForm } from "@code2-base-ui/auto-form";
import { tanstackFormAdapter } from "@code2-base-ui/auto-form-adapter-tanstack";
import { createShadcnRegistry } from "@code2-base-ui/auto-form-render-shadcn";
import { useState, type ReactNode } from "react";

const { AutoForm, AutoField } = createAutoForm({
  provider: zodProvider,
  form: tanstackFormAdapter,
  registry: createShadcnRegistry(),
});

const userSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  age: z.number().min(18, "Âge minimum : 18 ans").optional(),
  role: z.enum(["admin", "user", "guest"]),
  active: z.boolean().default(true),
});

const articleSchema = z.object({
  title: z.string().min(1, "Requis"),
  category: z.enum(["tech", "design", "business"]),
  content: z.string().optional(),
  published: z.boolean().default(false),
});

const signupSchema = z
  .object({
    username: z.string().min(3, "3 caractères minimum"),
    password: z.string().min(8, "8 caractères minimum"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

function SimpleFormDemo(): ReactNode {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <AutoForm
        schema={articleSchema}
        onSubmit={(data) => setSubmitted(data as Record<string, unknown>)}
        className="space-y-3"
      />
      {submitted && (
        <pre className="bg-fd-muted p-3 rounded text-sm">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
}

function UserFormDemo(): ReactNode {
  const [values, setValues] = useState<Record<string, unknown> | null>(null);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <AutoForm
        schema={userSchema}
        onSubmit={(data) => setValues(data as Record<string, unknown>)}
        className="space-y-3"
      />
      {values && (
        <pre className="bg-fd-muted p-3 rounded text-sm">
          {JSON.stringify(values, null, 2)}
        </pre>
      )}
    </div>
  );
}

function SignupFormDemo(): ReactNode {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <AutoForm
        schema={signupSchema}
        onSubmit={(data) => setResult(data as Record<string, unknown>)}
        className="space-y-3"
      />
      {result && (
        <div className="bg-fd-success/10 text-fd-success p-3 rounded text-sm">
          Inscription réussie ! {JSON.stringify(result, null, 2)}
        </div>
      )}
    </div>
  );
}

function CustomLayoutDemo(): ReactNode {
  const [showExtra, setShowExtra] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <AutoForm
        schema={articleSchema}
        onSubmit={(data) => setResult(data as Record<string, unknown>)}
      >
        <div className="grid grid-cols-2 gap-3">
          <AutoField name="title" />
          <AutoField name="category" />
        </div>
        <AutoField name="content" />
        <button
          type="button"
          onClick={() => setShowExtra(!showExtra)}
          className="text-sm text-fd-muted-foreground underline"
        >
          {showExtra ? "Masquer" : "Afficher"} les options avancées
        </button>
        {showExtra && <AutoField name="published" />}
        <button
          type="submit"
          className="bg-fd-primary text-fd-primary-foreground px-4 py-2 rounded-md"
        >
          Publier
        </button>
      </AutoForm>
      {result && (
        <pre className="bg-fd-muted p-3 rounded text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function SimpleForm(): ReactNode {
  return <SimpleFormDemo />;
}

export function UserForm(): ReactNode {
  return <UserFormDemo />;
}

export function SignupForm(): ReactNode {
  return <SignupFormDemo />;
}

export function CustomLayoutForm(): ReactNode {
  return <CustomLayoutDemo />;
}
