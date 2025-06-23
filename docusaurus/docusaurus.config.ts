import type { Config } from "@docusaurus/types";
import { i18nConfig } from "./config/i18n";
import { classicPreset } from "./config/presets/preset-classic";
import { themeConfig } from "./config/theme";
import { docusaurusPuginTypedoc } from "./config/plugins/docusaurus-plugin-typedoc";
import {
  projectName,
  organizationName,
  tagline,
  lastVersion,
} from "./config/constants";
import { docusaurusSearchLocal } from "./config/themes/docusaurus-search-local";

const config: Config = {
  organizationName,
  title: "Nexos Documentation",
  tagline,
  url: "https://drusco.github.io",
  baseUrl: `/${projectName}/`,
  trailingSlash: false,
  favicon: "img/favicon.ico",
  titleDelimiter: "·",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",

  i18n: i18nConfig,
  presets: [classicPreset],
  themeConfig: themeConfig,
  plugins: [docusaurusPuginTypedoc, "docusaurus-plugin-sass"],
  themes: [docusaurusSearchLocal],

  customFields: {
    lastVersion,
    projectName,
  },
};

export default config;
