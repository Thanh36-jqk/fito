"use client";

// Trạng thái hai người (bản mẫu, chỉ trong bộ nhớ). Pha 4 thay bằng bảng swipes + Supabase Realtime.
import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from "react";
import { PARTNER_WANTS } from "./films";

export type MatchItem = { id: number; at: string; seat: string };

type State = {
  wants: number[];
  skips: number[];
  deck: number[];
  matches: MatchItem[];
  justMatched: number | null;
};

const DEFAULT_DECK = [1, 3, 2, 6, 4, 7, 8];

const initial: State = {
  wants: [5, 9],
  skips: [],
  deck: DEFAULT_DECK,
  matches: [
    { id: 5, at: "03/10", seat: "H07–08" },
    { id: 9, at: "12/10", seat: "E11–12" },
  ],
  justMatched: null,
};

type Action =
  | { type: "swipe"; id: number; want: boolean }
  | { type: "want"; id: number }
  | { type: "pushDeck"; ids: number[] }
  | { type: "resetDeck" }
  | { type: "closeMatch" };

const pad = (n: number) => String(n).padStart(2, "0");
function today() {
  const d = new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

function addWant(s: State, id: number): State {
  const wants = s.wants.includes(id) ? s.wants : [...s.wants, id];
  if (!PARTNER_WANTS.has(id) || s.matches.some((m) => m.id === id)) return { ...s, wants };
  const n = s.matches.length;
  const seat = `H${pad(9 + n * 2)}–${pad(10 + n * 2)}`;
  return { ...s, wants, matches: [...s.matches, { id, at: today(), seat }], justMatched: id };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "swipe": {
      const next = { ...s, deck: s.deck.filter((x) => x !== a.id) };
      return a.want ? addWant(next, a.id) : { ...next, skips: [...next.skips, a.id] };
    }
    case "want":
      return addWant(s, a.id);
    case "pushDeck": {
      const ids = a.ids.filter((id) => !s.matches.some((m) => m.id === id));
      return { ...s, deck: [...ids, ...s.deck.filter((id) => !ids.includes(id))] };
    }
    case "resetDeck":
      return { ...s, deck: DEFAULT_DECK.filter((id) => !s.matches.some((m) => m.id === id)) };
    case "closeMatch":
      return { ...s, justMatched: null };
  }
}

export type PickWhere = "cinema" | "home";

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  toast: (msg: string) => void;
  toastMsg: { id: number; text: string } | null;
  picker: { open: boolean; where?: PickWhere; key: number };
  openPicker: (where?: PickWhere) => void;
  closePicker: () => void;
};

const FitoContext = createContext<Ctx | null>(null);

export function FitoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [toastMsg, setToastMsg] = useState<Ctx["toastMsg"]>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((text: string) => {
    clearTimeout(timer.current);
    setToastMsg({ id: Date.now(), text });
    timer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);
  const [picker, setPicker] = useState<Ctx["picker"]>({ open: false, key: 0 });
  const openPicker = useCallback((where?: PickWhere) => setPicker((p) => ({ open: true, where, key: p.key + 1 })), []);
  const closePicker = useCallback(() => setPicker((p) => ({ ...p, open: false })), []);
  const value = useMemo(
    () => ({ state, dispatch, toast, toastMsg, picker, openPicker, closePicker }),
    [state, toast, toastMsg, picker, openPicker, closePicker],
  );
  return <FitoContext.Provider value={value}>{children}</FitoContext.Provider>;
}

export function useFito() {
  const c = useContext(FitoContext);
  if (!c) throw new Error("useFito phải nằm trong FitoProvider");
  return c;
}

export function buzz(p: number | number[]) {
  try {
    navigator.vibrate?.(p);
  } catch {}
}
