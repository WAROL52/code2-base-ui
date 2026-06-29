// =============================================================================
// Tests — AutoForm
// =============================================================================

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { zodAdapter } from "../../../adapters/zod";
import { defaultRegistry, FieldRegistry } from "../../../registry";
import { AutoForm } from "../auto-form";

describe("AutoForm", () => {
  const schema = {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      age: { type: "number" },
      address: {
        type: "object",
        properties: {
          city: { type: "string" },
        },
      },
    },
  };

  const registry = new FieldRegistry();
  // Mock simple des composants
  registry.register(
    { type: "string" },
    ({ value, onChange, label, error, id }) => (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    ),
  );
  registry.register({ type: "number" }, ({ value, onChange, label, id }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        value={(value as number) || 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  ));

  it("doit rendre tous les champs du schéma", () => {
    render(
      <AutoForm
        schema={schema as any}
        adapter={zodAdapter}
        registry={registry}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByLabelText(/name/i)).toBeDefined();
    expect(screen.getByLabelText(/age/i)).toBeDefined();
    expect(screen.getByLabelText(/city/i)).toBeDefined();
  });

  it("doit gérer la soumission des données", async () => {
    const onSubmit = vi.fn();
    render(
      <AutoForm
        schema={schema as any}
        adapter={zodAdapter as any}
        registry={registry}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: "Paris" },
    });

    fireEvent.click(screen.getByText(/envoyer/i));

    await waitFor(() => {
      const callArg = onSubmit.mock.calls[0]?.[0];
      expect(callArg).toHaveProperty("value");
      expect(callArg.value).toMatchObject({
        name: "Alice",
        age: 30,
        address: { city: "Paris" },
      });
    });
  });

  it("doit valider les champs en temps réel via l'adapter", async () => {
    const user = userEvent.setup();
    const schemaWithConstraints = {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
      },
    };

    render(
      <AutoForm
        schema={schemaWithConstraints as any}
        adapter={zodAdapter as any}
        registry={registry}
        onSubmit={() => {}}
      />,
    );

    const input = screen.getByLabelText(/email/i);
    await user.type(input, "invalid");
    await user.tab(); // Blur

    await waitFor(() => {
      const error = screen.queryByRole("alert");
      expect(error).not.toBeNull();
      expect(error?.textContent).toMatch(/email/i);
    });
  });

  it("doit masquer les champs avec uiHidden", () => {
    const hiddenSchema = {
      type: "object",
      properties: {
        visible: { type: "string" },
        secret: { type: "string", "x-ui-hidden": true },
      },
    };

    render(
      <AutoForm
        schema={hiddenSchema as any}
        adapter={zodAdapter as any}
        registry={registry}
        onSubmit={() => {}}
      />,
    );

    expect(screen.queryByLabelText(/secret/i)).toBeNull();
    expect(screen.getByLabelText(/visible/i)).toBeDefined();
  });

  it("doit rendre les enfants personnalisés à la place du bouton par défaut", () => {
    render(
      <AutoForm
        schema={schema as any}
        adapter={zodAdapter as any}
        registry={registry}
        onSubmit={() => {}}
      >
        <div data-testid="custom-child">Custom Content</div>
      </AutoForm>,
    );

    expect(screen.getByTestId("custom-child")).toBeDefined();
    expect(screen.queryByText(/envoyer/i)).toBeNull();
  });

  it("doit utiliser le registre par défaut si aucun n'est fourni", () => {
    // On peuple le registre par défaut pour ce test
    defaultRegistry.register({ type: "string" }, ({ value, id }) => (
      <input id={id} value={value as string} readOnly />
    ));

    render(
      <AutoForm
        schema={{ type: "string" } as any}
        adapter={zodAdapter as any}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByRole("textbox")).toBeDefined();

    // Nettoyage pour les autres tests
    defaultRegistry.clear();
  });

  it("doit rendre un formulaire vide si le schéma n'a pas de propriétés", () => {
    const { container } = render(
      <AutoForm
        schema={{ type: "object", properties: {} } as any}
        adapter={zodAdapter as any}
        onSubmit={() => {}}
      />,
    );
    // On ne devrait avoir que le bouton submit
    expect(container.querySelectorAll("input").length).toBe(0);
    expect(screen.getByText(/envoyer/i)).toBeDefined();
  });

  it("doit gérer un schéma racine qui n'est pas un objet", () => {
    // traverseSchema enveloppe les racines primitives dans un champ nommé "root"
    render(
      <AutoForm
        schema={{ type: "string", title: "Standalone String" } as any}
        adapter={zodAdapter as any}
        registry={registry}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByLabelText(/standalone string/i)).toBeDefined();
  });
});
