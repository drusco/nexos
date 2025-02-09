import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import type { VersionOptions } from "@docusaurus/plugin-content-docs";
import docVersions from "./docusaurus/versions.json";

const versions: string[] = docVersions;

const reduceVersions = (amount: number): string[] => {
  const result = [];
  if (amount < 1) return result;

  versions.forEach((version) => {
    if (result.length === amount) return;
    if (!/^\d+\.\d+\.\d+$/.test(version)) return;
    result.push(version);
  });

  return result;
};

const getVersionsMetadata = (
  versions: string[],
): { [v: string]: VersionOptions } => {
  const result: { [v: string]: VersionOptions } = {};
  versions.forEach((version) => {
    result[version] = {
      label: `v${version}`,
      path: version,
    };
  });
  return result;
};

const visibleVersions = reduceVersions(3);
const versionsMetadata = getVersionsMetadata(visibleVersions);

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
          includeCurrentVersion: false,
          onlyIncludeVersions: [...visibleVersions, "next"],
          lastVersion: visibleVersions[0],
          versions: {
            next: {
              label: "@next",
              path: "next",
              //banner: "none",
            },
            ...versionsMetadata,
          },
          sidebarPath: "./sidebars.ts",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  customFields: {
    latestVersion: visibleVersions[0] || "next",
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
          sidebarId: "typedocSidebar",
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
        out: "./docs",
        entryPoints: ["../src/index.ts"],
        readme: "none",
        tsconfig: "../tsconfig.json",
        plugin: ["typedoc-plugin-markdown"],
        githubPages: true,
        entryFileName: "index.md",
        sidebar: {
          autoConfiguration: true,
          pretty: false,
        },
      },
    ],
  ],
};

export default config;
