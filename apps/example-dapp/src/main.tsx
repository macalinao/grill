/** biome-ignore-all lint/style/noNonNullAssertion: trust me */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.js";
import { App } from "./App.js";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
