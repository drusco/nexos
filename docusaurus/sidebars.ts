import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
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
    {
      type: "doc",
      label: "Examples",
      id: "examples/index",
    },
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
