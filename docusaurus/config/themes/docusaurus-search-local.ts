export const docusaurusSearchLocal = [
  require.resolve("@easyops-cn/docusaurus-search-local"),
  /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
  {
    // ... Your options.
    // `hashed` is recommended as long-term-cache of index file is possible.
    hashed: true,

    // For Docs using Chinese, it is recomended to set:
    // language: ["en", "zh"],

    // If you're using `noIndex: true`, set `forceIgnoreNoIndex` to enable local index:
    // forceIgnoreNoIndex: true,
  },
];
