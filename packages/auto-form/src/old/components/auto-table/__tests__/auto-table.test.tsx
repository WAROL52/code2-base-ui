import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { JsonSchema } from "../../../core/types";
import { AutoTable } from "../auto-table";

describe("AutoTable", () => {
  const schema = {
    type: "object",
    properties: {
      id: { type: "number", title: "ID" },
      name: { type: "string", title: "Nom" },
      active: { type: "boolean", title: "Statut" },
      profile: {
        type: "object",
        title: "Profil",
        properties: {
          city: { type: "string", title: "Ville" },
          score: { type: "number", title: "Score" },
        },
      },
      history: {
        type: "array",
        title: "Historique",
        items: {
          type: "object",
          properties: {
            label: { type: "string", title: "Libellé" },
            year: { type: "number", title: "Année" },
          },
        },
      },
    },
  } satisfies JsonSchema;

  const data = [
    {
      id: 1,
      name: "Alice",
      active: true,
      profile: { city: "Paris", score: 10 },
      history: [{ label: "Joined", year: 2020 }],
    },
    {
      id: 2,
      name: "Bob",
      active: false,
      profile: { city: "Lyon", score: 4 },
      history: [{ label: "Joined", year: 2019 }],
    },
    {
      id: 3,
      name: "Charlie",
      active: true,
      profile: { city: "Marseille", score: 8 },
      history: [{ label: "Joined", year: 2021 }],
    },
  ];

  it("doit rendre le tableau avec les en-têtes et les données", () => {
    render(<AutoTable schema={schema} data={data} />);

    // Vérifier les en-têtes
    expect(screen.getByText("ID")).toBeDefined();
    expect(screen.getByText("Nom")).toBeDefined();
    expect(screen.getByText("Statut")).toBeDefined();

    // Vérifier les données
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getAllByText("✅")).toHaveLength(2); // Alice & Charlie are active
    expect(screen.getByText("❌")).toBeDefined(); // Bob is inactive
  });

  it("doit afficher un détail pour les objets imbriqués", async () => {
    const user = userEvent.setup();
    render(<AutoTable schema={schema} data={data} />);

    const firstDetailSummary = screen.getAllByText("Voir le détail")[0];
    await user.click(firstDetailSummary);

    const firstDetails = firstDetailSummary.closest("details");
    expect(firstDetails).not.toBeNull();

    expect(within(firstDetails as HTMLElement).getByText("city")).toBeDefined();
    expect(
      within(firstDetails as HTMLElement).getByText("Paris"),
    ).toBeDefined();
    expect(
      within(firstDetails as HTMLElement).getByText("score"),
    ).toBeDefined();
    expect(within(firstDetails as HTMLElement).getByText("10")).toBeDefined();
  });

  it("doit rendre les tableaux imbriqués comme des sous-tableaux détaillés", async () => {
    const user = userEvent.setup();
    render(<AutoTable schema={schema} data={data} />);

    const firstHistorySummary = screen.getAllByText("Voir les 1 éléments")[0];
    await user.click(firstHistorySummary);

    const firstHistoryDetails = firstHistorySummary.closest("details");
    expect(firstHistoryDetails).not.toBeNull();

    expect(
      within(firstHistoryDetails as HTMLElement).getByText("Field"),
    ).toBeDefined();
    expect(
      within(firstHistoryDetails as HTMLElement).getByText("label"),
    ).toBeDefined();
    expect(
      within(firstHistoryDetails as HTMLElement).getByText("Joined"),
    ).toBeDefined();
    expect(
      within(firstHistoryDetails as HTMLElement).getByText("year"),
    ).toBeDefined();
  });

  it("doit gérer le clic sur une ligne", () => {
    const onRowClick = vi.fn();
    render(<AutoTable schema={schema} data={data} onRowClick={onRowClick} />);

    fireEvent.click(screen.getByText("Alice"));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it("doit gérer la pagination", () => {
    const manyData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      active: true,
    }));

    render(
      <AutoTable
        schema={schema}
        data={manyData}
        pagination={{ enabled: true, pageSize: 5 }}
      />,
    );

    // Page 1
    expect(screen.getByText("User 1")).toBeDefined();
    expect(screen.queryByText("User 6")).toBeNull();

    // Passer à la page suivante
    fireEvent.click(screen.getByText(/Suivant/i));

    expect(screen.queryByText("User 1")).toBeNull();
    expect(screen.getByText("User 6")).toBeDefined();
  });

  it("doit afficher les titres et descriptions", () => {
    render(
      <AutoTable
        schema={schema}
        data={data}
        title="Liste des Utilisateurs"
        description="Tableau récapitulatif"
      />,
    );

    expect(screen.getByText("Liste des Utilisateurs")).toBeDefined();
    expect(screen.getByText("Tableau récapitulatif")).toBeDefined();
  });

  it("doit gérer le tri des colonnes", async () => {
    const user = userEvent.setup();
    render(<AutoTable schema={schema} data={data} />);

    const nameHeader = screen.getByText("Nom");

    // Premier clic -> ASC (Alice, Bob, Charlie)
    await user.click(nameHeader);
    // Deuxième clic -> DESC (Charlie, Bob, Alice)
    await user.click(nameHeader);

    const mainTable = screen.getAllByRole("table")[0];
    const topLevelRows = Array.from(
      mainTable.querySelectorAll(":scope > tbody > tr"),
    ) as HTMLElement[];
    const firstRowContent = within(topLevelRows[0]).getByText("Charlie");
    const lastRowContent = within(topLevelRows[2]).getByText("Alice");

    expect(firstRowContent).toBeDefined();
    expect(lastRowContent).toBeDefined();
  });

  it("doit filtrer les lignes avec la recherche globale", async () => {
    const user = userEvent.setup();
    render(
      <AutoTable
        schema={schema}
        data={data}
        globalFilter={{ enabled: true, placeholder: "Recherche rapide" }}
      />,
    );

    await user.type(
      screen.getByPlaceholderText("Recherche rapide"),
      "Marseille",
    );

    expect(screen.queryByText("Alice")).toBeNull();
    expect(screen.queryByText("Bob")).toBeNull();
    expect(screen.getByText("Charlie")).toBeDefined();
    expect(screen.getByText("Marseille")).toBeDefined();
  });
});
