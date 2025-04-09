// ** PLugin to customize the markdown files

// @ts-check
import { MarkdownPageEvent } from "typedoc-plugin-markdown";

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, (page) => {
    switch (page.url) {
      case "index.md":
        page.contents = page.contents.replace(
          /^# [0-9A-z-_]+$/m,
          "# API Reference",
        );
        break;
      default:
        break;
    }
  });
}
