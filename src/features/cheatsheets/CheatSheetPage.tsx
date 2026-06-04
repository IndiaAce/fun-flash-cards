/* ============================================================
   COMPAGNON — A single cheat sheet page
   ============================================================ */

import { useNavigate, useParams } from "react-router-dom";
import { Button, EmptyState, Surface } from "@/components/kit";
import { useStore } from "@/app/store";
import { CheatSheetView } from "./CheatSheetView";

export function CheatSheetPage() {
  const { id } = useParams<{ id: string }>();
  const { cheatSheets } = useStore();
  const navigate = useNavigate();
  const sheet = cheatSheets.find((s) => s.id === id);

  if (!sheet) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 32px" }}>
        <Surface elevation="sm">
          <EmptyState
            icon="book"
            title="Cheat sheet not found"
            body="It may have been removed."
            action={<Button variant="quiet" onClick={() => navigate("/cheatsheets")}>Back to cheat sheets</Button>}
          />
        </Surface>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 32px 0" }}>
        <Button variant="ghost" size="sm" icon="arrowLeft" onClick={() => navigate("/cheatsheets")}>
          All cheat sheets
        </Button>
      </div>
      <CheatSheetView sheet={sheet} />
    </>
  );
}
