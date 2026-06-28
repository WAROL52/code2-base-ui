"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const InputFieldStory = dynamic(() => import("./input-field.story").then((m) => {
  const StoryComponent = m.story.WithControl;
  return { default: StoryComponent };
}), { ssr: false });

const SelectFieldStory = dynamic(() => import("./select-field.story").then((m) => {
  const StoryComponent = m.story.WithControl;
  return { default: StoryComponent };
}), { ssr: false });

const CheckboxFieldStory = dynamic(() => import("./checkbox-field.story").then((m) => {
  const StoryComponent = m.story.WithControl;
  return { default: StoryComponent };
}), { ssr: false });

const TextareaFieldStory = dynamic(() => import("./textarea-field.story").then((m) => {
  const StoryComponent = m.story.WithControl;
  return { default: StoryComponent };
}), { ssr: false });

export function StoryDemos(): ReactNode {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-2">InputField</h3>
        <InputFieldStory />
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-2">SelectField</h3>
        <SelectFieldStory />
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-2">CheckboxField</h3>
        <CheckboxFieldStory />
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-2">TextareaField</h3>
        <TextareaFieldStory />
      </section>
    </div>
  );
}
