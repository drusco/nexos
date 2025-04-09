import type * as Preset from "@docusaurus/preset-classic";
import { themes as prismThemes } from "prism-react-renderer";
import wordsUpperCase from "../utils/wordsUpperCase";
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
        href: `https://github.com/${organizationName}/${projectName}`,
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
} satisfies Preset.ThemeConfig;
