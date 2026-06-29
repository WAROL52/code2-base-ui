"use client";

import { type JsonSchema } from "@code-base-ui/json-schema-toolkit";
import { AutoTable } from "@code-base-ui/json-schema-toolkit/components";
import React from "react";

const userSchema: JsonSchema = {
  type: "object",
  title: "Liste des Utilisateurs",
  description: "Liste des utilisateurs actifs enregistrés sur la plateforme.",
  properties: {
    id: { type: "string", title: "ID User" },
    name: { type: "string", title: "Nom Complet" },
    age: { type: "number", title: "Âge" },
    isActive: { type: "boolean", title: "Actif" },
    metadata: {
      type: "object",
      title: "Métadonnées",
      properties: {
        lastLogin: {
          type: "string",
          format: "date-time",
          title: "Dernière Connexion",
        },
        role: { type: "string", title: "Rôle Plateforme" },
      },
    },
  },
};

const userData = [
  {
    id: "U-001",
    name: "Alice Dupont",
    age: 28,
    isActive: true,
    metadata: {
      lastLogin: "2023-11-20T10:00:00Z",
      role: "Admin",
    },
  },
  {
    id: "U-002",
    name: "Bob Martin",
    age: 34,
    isActive: false,
    metadata: {
      lastLogin: "2023-10-15T08:30:00Z",
      role: "User",
    },
  },
  {
    id: "U-003",
    name: "Charlie Leroy",
    age: 42,
    isActive: true,
    metadata: {
      lastLogin: "2023-11-22T14:45:00Z",
      role: "Moderator",
    },
  },
];

const transactionSchema: JsonSchema = {
  type: "object",
  title: "Historique des Transactions",
  description: "Dernières transactions financières effectuées.",
  properties: {
    txId: { type: "string", title: "Transaction ID" },
    amount: { type: "number", title: "Montant (€)" },
    status: {
      type: "string",
      title: "Statut",
      description: "État de la transaction",
    },
  },
};

const transactionData = Array.from({ length: 45 }).map((_, i) => ({
  txId: `TX-100${i}`,
  amount: parseFloat((Math.random() * 500).toFixed(2)),
  status: i % 3 === 0 ? "Failed" : "Success",
}));

const datawithNestedSchema: JsonSchema = {
  type: "object",
  title: "Données avec Schéma Imbriqué",
  description: "Exemple de données avec un schéma imbriqué pour les détails.",
  properties: {
    id: { type: "string", title: "ID" },
    name: { type: "string", title: "Nom" },
    metadata: {
      type: "object",
      title: "Métadonnées",
      properties: {
        lastLogin: {
          type: "string",
          format: "date-time",
          title: "Dernière Connexion",
        },
        role: { type: "string", title: "Rôle Plateforme" },
      },
    },
  },
};

const dataWithNested = [
  {
    id: "1",
    name: "Alice",
    metadata: {
      lastLogin: "2023-11-20T10:00:00Z",
      role: "Admin",
    },
  },
  {
    id: "2",
    name: "Bob",
    metadata: {
      lastLogin: "2023-10-15T08:30:00Z",
      role: "User",
    },
  },
  {
    id: "3",
    name: "Charlie",
    metadata: {
      lastLogin: "2023-11-22T14:45:00Z",
      role: "Moderator",
    },
  },
];

const nestedSchemaWithArray: JsonSchema = {
  type: "object",
  title: "Données avec Schéma Imbriqué et Tableau",
  description:
    "Exemple de données avec un schéma imbriqué contenant un tableau pour les détails.",
  properties: {
    id: { type: "string", title: "ID" },
    name: { type: "string", title: "Nom" },
    metadata: {
      type: "object",
      title: "Métadonnées",
      properties: {
        lastLogin: {
          type: "string",
          format: "date-time",
          title: "Dernière Connexion",
        },
        role: { type: "string", title: "Rôle Plateforme" },
      },
    },
  },
};

const dataWithNestedAndArray = [
  {
    id: "1",
    name: "Alice",
    metadata: {
      lastLogin: "2023-11-20T10:00:00Z",
      role: "Admin",
    },
  },
  {
    id: "2",
    name: "Bob",
    metadata: {
      lastLogin: "2023-10-15T08:30:00Z",
      role: "User",
    },
  },
  {
    id: "3",
    name: "Charlie",
    metadata: {
      lastLogin: "2023-11-22T14:45:00Z",
      role: "Moderator",
    },
  },
];

