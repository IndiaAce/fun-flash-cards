/* ============================================================
   COMPAGNON — App store (React context over the storage layer)
   Single source of truth in memory; persists to localStorage on
   every change. Features read slices and call actions; none of
   them touch localStorage directly.
   ============================================================ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CorrectionEntry,
  Flashcard,
  GradeId,
  PersistedState,
  ReviewLogEntry,
  Settings,
} from "@/lib/types";
import { applyCorrection } from "@/lib/corrections";
import {
  loadState,
  saveState,
  repo,
  downloadBackup,
  importJSON,
  scheduleBackup,
  type NewCardInput,
} from "@/lib/storage";
import { applyGrade, isLapse } from "@/lib/srs";

export interface BulkResult {
  added: number;
  skipped: number;
}

interface StoreValue {
  cards: Flashcard[];
  reviewLog: ReviewLogEntry[];
  corrections: CorrectionEntry[];
  settings: Settings;

  addCard: (input: NewCardInput) => void;
  updateCard: (id: string, patch: Partial<Flashcard>) => void;
  removeCard: (id: string) => void;
  bulkAdd: (inputs: NewCardInput[]) => BulkResult;

  /**
   * Grade a card during review: schedules it via FSRS, logs the result, and
   * folds it into the corrections queue. Pass `{ corrections: true }` when the
   * grade comes from a corrections-queue session so correct reps count toward
   * graduation.
   */
  gradeCard: (cardId: string, grade: GradeId, opts?: { corrections?: boolean }) => void;

  setSettings: (patch: Partial<Settings>) => void;

  exportBackup: () => void;
  importBackup: (text: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadState());

  // Persist on every change. The first render already matches disk (or seeded).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    saveState(state);
    // Best-effort durable copy to disk via the sidecar (debounced, silent).
    scheduleBackup(state);
  }, [state]);

  const addCard = useCallback((input: NewCardInput) => {
    setState((s) => repo.addCard(s, input));
  }, []);

  const updateCard = useCallback((id: string, patch: Partial<Flashcard>) => {
    setState((s) => repo.updateCard(s, id, patch));
  }, []);

  const removeCard = useCallback((id: string) => {
    setState((s) => repo.removeCard(s, id));
  }, []);

  const bulkAdd = useCallback((inputs: NewCardInput[]): BulkResult => {
    const result = repo.bulkAdd(state, inputs);
    setState(result.state);
    return { added: result.added, skipped: result.skipped };
  }, [state]);

  const gradeCard = useCallback((cardId: string, grade: GradeId, opts?: { corrections?: boolean }) => {
    setState((s) => {
      const card = s.cards.find((c) => c.id === cardId);
      if (!card) return s;
      const { card: nextSrs } = applyGrade(card.srs, grade);
      const correct = !isLapse(grade);
      const entry: ReviewLogEntry = {
        id: crypto.randomUUID(),
        cardId,
        grade,
        correct,
        reviewedAt: new Date().toISOString(),
        category: card.category,
        tags: card.tags,
      };
      return {
        ...s,
        cards: s.cards.map((c) => (c.id === cardId ? { ...c, srs: nextSrs } : c)),
        reviewLog: [...s.reviewLog, entry],
        corrections: applyCorrection(s.corrections, cardId, correct, opts?.corrections ?? false),
      };
    });
  }, []);

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const exportBackup = useCallback(() => downloadBackup(state), [state]);

  const importBackup = useCallback((text: string) => {
    const imported = importJSON(text);
    setState(imported);
  }, []);

  const value: StoreValue = useMemo(
    () => ({
      cards: state.cards,
      reviewLog: state.reviewLog,
      corrections: state.corrections,
      settings: state.settings,
      addCard,
      updateCard,
      removeCard,
      bulkAdd,
      gradeCard,
      setSettings,
      exportBackup,
      importBackup,
    }),
    [state, addCard, updateCard, removeCard, bulkAdd, gradeCard, setSettings, exportBackup, importBackup],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
