import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AlertMessageProvider } from "./context/AlertMessageContext";
import { SummarizerProvider } from "./context/SummarizerContext";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AlertMessageProvider>
      <AuthProvider>
        <SummarizerProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </SummarizerProvider>
      </AuthProvider>
    </AlertMessageProvider>
  </StrictMode>,
);
