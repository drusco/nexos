import React from "react";
import Layout from "@theme/Layout";

export default function Home() {
  return (
    <Layout title="Welcome!">
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>nexos</h1>
        <p>Simplifies proxy creation and trap handling using events</p>
        <a
          href="/nexos/docs"
          style={{ fontSize: "1.2rem", textDecoration: "none" }}
        >
          Get started
        </a>
      </div>
    </Layout>
  );
}
