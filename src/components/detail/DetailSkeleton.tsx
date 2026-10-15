/* Khung xương giữ chỗ khi trang chi tiết đang tải. */
export function DetailSkeleton() {
  const block = "animate-pulse rounded-2xl bg-surface";
  return (
    <div className="sheet-scroll" aria-busy="true" aria-label="Đang tải phim">
      <div className="-mx-4 grid grid-cols-[118px_1fr] items-end gap-3.5 bg-surface-2/60 px-4 pb-4 pt-14 md:-mx-7 md:grid-cols-[170px_1fr] md:px-7">
        <div className={`${block} aspect-[2/3]`} />
        <div className="grid gap-2">
          <div className={`${block} h-8 w-3/4`} />
          <div className={`${block} h-4 w-1/2`} />
        </div>
      </div>
      <div className={`${block} mt-4 h-24`} />
      <div className="mt-4 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`${block} mx-auto size-14 rounded-full`} />
        ))}
      </div>
      <div className={`${block} mt-6 aspect-video`} />
    </div>
  );
}
