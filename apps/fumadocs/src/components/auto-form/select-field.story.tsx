import { defineStory } from "@/lib/story";
import { SelectField } from "@code2-base-ui/auto-form-render-shadcn";

export const story = defineStory({
  Component: SelectField,
  args: [
    {
      variant: "Default",
      initial: {
        name: "role",
        label: "Rôle",
        placeholder: "Sélectionnez un rôle",
        options: [
          { value: "admin", label: "Administrateur" },
          { value: "user", label: "Utilisateur" },
          { value: "guest", label: "Invité" },
        ],
      },
    },
    {
      variant: "Required",
      initial: {
        name: "country",
        label: "Pays",
        placeholder: "Choisissez...",
        required: true,
        options: [
          { value: "fr", label: "France" },
          { value: "be", label: "Belgique" },
          { value: "ch", label: "Suisse" },
          { value: "ca", label: "Canada" },
        ],
      },
    },
  ],
});
