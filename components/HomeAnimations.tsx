"use client";

import { useEffect, useRef } from "react";

export default function HomeAnimations() {
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    scrollY: 0,
    velocity: 0,
    marqueeX: 0,
    reduced: false,
    touch: false,
    tracks: [] as Track[],
    revealIO: null as IntersectionObserver | null,
    countIO: null as IntersectionObserver | null,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.scrollY = window.scrollY;
    s.velocity = 0;
    s.marqueeX = 0;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.touch = window.matchMedia("(hover: none)").matches;

    s.revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el =
            (e.target.querySelector("[data-reveal-line],[data-rise]") as HTMLElement) ||
            (e.target as HTMLElement);
          show(el);
          s.revealIO!.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    s.countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          countUp(e.target as HTMLElement);
          s.countIO!.unobserve(e.target);
        });
      },
      { threshold: 0.4 }
    );

    sync();
    rafRef.current = requestAnimationFrame(frame);

    const onResize = () => measure();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      s.revealIO?.disconnect();
      s.countIO?.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function show(el: HTMLElement) {
    el.style.transitionDelay = (el.dataset.delay || "0") + "ms";
    el.style.opacity = "1";
    el.style.transform = "none";
    el.style.clipPath = "inset(0% 0% 0% 0%)";
  }

  function prime(el: HTMLElement, kind: "line" | "block" | "grid") {
    if (el.dataset.primed) return;
    el.dataset.primed = "1";
    const s = stateRef.current;
    if (s.reduced) return;
    if (kind === "line") {
      el.style.transform = "translate3d(0,105%,0)";
      el.style.transition = "transform 1.15s cubic-bezier(.16,1,.3,1)";
    } else if (kind === "grid") {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0,26px,0) scale(1.05)";
      el.style.clipPath = "inset(14% 0% 0% 0%)";
      el.style.transition =
        "opacity 1s cubic-bezier(.16,1,.3,1), transform 1.2s cubic-bezier(.16,1,.3,1), clip-path 1.2s cubic-bezier(.16,1,.3,1)";
    } else {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0,28px,0)";
      el.style.transition =
        "opacity .95s cubic-bezier(.16,1,.3,1), transform 1.15s cubic-bezier(.16,1,.3,1)";
    }
    const target =
      kind === "line" && el.parentElement ? el.parentElement : el;
    s.revealIO!.observe(target);
  }

  function countUp(el: HTMLElement) {
    const target = parseInt(el.dataset.count || "0", 10) || 0;
    const t0 = performance.now();
    const run = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  function clamp(v: number, a: number, b: number) {
    return v < a ? a : v > b ? b : v;
  }
  function ease(t: number) {
    return 1 - Math.pow(1 - t, 3);
  }

  function sync() {
    const s = stateRef.current;
    const root = document.body;

    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) =>
      prime(el, "block")
    );
    root.querySelectorAll<HTMLElement>("[data-reveal-line]").forEach((el) =>
      prime(el, "line")
    );
    root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = "1";
      s.countIO!.observe(el);
    });
    root.querySelectorAll<HTMLElement>("[data-rise]").forEach((el, i) => {
      if (el.dataset.risen) return;
      el.dataset.risen = "1";
      prime(el, "line");
      setTimeout(() => show(el), 140 + i * 110);
    });

    s.tracks = Array.from(
      root.querySelectorAll<HTMLElement>("[data-fx]")
    ).map((el) => ({
      el,
      fx: el.dataset.fx as string,
      img: el.querySelector<HTMLElement>("[data-hero-img]"),
      title: el.querySelector<HTMLElement>("[data-hero-title]"),
      foot: el.querySelector<HTMLElement>("[data-hero-foot]"),
      row: el.querySelector<HTMLElement>("[data-strip-row]"),
      items: Array.from(el.querySelectorAll<HTMLElement>("[data-strip-item]")),
      bar: el.querySelector<HTMLElement>("[data-strip-bar]"),
      counter: el.querySelector<HTMLElement>("[data-strip-progress]"),
      media: el.querySelector<HTMLElement>("[data-cover-media]"),
      cover: el.querySelector<HTMLElement>("[data-cover-img]"),
      content: el.querySelector<HTMLElement>("[data-cover-content]"),
      yearEl: el.querySelector<HTMLElement>("[data-cover-year]"),
      words: Array.from(el.querySelectorAll<HTMLElement>("[data-word]")),
      marquee: el.querySelector<HTMLElement>("[data-marquee-row]"),
      p: 0,
      maxX: 0,
      loop: 0,
      offsets: [] as Offset[],
    }));

    s.tracks.forEach((t) =>
      t.words.forEach((w) => {
        w.style.transform = s.reduced ? "none" : "translate3d(0,110%,0)";
      })
    );

    measure();
  }

  function measure() {
    const s = stateRef.current;
    if (!s.tracks) return;
    const vw = window.innerWidth;
    for (const t of s.tracks) {
      if (t.fx === "strip" && t.row) {
        const pad = parseFloat(getComputedStyle(t.row).paddingRight) || 0;
        t.maxX = Math.max(0, t.row.scrollWidth + pad - vw);
        t.offsets = t.items.map((it) => ({
          el: it,
          left: it.offsetLeft,
          w: it.offsetWidth,
          img: it.querySelector<HTMLElement>("[data-strip-img]"),
        }));
      }
      if (t.fx === "marquee" && t.marquee) {
        t.loop = t.marquee.scrollWidth / 2;
      }
    }
  }

  function frame() {
    rafRef.current = requestAnimationFrame(frame);
    const s = stateRef.current;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const y = window.scrollY;
    const raw = clamp(y - s.scrollY, -160, 160);
    s.scrollY = y;
    s.velocity += (raw - s.velocity) * 0.12;

    const bar = document.querySelector<HTMLElement>("[data-scroll-bar]");
    if (bar) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - vh;
      bar.style.transform = `scaleX(${clamp(max > 0 ? y / max : 0, 0, 1).toFixed(4)})`;
    }

    if (!s.tracks || s.reduced) return;

    const skew = s.touch ? 0 : clamp(s.velocity * 0.02, -2.2, 2.2);

    let stale = false;
    for (const t of s.tracks) {
      if (!t.el.isConnected) { stale = true; continue; }
      const rect = t.el.getBoundingClientRect();
      if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) continue;

      if (t.fx === "hero") {
        const p = clamp(-rect.top / vh, 0, 1);
        t.p += (p - t.p) * 0.16;
        const v = t.p;
        if (t.img)
          t.img.style.transform = `translate3d(0,${(v * 16).toFixed(2)}%,0) scale(${(1 + v * 0.16).toFixed(4)})`;
        if (t.title) {
          t.title.style.transform = `translate3d(0,${(v * -110).toFixed(1)}px,0)`;
          t.title.style.opacity = String(clamp(1 - v * 1.35, 0, 1));
        }
        if (t.foot) {
          t.foot.style.transform = `translate3d(0,${(v * -46).toFixed(1)}px,0)`;
          t.foot.style.opacity = String(clamp(1 - v * 2, 0, 1));
        }

      } else if (t.fx === "strip") {
        const span = rect.height - vh;
        const p = clamp(-rect.top / (span || 1), 0, 1);
        t.p += (p - t.p) * 0.11;
        const v = t.p;
        const x = -v * (t.maxX || 0);
        if (t.row) t.row.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        if (t.bar) t.bar.style.transform = `scaleX(${v.toFixed(4)})`;
        if (t.offsets) {
          let visible = 1;
          t.offsets.forEach((o, i) => {
            const sx = o.left + x;
            const rel = clamp((sx + o.w / 2 - vw / 2) / vw, -1.4, 1.4);
            if (o.img)
              o.img.style.transform = `translate3d(${(rel * -7).toFixed(2)}%,0,0) scale(1.16) skewX(${(skew * 0.7).toFixed(2)}deg)`;
            if (sx < vw * 0.5) visible = i + 1;
          });
          if (t.counter)
            t.counter.textContent =
              String(visible).padStart(2, "0") +
              " / " +
              String(t.offsets.length).padStart(2, "0");
        }

      } else if (t.fx === "cover") {
        const span = rect.height - vh;
        const p = clamp(-rect.top / (span || 1), 0, 1);
        t.p += (p - t.p) * 0.13;
        const v = t.p;
        const reveal = ease(clamp(v / 0.34, 0, 1));
        const exit = clamp((v - 0.84) / 0.16, 0, 1);
        if (t.media) {
          const inset = (1 - reveal) * 12;
          t.media.style.clipPath = `inset(${inset.toFixed(2)}% ${(inset * 1.35).toFixed(2)}% ${inset.toFixed(2)}% ${(inset * 1.35).toFixed(2)}%)`;
          t.media.style.opacity = String(1 - exit * 0.6);
        }
        if (t.cover)
          t.cover.style.transform = `translate3d(0,${((v - 0.5) * -9).toFixed(2)}%,0) scale(${(1.14 - reveal * 0.14).toFixed(4)}) skewY(${(skew * 0.35).toFixed(2)}deg)`;
        if (t.yearEl)
          t.yearEl.style.transform = `translate(-50%,-50%) translate3d(0,${((0.5 - v) * 260).toFixed(1)}px,0)`;
        if (t.content) {
          t.content.style.opacity = String(1 - exit);
          t.content.style.transform = `translate3d(0,${(exit * -40).toFixed(1)}px,0)`;
        }
        t.words.forEach((w, i) => {
          const e = ease(clamp((v - 0.14 - i * 0.06) / 0.22, 0, 1));
          w.style.transform = `translate3d(0,${((1 - e) * 110).toFixed(2)}%,0)`;
        });

      } else if (t.fx === "marquee" && t.marquee) {
        s.marqueeX -= 0.5 + s.velocity * 0.22;
        if (t.loop) {
          if (s.marqueeX <= -t.loop) s.marqueeX += t.loop;
          if (s.marqueeX > 0) s.marqueeX -= t.loop;
        }
        t.marquee.style.transform = `translate3d(${s.marqueeX.toFixed(1)}px,0,0)`;
      }
    }

    if (stale) sync();
  }

  return null;
}

type Offset = {
  el: HTMLElement;
  left: number;
  w: number;
  img: HTMLElement | null;
};

type Track = {
  el: HTMLElement;
  fx: string;
  img: HTMLElement | null;
  title: HTMLElement | null;
  foot: HTMLElement | null;
  row: HTMLElement | null;
  items: HTMLElement[];
  bar: HTMLElement | null;
  counter: HTMLElement | null;
  media: HTMLElement | null;
  cover: HTMLElement | null;
  content: HTMLElement | null;
  yearEl: HTMLElement | null;
  words: HTMLElement[];
  marquee: HTMLElement | null;
  p: number;
  maxX: number;
  loop: number;
  offsets: Offset[];
};
