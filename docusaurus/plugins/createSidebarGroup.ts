import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { SidebarItemConfig } from "@docusaurus/plugin-content-docs/src/sidebars/types.js";

const wordsUpperCase = (text: string): string =>
  text
    .split(" ")
    .map((word) =>
      word.length < 3 ? word : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");

/**
 * Extracts the label from frontmatter, or falls back to a formatted filename.
 */
const getFileLabel = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter } = matter(fileContent);
  return (
    frontmatter.title ||
    wordsUpperCase(path.basename(filePath, ".md").replace(/-/g, " "))
  );
};

/**
 * Sorts sidebar items to ensure folders appear before files.
 */
const sortSidebarItems = (items: SidebarItemConfig[]): SidebarItemConfig[] => {
  return items.sort((a, b) => {
    const aIsCategory = a.type === "category";
    const bIsCategory = b.type === "category";

    if (aIsCategory && !bIsCategory) return -1;
    if (!aIsCategory && bIsCategory) return 1;
    return (a.label || "").localeCompare(b.label || "");
  });
};

/**
 * This function recursively builds sidebar items (both folders and files).
 */
const buildSidebarItems = (
  currentDir: string,
  dir: string,
  fullPath: string,
  options?: { collapsed?: boolean; collapsible?: boolean },
): SidebarItemConfig[] => {
  const folders: SidebarItemConfig[] = [];
  const files: SidebarItemConfig[] = [];
  // let hasIndexFile = false;

  fs.readdirSync(currentDir, { encoding: "utf-8" }).forEach((item) => {
    const itemPath = path.join(currentDir, item);
    const relativePath = path.relative(fullPath, itemPath);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Recursively create a category for the subdirectory
      const subItems = buildSidebarItems(itemPath, dir, fullPath, options);
      const hasSubIndexFile = fs.existsSync(path.join(itemPath, "index.md"));

      folders.push({
        type: "category",
        label: wordsUpperCase(path.basename(item)),
        ...(hasSubIndexFile
          ? { link: { type: "doc", id: `${dir}/${relativePath}/index` } }
          : {}),
        items: subItems,
        collapsed: options?.collapsed ?? true,
        collapsible: options?.collapsible ?? true,
      });
    } else if (stat.isFile() && item.endsWith(".md")) {
      if (item === "index.md") {
        // hasIndexFile = true;
      } else {
        files.push({
          type: "doc",
          id: `${dir}/${relativePath.replace(/\.md$/, "")}`,
          label: getFileLabel(itemPath),
        });
      }
    }
  });

  return sortSidebarItems([...folders, ...files]);
};

const createSidebarGroup = (
  dir: string,
  options?: { label?: string; collapsed?: boolean; collapsible?: boolean },
): SidebarItemConfig => {
  const fullPath = path.resolve(`./docs/${dir}`);

  const sidebarItems = buildSidebarItems(fullPath, dir, fullPath, options);
  const hasRootIndex = fs.existsSync(path.join(fullPath, "index.md"));

  return {
    type: "category",
    label: wordsUpperCase(path.basename(dir)),
    ...(hasRootIndex ? { link: { type: "doc", id: `${dir}/index` } } : {}),
    items: sidebarItems,
    ...options,
  };
};

export default createSidebarGroup;
