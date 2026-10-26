"use client";

// Realtime cho Match: cập nhật danh sách trùng gu khi người kia quẹt, và cho biết người kia có đang online không.
import { useEffect, useRef, useState } from "react";
import { fetchMatches } from "./swipes-actions";
import type { MatchEntry } from "./swipes";
import { createClient } from "./supabase/client";
import { hasSupabase } from "./supabase/env";

export function useMatchRealtime(initial: MatchEntry[]) {
  const [matches, setMatches] = useState<MatchEntry[]>(initial);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const seen = useRef(new Set(initial.map((m) => m.card.id)));

  async function refresh(onNew?: (fresh: MatchEntry[]) => void) {
    const list = await fetchMatches();
    const fresh = list.filter((m) => !seen.current.has(m.card.id));
    list.forEach((m) => seen.current.add(m.card.id));
    setMatches(list);
    if (fresh.length) onNew?.(fresh);
  }

  // Chèn match do chính mình vừa tạo (từ kết quả recordSwipe), tránh đợi vòng realtime.
  function addMatch(m: MatchEntry) {
    seen.current.add(m.card.id);
    setMatches((prev) => (prev.some((x) => x.card.id === m.card.id) ? prev : [m, ...prev]));
  }

  const onNewRef = useRef<((fresh: MatchEntry[]) => void) | null>(null);

  useEffect(() => {
    if (!hasSupabase) return;
    const sb = createClient();
    let active = true;

    const changes = sb
      .channel("match-swipes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "swipes" }, () => {
        if (active) void refresh((fresh) => onNewRef.current?.(fresh));
      })
      .subscribe();

    let presence: ReturnType<typeof sb.channel> | null = null;
    sb.auth.getUser().then(({ data }) => {
      const me = data.user?.id;
      if (!me || !active) return;
      presence = sb.channel("match-presence", { config: { presence: { key: me } } });
      presence
        .on("presence", { event: "sync" }, () => {
          const state = presence!.presenceState();
          setPartnerOnline(Object.keys(state).some((k) => k !== me));
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") void presence!.track({ at: Date.now() });
        });
    });

    return () => {
      active = false;
      void sb.removeChannel(changes);
      if (presence) void sb.removeChannel(presence);
    };
  }, []);

  return {
    matches,
    partnerOnline,
    addMatch,
    setOnNew: (fn: (fresh: MatchEntry[]) => void) => {
      onNewRef.current = fn;
    },
  };
}
