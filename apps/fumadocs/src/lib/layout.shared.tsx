import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { appName, gitConfig, docsRoute } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <span className="font-bold">{appName}</span>,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        text: "Documentation",
        url: docsRoute,
        active: "nested-url",
      },
      {
        text: "GitHub Registry",
        url: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
      },
    ],
  };
}
