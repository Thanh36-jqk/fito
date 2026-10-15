"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { BookOpen, Heart, Ticket, Tv, type LucideIcon } from "lucide-react";
import { Online } from "./Online";
import { PaletteToggle } from "./PaletteToggle";
import { SignOutButton } from "./SignOutButton";

const TABS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/", label: "Rạp", Icon: Ticket },
  { href: "/o-nha", label: "Ở nhà", Icon: Tv },
  { href: "/match", label: "Match", Icon: Heart },
  { href: "/nhat-ky", label: "Nhật ký", Icon: BookOpen },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

/*
  Một component, hai dáng:
  - dưới 1024px: viên thuốc nổi ở đáy màn hình
  - từ 1024px: thanh dọc bên trái, có logo và đổi bảng màu
  Ô chọn là một sticker dùng chung layoutId nên trượt có lò xo giữa các tab.
*/
export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng"
      className="fixed inset-x-0 bottom-[calc(14px+env(safe-area-inset-bottom,0px))] z-40 mx-auto w-[min(408px,calc(100%-32px))]
                 lg:sticky lg:top-0 lg:bottom-auto lg:flex lg:h-dvh lg:w-auto lg:flex-col lg:gap-8 lg:border-r-2 lg:border-line lg:px-5 lg:py-8"
    >
      <div className="logo hidden px-3 lg:block">
        Fito<small>sổ tay xem phim của hai đứa</small>
      </div>

      <ul
        className="grid grid-cols-4 rounded-full border-2 border-line bg-surface/90 p-1.5 shadow-[0_18px_40px_-16px_#000] backdrop-blur-md
                   lg:flex lg:flex-col lg:gap-1.5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
      >
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="relative">
              {active && (
                <motion.span
                  layoutId="nav-ind"
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-white bg-accent shadow-[2px_2px_0_#000]"
                  initial={false}
                  style={{ rotate: -2 }}
                  transition={{ type: "spring", stiffness: 520, damping: 32 }}
                />
              )}
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[52px] flex-col items-center justify-center gap-px rounded-full text-[12px] font-extrabold transition-colors duration-300
                            lg:min-h-14 lg:flex-row lg:justify-start lg:gap-3 lg:px-5 lg:font-display lg:text-[17px]
                            ${active ? "text-on-accent" : "text-muted hover:text-fg"}`}
              >
                <Icon className="size-5 lg:size-[22px]" strokeWidth={2.2} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto hidden flex-col items-start gap-4 px-3 lg:flex">
        <Online className="flex" />
        <PaletteToggle />
        <SignOutButton />
      </div>
    </nav>
  );
}
