// Vẽ icon Fito (vé + Bắp) bằng ImageResponse của Next. Chạy lại khi đổi hình.
import fs from "node:fs";
import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";

const BG = "#0D0E1A", ACC = "#C6F432", ACC2 = "#8B7CFF", STK = "#FF6BD6", INK = "#2A1D0F", CREAM = "#FFF4D6", RED = "#FF5A5F";

function art() {
  return `
  <g transform="rotate(-10 256 256)">
    <mask id="notch"><rect width="512" height="512" fill="#fff"/><circle cx="66" cy="311" r="26" fill="#000"/><circle cx="446" cy="311" r="26" fill="#000"/></mask>
    <g mask="url(#notch)"><rect x="80" y="248" width="372" height="150" rx="26" fill="#000" opacity=".5"/><rect x="70" y="236" width="372" height="150" rx="26" fill="${ACC}" stroke="#FFFFFF" stroke-width="8"/></g>
    <line x1="352" y1="258" x2="352" y2="364" stroke="${BG}" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 16"/>
    <circle cx="396" cy="311" r="14" fill="${STK}"/>
  </g>
  <g transform="translate(118 64) scale(2.15)">
    <g fill="${CREAM}" stroke="${INK}" stroke-width="3"><circle cx="34" cy="42" r="15"/><circle cx="86" cy="42" r="15"/><circle cx="58" cy="28" r="18"/><circle cx="46" cy="50" r="14"/><circle cx="74" cy="50" r="14"/></g>
    <path d="M22 54 h76 l-10 70 h-56z" fill="${RED}"/>
    <path d="M37 55 h15 l2 68 h-11z M68 55 h15 l-6 68 h-11z" fill="${CREAM}"/>
    <path d="M22 54 h76 l-10 70 h-56z" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="49" cy="84" r="4.5" fill="${INK}"/><circle cx="71" cy="84" r="4.5" fill="${INK}"/>
    <circle cx="42" cy="93" r="4" fill="#FF9DB0"/><circle cx="78" cy="93" r="4" fill="#FF9DB0"/>
    <path d="M52 95 q8 9 16 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>`;
}

function iconSvg({ maskable }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><radialGradient id="g" cx="50%" cy="45%" r="50%"><stop offset="0" stop-color="${ACC2}" stop-opacity=".55"/><stop offset="1" stop-color="${ACC2}" stop-opacity="0"/></radialGradient></defs>
  ${maskable ? `<rect width="512" height="512" fill="${BG}"/>` : `<rect width="512" height="512" rx="112" fill="${BG}"/>`}
  <circle cx="256" cy="240" r="230" fill="url(#g)"/>
  <g transform="${maskable ? "translate(256 256) scale(.78) translate(-256 -256)" : "translate(256 256) scale(.94) translate(-256 -256)"}">${art()}</g>
  </svg>`;
}

async function toPng(svg, size) {
  const r = new ImageResponse(
    h("img", { src: "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64"), width: size, height: size }),
    { width: size, height: size },
  );
  return Buffer.from(await r.arrayBuffer());
}

// Bọc một ảnh PNG 32x32 thành file ICO
function pngToIco(png) {
  const b = Buffer.alloc(22);
  b.writeUInt16LE(0, 0); b.writeUInt16LE(1, 2); b.writeUInt16LE(1, 4);
  b.writeUInt8(32, 6); b.writeUInt8(32, 7); b.writeUInt8(0, 8); b.writeUInt8(0, 9);
  b.writeUInt16LE(1, 10); b.writeUInt16LE(32, 12);
  b.writeUInt32LE(png.length, 14); b.writeUInt32LE(22, 18);
  return Buffer.concat([b, png]);
}

const any = iconSvg({ maskable: false });
const mask = iconSvg({ maskable: true });
fs.mkdirSync("public/icons", { recursive: true });

const files = {
  "public/icons/icon-192.png": await toPng(any, 192),
  "public/icons/icon-512.png": await toPng(any, 512),
  "public/icons/maskable-512.png": await toPng(mask, 512),
  "src/app/apple-icon.png": await toPng(mask, 180),
  "src/app/favicon.ico": pngToIco(await toPng(any, 32)),
  "src/app/icon.svg": any,
};
for (const [f, data] of Object.entries(files)) {
  fs.writeFileSync(f, data);
  console.log("đã ghi", f);
}
