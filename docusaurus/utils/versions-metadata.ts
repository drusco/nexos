import type { VersionOptions } from "@docusaurus/plugin-content-docs";

export const semverRegexp = /^\d+\.\d+\.\d+$/;

export const getVersionsMetadata = (
  versions: string[],
): { [v: string]: VersionOptions } => {
  const result: { [v: string]: VersionOptions } = {};
  versions.forEach((version) => {
    const hasPrefix = semverRegexp.test(version);
    result[version] = {
      label: `${hasPrefix ? "v" : ""}${version}`,
      path: version,
    };
  });
  return result;
};
