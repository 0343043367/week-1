import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import { StrictMode } from "react";

createRoot(document.getElementById("root")!).render(
  // Temporarily disable StrictMode to fix double OpenID requests
  // <StrictMode>
  <App />
  // </StrictMode>
);
