import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const elementoRaiz = document.getElementById("root");
if (elementoRaiz) {
  createRoot(elementoRaiz).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
