"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { tmdbImg, type Trailer as TrailerT } from "@/lib/movie";

/* Trailer YouTube chính thức: chỉ nhúng iframe (youtube-nocookie) khi người dùng bấm. Đổi phim thì cha đặt key mới. */
export function Trailer({
  trailer,
  title,
  backdropPath,
  c1,
  c2,
}: {
  trailer: TrailerT;
  title: string;
  backdropPath: string | null;
  c1: string;
  c2: string;
}) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  return (
    <>
      {playing ? (
        <iframe
          ref={frame}
          className="trailer"
          src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&hl=vi`}
          title={`Trailer ${title}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="trailer"
          style={{ "--c1": c1, "--c2": c2 } as React.CSSProperties}
          aria-label={`Phát trailer ${title}`}
          data-yt={trailer.key}
          onClick={() => setPlaying(true)}
        >
          {backdropPath && (
            <Image className="t-bd" fill alt="" src={tmdbImg(backdropPath, "w780")} sizes="(min-width: 768px) 360px, 100vw" />
          )}
          <span className="play">
            <Play className="size-6" fill="currentColor" aria-hidden />
          </span>
        </button>
      )}
      <p className="src">Trailer chính thức trên YouTube{trailer.lang === "en" ? " · bản tiếng Anh" : ""}</p>
    </>
  );
}