const nestedSchemaWithArray2: JsonSchema = {
  type: "object",
  title: "Données avec Schéma Imbriqué et Tableau de Détails",
  description:
    "Exemple de données avec un schéma imbriqué contenant un tableau pour les détails, avec un niveau de profondeur supplémentaire.",
  properties: {
    id: { type: "string", title: "ID" },
    name: { type: "string", title: "Nom" },
    metadata: {
      type: "object",
      title: "Métadonnées",
      properties: {
        lastLogin: {
          type: "string",
          format: "date-time",
          title: "Dernière Connexion",
        },
        role: { type: "string", title: "Rôle Plateforme" },
        activities: {
          type: "array",
          title: "Activités Récentes",
          items: {
            type: "object",
            title: "Activité",
            properties: {
              date: {
                type: "string",
                format: "date-time",
                title: "Date de l'Activité",
              },
              description: {
                type: "string",
                title: "Description de l'Activité",
              },
            },
          },
        },
      },
    },
  },
};

const dataWithNestedAndArray2 = [
  {
    id: "1",
    name: "Alice",
    metadata: {
      lastLogin: "2023-11-20T10:00:00Z",
      role: "Admin",
      activities: [
        {
          date: "2023-11-21T09:00:00Z",
          description: "Création d'un nouveau projet",
        },
        {
          date: "2023-11-22T14:30:00Z",
          description: "Mise à jour du profil",
        },
      ],
    },
  },
  {
    id: "2",
    name: "Bob",
    metadata: {
      lastLogin: "2023-10-15T08:30:00Z",
      role: "User",
      activities: [
        {
          date: "2023-10-16T10:00:00Z",
          description: "Connexion à la plateforme",
        },
        {
          date: "2023-10-17T12:45:00Z",
          description: "Participation à un forum de discussion",
        },
      ],
    },
  },
  {
    id: "3",
    name: "Charlie",
    metadata: {
      lastLogin: "2023-11-22T14:45:00Z",
      role: "Moderator",
      activities: [
        {
          date: "2023-11-23T08:15:00Z",
          description: "Modération d'un commentaire",
        },
        {
          date: "2023-11-24T16:00:00Z",
          description: "Réponse à une question d'utilisateur",
        },
      ],
    },
  },
];

export default function AutoTableDemo() {
  return (
    <div className="container mx-auto py-10 px-4 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-4">Démonstrations AutoTable</h1>
        <p className="text-muted-foreground mb-8">
          Exemples de l'utilisation du composant AutoTable depuis le
          json-schema-toolkit.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          Cas 1 : Tableau simple avec objets imbriqués
        </h2>
        <p className="text-sm text-muted-foreground">
          Les objets imbriqués comme{" "}
          <code className="bg-muted p-1 rounded">metadata</code> génèrent un
          bouton de déploiement (détail) natif.
        </p>
        <AutoTable schema={userSchema} data={userData} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          Cas 2 : Pagination et Recherche
        </h2>
        <p className="text-sm text-muted-foreground">
          Recherche globale activée avec pagination pageSize = 5.
        </p>
        <AutoTable
          schema={transactionSchema}
          data={transactionData}
          pagination={{ enabled: true, pageSize: 5 }}
          globalFilter={{
            enabled: true,
            placeholder: "Rechercher une transaction...",
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          Cas 3 : Données massives sans pagination
        </h2>
        <p className="text-sm text-muted-foreground">
          Un tableau de 45 lignes sans pagination (scroll vertical).
        </p>
        <div className="h-96 overflow-auto border rounded-xl shadow-inner">
          <AutoTable
            schema={transactionSchema}
            data={transactionData}
            pagination={{ enabled: false }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          Cas 4 : Données avec tableaux imbriqués
        </h2>
        <p className="text-sm text-muted-foreground">
          Les tableaux imbriqués comme{" "}
          <code className="bg-muted p-1 rounded">metadata.activities</code> sont
          affichés dans une vue détaillée.
        </p>
        <AutoTable
          schema={datawithNestedSchema}
          data={dataWithNestedAndArray2}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">
          Cas 5 : Données complexes avec plusieurs niveaux d'imbrication
        </h2>
        <p className="text-sm text-muted-foreground">
          Ce cas illustre l'affichage de données complexes avec plusieurs
          niveaux d'imbrication.
        </p>
        <AutoTable schema={userSchema} data={dataWithNestedAndArray2} />
      </section>
    </div>
  );
}
