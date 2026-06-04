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
  CheatSheet,
  Flashcard,
  GradeId,
  PersistedState,
  ReviewLogEntry,
  Settings,
} from "@/lib/types";
import {
  loadState,
  saveState,
  repo,
  downloadBackup,
  importJSON,
  type NewCardInput,
} from "@/lib/storage";
import { applyGrade, isLapse } from "@/lib/srs";
import { BUILTIN_CHEATSHEETS } from "@/data/subjonctif";

export interface BulkResult {
  added: number;
  skipped: number;
}

interface StoreValue {
  cards: Flashcard[];
  reviewLog: ReviewLogEntry[];
  settings: Settings;
  /** Built-in sheets plus any the user authored. */
  cheatSheets: CheatSheet[];

  addCard: (input: NewCardInput) => void;
  updateCard: (id: string, patch: Partial<Flashcard>) => void;
  removeCard: (id: string) => void;
  bulkAdd: (inputs: NewCardInput[]) => BulkResult;

  /** Grade a card during review: schedules it via FSRS and logs the result. */
  gradeCard: (cardId: string, grade: GradeId) => void;

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

  const gradeCard = useCallback((cardId: string, grade: GradeId) => {
    setState((s) => {
      const card = s.cards.find((c) => c.id === cardId);
      if (!card) return s;
      const { card: nextSrs } = applyGrade(card.srs, grade);
      const entry: ReviewLogEntry = {
        id: crypto.randomUUID(),
        cardId,
        grade,
        correct: !isLapse(grade),
        reviewedAt: new Date().toISOString(),
        category: card.category,
        tags: card.tags,
      };
      return {
        ...s,
        cards: s.cards.map((c) => (c.id === cardId ? { ...c, srs: nextSrs } : c)),
        reviewLog: [...s.reviewLog, entry],
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

  const cheatSheets = useMemo(
    () => [...BUILTIN_CHEATSHEETS, ...state.customCheatSheets],
    [state.customCheatSheets],
  );

  const value: StoreValue = useMemo(
    () => ({
      cards: state.cards,
      reviewLog: state.reviewLog,
      settings: state.settings,
      cheatSheets,
      addCard,
      updateCard,
      removeCard,
      bulkAdd,
      gradeCard,
      setSettings,
      exportBackup,
      importBackup,
    }),
    [state, cheatSheets, addCard, updateCard, removeCard, bulkAdd, gradeCard, setSettings, exportBackup, importBackup],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
