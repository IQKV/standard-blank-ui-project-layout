import ReactDOM from "react-dom/client";
import { App } from "@/app";
import { initializeApp } from "./app";
import "@/styles/semantic.css";
import React from "react";

// Initialize the app
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
