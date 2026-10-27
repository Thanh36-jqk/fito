export const PALETTES = [
  { id: "neon", label: "Neon" },
  { id: "keo", label: "Kẹo" },
  { id: "hoanghon", label: "Hoàng hôn" },
  { id: "bacha", label: "Bạc Hà" },
  { id: "nho", label: "Nho" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];

export const PALETTE_KEY = "fito-palette";

// Chạy trong <head> trước khi trang vẽ. Sau này bảng màu sẽ lưu theo tài khoản (Supabase).
export const PALETTE_SCRIPT = `try{var p=localStorage.getItem("${PALETTE_KEY}");if(p&&${JSON.stringify(
  PALETTES.map((p) => p.id),
)}.indexOf(p)>-1)document.documentElement.dataset.palette=p}catch(e){}`;
