/* Tạm thời tĩnh; pha 4 lấy trạng thái online thật từ Supabase Realtime. */
export function Online({ className = "" }: { className?: string }) {
  return (
    <span className={`items-center gap-1.5 text-[13px] text-muted ${className}`}>
      <i className="size-2 rounded-full bg-good shadow-[0_0_0_3px_color-mix(in_srgb,var(--good)_25%,transparent)]" />
      Người ấy online
    </span>
  );
}
