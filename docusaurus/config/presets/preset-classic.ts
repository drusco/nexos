import type * as Preset from "@docusaurus/preset-classic";
import { versionsMetadata, versions, lastVersion } from "../constants";

export const classicPreset = [
  "classic",
  {
    docs: {
      includeCurrentVersion: versions.includes("current"),
      lastVersion,
      versions: versionsMetadata,
      sidebarPath: "./sidebars.ts",
    },
    theme: {
      customCss: "./src/css/custom.scss",
    },
  } satisfies Preset.Options,
];
