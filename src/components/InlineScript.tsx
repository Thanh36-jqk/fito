/* Theo docs Next (preventing-flash-before-hydration): chạy khi tải trang, không cảnh báo khi render ở client. */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
