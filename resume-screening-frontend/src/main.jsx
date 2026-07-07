import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import useThemeStore from "./store/themeStore";
import { preloadRoutes } from "./utils/preloadRoutes";

// Initialize theme before render
useThemeStore.getState().initTheme();

// Pre-load route components if user is already logged in
if (localStorage.getItem("token")) {
  preloadRoutes();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
