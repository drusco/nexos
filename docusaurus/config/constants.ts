import { getVersionsMetadata, semverRegexp } from "../utils/versions-metadata";
import docVersions from "../versions.json";

export const projectName = "nexos";
export const organizationName = "drusco";
export const tagline =
  "Simplifies proxy creation and trap handling using events";

export const versions: string[] = docVersions;
export const versionsMetadata = getVersionsMetadata(versions);

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
