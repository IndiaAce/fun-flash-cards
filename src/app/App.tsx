/* ============================================================
   COMPAGNON — Router
   The two pillars + home/dashboard + pal + settings live under the
   Shell (with sidebar). The focused review session renders full-
   screen outside the Shell.
   ============================================================ */

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StoreProvider } from "./store";
import { Shell } from "./Shell";
import { Home } from "@/features/dashboard/Home";
import { ReviewLanding } from "@/features/flashcards/ReviewLanding";
import { ReviewRun } from "@/features/flashcards/ReviewRun";
import { Corpus } from "@/features/flashcards/Corpus";
import { CheatSheetsIndex } from "@/features/cheatsheets/CheatSheetsIndex";
import { CheatSheetPage } from "@/features/cheatsheets/CheatSheetPage";
import { Pal } from "@/features/pal/Pal";
import { SettingsPage } from "@/features/settings/SettingsPage";

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/review" element={<ReviewLanding />} />
            <Route path="/corpus" element={<Corpus />} />
            <Route path="/cheatsheets" element={<CheatSheetsIndex />} />
            <Route path="/cheatsheets/:id" element={<CheatSheetPage />} />
            <Route path="/pal" element={<Pal />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          {/* Focused study mode — full screen, no chrome. */}
          <Route path="/review/run" element={<ReviewRun />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
