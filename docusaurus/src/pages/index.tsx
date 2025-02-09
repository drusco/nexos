import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const latestVersion = siteConfig.customFields.latestVersion;

  return (
    <Layout title="Welcome!">
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>nexos</h1>
        <p>Simplifies proxy creation and trap handling using events</p>
        <Link to={`/docs/${latestVersion}`}>Get started</Link>
      </div>
    </Layout>
  );
}
