export const docusaurusPuginTypedoc = [
  "docusaurus-plugin-typedoc",
  {
    out: "./docs/api",
    entryPoints: ["../src/index.ts"],
    readme: "none",
    tsconfig: "../tsconfig.json",
    watch: process.env.TYPEDOC_WATCH === "true",
    plugin: ["typedoc-plugin-no-inherit", "./plugins/typedoc-plugin-hooks.mjs"],
    githubPages: true,
    entryFileName: "index.md",
    // typedoc-plugin-no-inherit
    inheritNone: true,
    // sidebar options
    sidebar: {
      autoConfiguration: true,
      pretty: true,
    },
  },
];
