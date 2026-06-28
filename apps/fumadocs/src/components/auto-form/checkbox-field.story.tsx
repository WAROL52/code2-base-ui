import { defineStory } from "@/lib/story";
import { CheckboxField } from "@code2-base-ui/auto-form-render-shadcn";

export const story = defineStory({
  Component: CheckboxField,
  args: [
    {
      variant: "Default",
      initial: {
        name: "newsletter",
        label: "S'abonner à la newsletter",
      },
    },
    {
      variant: "Required",
      initial: {
        name: "terms",
        label: "J'accepte les conditions d'utilisation",
      },
    },
  ],
});
