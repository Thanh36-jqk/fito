const UNDERLINE = "M2 9 C 20 3, 35 13, 52 7 S 85 4, 98 8";

/* Tiêu đề lớn kiểu bản mẫu: phần nhấn có nét gạch chân vẽ tay. */
export function Hello({ lead, highlight }: { lead: string; highlight: string }) {
  return (
    <h1 className="hello">
      {lead}{" "}
      <span className="hl">
        {highlight}
        <svg viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden>
          <path d={UNDERLINE} />
        </svg>
      </span>
    </h1>
  );
}
