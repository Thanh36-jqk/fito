type Mood = "happy" | "sad" | "wow";

const MOUTH: Record<Mood, React.ReactNode> = {
  happy: <path d="M52 95 q8 9 16 0" stroke="#2A1D0F" strokeWidth="3" fill="none" strokeLinecap="round" />,
  sad: <path d="M52 99 q8 -7 16 0" stroke="#2A1D0F" strokeWidth="3" fill="none" strokeLinecap="round" />,
  wow: <ellipse cx="60" cy="97" rx="5" ry="6" fill="#2A1D0F" />,
};

/* Linh vật Bắp (xô bắp rang). Màu cố định vì là hình minh hoạ, không theo bảng màu. */
export function Bap({ mood = "happy", className = "" }: { mood?: Mood; className?: string }) {
  return (
    <svg viewBox="0 0 120 130" role="img" aria-label="Bắp, xô bắp rang" className={className}>
      <g fill="#FFF4D6" stroke="#2A1D0F" strokeWidth="3">
        <circle cx="34" cy="42" r="15" />
        <circle cx="86" cy="42" r="15" />
        <circle cx="58" cy="28" r="18" />
        <circle cx="46" cy="50" r="14" />
        <circle cx="74" cy="50" r="14" />
      </g>
      <path d="M22 54 h76 l-10 70 h-56z" fill="#FF5A5F" />
      <path d="M37 55 h15 l2 68 h-11z M68 55 h15 l-6 68 h-11z" fill="#FFF4D6" />
      <path d="M22 54 h76 l-10 70 h-56z" fill="none" stroke="#2A1D0F" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="49" cy="84" r="4.5" fill="#2A1D0F" />
      <circle cx="71" cy="84" r="4.5" fill="#2A1D0F" />
      <circle cx="42" cy="93" r="4" fill="#FF9DB0" />
      <circle cx="78" cy="93" r="4" fill="#FF9DB0" />
      {MOUTH[mood]}
    </svg>
  );
}
