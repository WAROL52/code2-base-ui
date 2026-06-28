import { defineStory } from "@/lib/story";
import { TextareaField } from "@code2-base-ui/auto-form-render-shadcn";

export const story = defineStory({
  Component: TextareaField,
  args: [
    {
      variant: "Default",
      initial: {
        name: "bio",
        label: "Biographie",
        placeholder: "Parlez-nous de vous...",
      },
    },
    {
      variant: "Required",
      initial: {
        name: "message",
        label: "Message",
        placeholder: "Votre message...",
        required: true,
      },
    },
  ],
});
