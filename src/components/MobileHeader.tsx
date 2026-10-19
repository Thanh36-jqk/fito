import Link from "next/link";
import { Search, Settings } from "lucide-react";
import { Online } from "./Online";
import { PaletteToggle } from "./PaletteToggle";
import { SignOutButton } from "./SignOutButton";

/* Chỉ hiện dưới 1024px; trên máy tính logo và bảng màu nằm ở thanh bên. */
export function MobileHeader() {
  return (
    <header className="flex items-center justify-between gap-3 pb-2.5 pt-1.5 lg:hidden">
      <div className="logo">
        Fito<small>sổ tay xem phim của hai đứa</small>
      </div>
      <div className="flex items-center gap-2">
        <Online className="hidden min-[480px]:flex" />
        <Link href="/tim" transitionTypes={["tab"]} className="icon-btn search-btn" aria-label="Tìm phim">
          <Search className="size-5" aria-hidden />
        </Link>
        <Link href="/cai-dat" transitionTypes={["tab"]} className="icon-btn search-btn" aria-label="Cài đặt">
          <Settings className="size-5" aria-hidden />
        </Link>
        <PaletteToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
