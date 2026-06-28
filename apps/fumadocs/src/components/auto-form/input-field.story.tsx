import { defineStory } from "@/lib/story";
import { InputField } from "@code2-base-ui/auto-form-render-shadcn";

export const story = defineStory({
  Component: InputField,
  args: [
    {
      variant: "Default",
      initial: {
        name: "username",
        label: "Nom d'utilisateur",
        placeholder: "Entrez votre nom",
        type: "text",
        required: true,
      },
    },
    {
      variant: "With description",
      initial: {
        name: "email",
        label: "Email",
        description: "Nous ne partagerons pas votre email",
        placeholder: "vous@example.com",
        type: "email",
      },
    },
    {
      variant: "Optional",
      initial: {
        name: "phone",
        label: "Téléphone",
        placeholder: "+33 6 12 34 56 78",
        type: "tel",
      },
    },
    {
      variant: "Password",
      initial: {
        name: "password",
        label: "Mot de passe",
        type: "password",
        required: true,
      },
    },
  ],
});
