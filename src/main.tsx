import ReactDOM from "react-dom/client";
import { App } from "@/app";
import { initializeApp } from "./app";
import "@/styles/semantic.css";

// Initialize the app
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
