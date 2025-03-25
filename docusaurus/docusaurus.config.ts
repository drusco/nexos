import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import type { VersionOptions } from "@docusaurus/plugin-content-docs";
import docVersions from "./versions.json";

const SEMANTIC_VERSION = /^\d+\.\d+\.\d+$/;

const getVersionsMetadata = (
  versions: string[],
): { [v: string]: VersionOptions } => {
  const result: { [v: string]: VersionOptions } = {};
  versions.forEach((version) => {
    const hasPrefix = SEMANTIC_VERSION.test(version);
    result[version] = {
      label: `${hasPrefix ? "v" : ""}${version}`,
      path: version,
    };
  });
  return result;
};

const versions: string[] = docVersions;
const versionsMetadata = getVersionsMetadata(versions);

// At least one version should exist for docs to work
if (!versions.length) {
  versions.push("current");
  versionsMetadata.current = {
    label: "development",
    path: "",
  };
}

const config: Config = {
  title: "nexos",
  tagline: "Simplifies proxy creation and trap handling using events",
  favicon: "img/favicon.ico",
  titleDelimiter: "·",

  url: "https://drusco.github.io/",
  baseUrl: "/nexos/",

  organizationName: "drusco",
  projectName: "nexos",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          includeCurrentVersion: versions.includes("current"),
          lastVersion:
            versions.find((version) => SEMANTIC_VERSION.test(version)) ||
            versions[0],
          versions: versionsMetadata,
          sidebarPath: "./sidebars.ts",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  customFields: {
    latestVersion: versions[0],
  },

  themeConfig: {
    navbar: {
      title: "Nexos",
      logo: {
        alt: "Nexos logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docsVersionDropdown",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "right",
          label: "Docs",
        },
        {
          href: "https://github.com/drusco/nexos",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.vsDark,
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        out: "./docs/api",
        entryPoints: ["../src/index.ts"],
        readme: "none",
        tsconfig: "../tsconfig.json",
        watch: process.env.TYPEDOC_WATCH === "true",
        plugin: [
          "typedoc-plugin-no-inherit",
          "./plugins/typedoc-plugin-hooks.mjs",
        ],
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
    ],
  ],
};

export default config;
