import type * as Preset from "@docusaurus/preset-classic";
import { themes as prismThemes } from "prism-react-renderer";
import wordsUpperCase from "../utils/words-uppercase";
import { organizationName, projectName } from "./constants";

export const themeConfig = {
  navbar: {
    title: wordsUpperCase(projectName),
    logo: {
      alt: "logo",
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
        type: "search",
        position: "right",
      },
      {
        href: `https://github.com/${organizationName}/${projectName}`,
        position: "right",
        className: "header-github-link",
        "aria-label": "GitHub repository",
      },
    ],
  },
  prism: {
    theme: prismThemes.vsLight,
    darkTheme: prismThemes.vsDark,
  },
  colorMode: {
    defaultMode: "light",
    disableSwitch: false,
    respectPrefersColorScheme: true,
  },
} satisfies Preset.ThemeConfig;
