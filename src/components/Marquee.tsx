/* Bảng đèn rạp chạy chữ. Nội dung lặp 2 lần để cuộn liền mạch. */
export function Marquee({ text, label }: { text: string; label: string }) {
  return (
    <div className="marquee" aria-label={label}>
      <div className="track">
        <span>{text}</span>
        <span aria-hidden>{text}</span>
      </div>
    </div>
  );
}
