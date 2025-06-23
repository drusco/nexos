import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import wordsUpperCase from "../utils/words-uppercase.js";
import {
  SidebarItemConfig,
  SidebarItemCategory,
  SidebarItemDoc,
  SidebarItem,
} from "@docusaurus/plugin-content-docs/src/sidebars/types.js";

/**
 * Extracts the label from frontmatter, or falls back to a formatted filename.
 */
const getFileLabel = (filePath: string): string => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter } = matter(fileContent);
  return frontmatter.title || wordsUpperCase(path.basename(filePath, ".md"));
};

/**
 * Sorts sidebar items to ensure files appear before folders.
 */
const sortSidebarItems = (items: SidebarItem[]): SidebarItem[] => {
  return items.sort((a, b) => {
    const aIsCategory = a.type === "category";
    const bIsCategory = b.type === "category";

    if (aIsCategory && !bIsCategory) return 1;
    if (!aIsCategory && bIsCategory) return -1;

    if (a.type !== "html" && b.type !== "html") {
      return (a.label || "").localeCompare(b.label || "");
    }

    return 0;
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
): SidebarItem[] => {
  const folders: SidebarItemCategory[] = [];
  const files: SidebarItemDoc[] = [];
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

const convertItemsToMarkdown = (items: SidebarItem[]): string => {
  let markdown = "";
  items.forEach((item) => {
    if (item.type === "category") {
      markdown += `\n## ${item.label}\n\n`;
      if (item.items) {
        markdown += convertItemsToMarkdown(item.items);
      }
    } else if (item.type === "doc") {
      markdown += `- [${item.label}](${item.id}.md)\n`;
    }
  });
  return markdown;
};

const createDocsCategory = (
  dir: string,
  options: {
    label?: string;
    collapsed?: boolean;
    collapsible?: boolean;
    createIndex?: boolean;
  } = { createIndex: true },
): SidebarItemConfig => {
  const label = options.label ?? wordsUpperCase(path.basename(dir));
  const fullPath = path.resolve(`./docs/${dir}`);
  const hasRootIndex = fs.existsSync(path.join(fullPath, "index.md"));

  const sidebarItems = buildSidebarItems(fullPath, dir, fullPath, {
    collapsed: options.collapsed,
    collapsible: options.collapsible,
  });

  if (options.createIndex) {
    const indexContents = [
      "---",
      `title: ${label}`,
      "hide_table_of_contents: false",
      "---",
      convertItemsToMarkdown(sidebarItems),
    ].join("\n");

    fs.writeFileSync(path.resolve(fullPath, "index.md"), indexContents, {
      encoding: "utf-8",
    });
  }

  return {
    type: "category",
    items: sidebarItems,
    ...(hasRootIndex ? { link: { type: "doc", id: `${dir}/index` } } : {}),
    ...{
      label: label,
      collapsed: options.collapsed,
      collapsible: options.collapsible,
    },
  };
};

export default createDocsCategory;
