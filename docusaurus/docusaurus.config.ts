import type { Config } from "@docusaurus/types";
import { i18nConfig } from "./config/i18n";
import { presetsConfig, lastVersion } from "./config/presets";
import { themeConfig } from "./config/theme";
import { docusaurusPuginTypedoc } from "./config/plugins/docusaurusPuginTypedoc";
import { projectName, organizationName, tagline } from "./config/constants";

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
  presets: presetsConfig,
  themeConfig: themeConfig,
  plugins: [docusaurusPuginTypedoc],

  customFields: {
    lastVersion,
    projectName,
  },
};

export default config;
