import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import wordsUpperCase from "@site/utils/wordsUpperCase";

type customFields = {
  [x: string]: string;
};

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const { lastVersion, projectName } = siteConfig.customFields as customFields;
  const versionPath = lastVersion === "current" ? "" : lastVersion;

  return (
    <Layout title="Home">
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>{wordsUpperCase(projectName)}</h1>
        <p>Simplifies proxy creation and trap handling using events</p>
        <Link to={`/docs/${versionPath}`}>Get started</Link>
      </div>
    </Layout>
  );
}
