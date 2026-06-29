// =============================================================================
// Tests — i18n.ts
// =============================================================================
import { describe, expect, it } from "vitest";
import { getMessages, registerLocale } from "../i18n";
import type { I18nMessages } from "../types";

describe("i18n", () => {
  it("retourne les messages par défaut (en)", () => {
    const msg = getMessages("en");
    expect(msg.required).toBe("This field is required");
    expect(msg.minLength(5)).toBe("Must be at least 5 characters");
  });

  it("retourne les messages en français", () => {
    const msg = getMessages("fr");
    expect(msg.required).toBe("Ce champ est obligatoire");
    expect(msg.minLength(5)).toBe("Doit contenir au moins 5 caractère(s)");
  });

  it("fallback sur 'en' si la locale est inconnue", () => {
    const msg = getMessages("de");
    expect(msg.required).toBe("This field is required");
  });

  it("permet d'enregistrer une nouvelle locale", () => {
    const messages: I18nMessages = {
      required: "Requis",
      minLength: (n) => `Min ${n}`,
      maxLength: (n) => `Max ${n}`,
      minimum: (n) => `Min ${n}`,
      maximum: (n) => `Max ${n}`,
      exclusiveMinimum: (n) => `EMin ${n}`,
      exclusiveMaximum: (n) => `EMax ${n}`,
      pattern: (p) => `Pattern ${p}`,
      minItems: (n) => `MinI ${n}`,
      maxItems: (n) => `MaxI ${n}`,
      uniqueItems: "Unique",
      multipleOf: (n) => `Mult ${n}`,
      invalidType: (t) => `Type ${t}`,
      invalidFormat: (f) => `Format ${f}`,
      invalidEnum: (e) => `Enum ${e}`,
    };
    registerLocale("es", messages);
    const msg = getMessages("es");
    expect(msg.required).toBe("Requis");
    expect(msg.minLength(10)).toBe("Min 10");
  });

  it("permet de surcharger des messages ponctuellement", () => {
    const msg = getMessages("en", {
      required: "HEY! Required!",
    });
    expect(msg.required).toBe("HEY! Required!");
    // Vérifie que les autres ne sont pas écrasés
    expect(msg.minLength(5)).toBe("Must be at least 5 characters");
  });
});
