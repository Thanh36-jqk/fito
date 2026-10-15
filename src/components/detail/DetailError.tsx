import { EmptyState } from "../EmptyState";

/* TMDB lỗi (không phải 404): báo nhẹ nhàng, không bịa dữ liệu. h2 ẩn để dialog vẫn có tên. */
export function DetailError() {
  return (
    <div className="sheet-scroll pt-14">
      <h2 id="dTitle" className="sr-only">TMDB đang trục trặc</h2>
      <EmptyState mood="sad" title="TMDB đang trục trặc">
        Chưa tải được phim này. Thử lại sau nha.
      </EmptyState>
    </div>
  );
}
