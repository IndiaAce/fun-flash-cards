/* ============================================================
   COMPAGNON — A single guide page
   ============================================================ */

import { useNavigate, useParams } from "react-router-dom";
import { Button, EmptyState, Surface } from "@/components/kit";
import { getGuide } from "@/lib/content/registry";
import { GuideView } from "./GuideView";

export function GuidePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guide = id ? getGuide(id) : undefined;

  if (!guide) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 32px" }}>
        <Surface elevation="sm">
          <EmptyState
            icon="book"
            title="Guide not found"
            body="It may have been removed or renamed."
            action={<Button variant="quiet" onClick={() => navigate("/guides")}>Back to guides</Button>}
          />
        </Surface>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 32px 0" }}>
        <Button variant="ghost" size="sm" icon="arrowLeft" onClick={() => navigate("/guides")}>
          All guides
        </Button>
      </div>
      <GuideView guide={guide} />
    </>
  );
}
