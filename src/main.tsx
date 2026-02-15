import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { clearOldCachesIfVersionChanged } from "@/utils/cache";

// Bump this version when you want to force-clear the PWA cache on clients
clearOldCachesIfVersionChanged("2026-02-15-01");

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
