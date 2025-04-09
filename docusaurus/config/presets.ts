import type * as Preset from "@docusaurus/preset-classic";
import {
  getVersionsMetadata,
  semverRegexp,
} from "../utils/getVersionsMetadata";
import docVersions from "../versions.json";

const versions: string[] = docVersions;
const versionsMetadata = getVersionsMetadata(versions);

// At least one version should exist for docs to work
if (!versions.length) {
  versions.push("current");
}

export const lastVersion =
  versions.find((version) => semverRegexp.test(version)) || versions[0];

// Overwrite version metadata for current version
if (lastVersion === "current") {
  versionsMetadata.current = {
    label: "development",
    path: "",
  };
}

export const presetsConfig = [
  [
    "classic",
    {
      docs: {
        includeCurrentVersion: versions.includes("current"),
        lastVersion,
        versions: versionsMetadata,
        sidebarPath: "./sidebars.ts",
      },
      theme: {
        customCss: "./src/css/custom.css",
      },
    } satisfies Preset.Options,
  ],
];
