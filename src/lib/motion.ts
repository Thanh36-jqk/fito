export type MotionPref = "auto" | "on" | "off";

export const MOTION_KEY = "fito-motion";
export const MOTION_EVENT = "fito-motion";

// off → luôn giảm; on → luôn bật (đè OS); auto → nghe theo OS
export function effectiveReduced(pref: MotionPref, osReduce: boolean): boolean {
  return pref === "off" ? true : pref === "on" ? false : osReduce;
}

// Chạy trong <head> trước khi trang vẽ để không nháy. Đặt data-motion = "off" | "on".
export const MOTION_SCRIPT = `try{var p=localStorage.getItem("${MOTION_KEY}");var r=(p==="off")||(p!=="on"&&matchMedia("(prefers-reduced-motion: reduce)").matches);document.documentElement.dataset.motion=r?"off":"on"}catch(e){}`;
