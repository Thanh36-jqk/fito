import { Bap } from "./Bap";

export function EmptyState({
  mood = "happy",
  title,
  children,
  hand,
}: {
  mood?: "happy" | "sad" | "wow";
  title: string;
  children?: React.ReactNode;
  hand?: string;
}) {
  return (
    <div className="empty">
      <Bap mood={mood} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {hand && <span className="hand">{hand}</span>}
    </div>
  );
}
