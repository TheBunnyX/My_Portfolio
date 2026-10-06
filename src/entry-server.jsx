import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { normalizePortfolioContent } from "./content";

// Used only by scripts/prerender.mjs at build time so crawlers get real HTML instead of an empty root.
export const prepareContent = (raw) => normalizePortfolioContent(raw);

export const render = (content) =>
  renderToString(
    <React.StrictMode>
      <App initialContent={content} />
    </React.StrictMode>,
  );
