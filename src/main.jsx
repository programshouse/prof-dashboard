import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App";
import { AppWrapper } from "./components/common/PageMeta";
import { ConfirmDeleteProvider } from "./components/ui/ConfirmDeleteProvider";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppWrapper>
        <ConfirmDeleteProvider>
          <App />
        </ConfirmDeleteProvider>
      </AppWrapper>
    </StrictMode>,
  );
}
