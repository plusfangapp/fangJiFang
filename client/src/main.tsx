import { createRoot } from "react-dom/client";
import App from "./App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import "./index.css";
import { setupPerformanceMode } from "./lib/performance";

// Activar optimizaciones de rendimiento
setupPerformanceMode();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
