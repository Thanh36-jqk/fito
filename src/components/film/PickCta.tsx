"use client";

import { ChevronRight } from "lucide-react";
import { useFito, type PickWhere } from "@/lib/store";
import { Bap } from "../Bap";

export function PickCta({ where, title, sub }: { where?: PickWhere; title: string; sub: string }) {
  const { openPicker } = useFito();
  return (
    <button type="button" className="ticket cta" onClick={() => openPicker(where)}>
      <Bap mood={where === "home" ? "wow" : "happy"} />
      <div className="ct">
        <b>{title}</b>
        <span>{sub}</span>
      </div>
      <ChevronRight className="size-6 text-muted" aria-hidden />
    </button>
  );
}
