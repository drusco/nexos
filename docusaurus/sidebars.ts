import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";
import createDocsCategory from "./plugins/createDocsCategory.js";

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: "doc",
      label: "Introduction",
      id: "index",
    },
    {
      type: "doc",
      label: "Quick Start",
      id: "quick-start",
    },
    createDocsCategory("examples"),
    {
      type: "category",
      label: "API",
      collapsed: true,
      link: {
        type: "doc",
        id: "api/index",
      },
      items: require("./docs/api/typedoc-sidebar.cjs"),
    },
  ],
};

export default sidebars;
