// @ts-check
import { MarkdownPageEvent } from "typedoc-plugin-markdown";
/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, (page) => {
    switch (page.url) {
      case "index.md":
        page.contents = page.contents.replace("# nexos", "# API Reference");
        break;
      default:
        break;
    }
  });
}
