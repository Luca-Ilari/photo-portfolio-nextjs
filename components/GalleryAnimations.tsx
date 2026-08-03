"use client";

import { useEffect } from "react";

export default function GalleryAnimations() {
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>("[data-scroll-bar]");
    const onScroll = () => {
      if (!bar) return;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    revealEls.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0,22px,0)";
      el.style.transition =
        "opacity .85s cubic-bezier(.16,1,.3,1), transform .95s cubic-bezier(.16,1,.3,1)";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.transitionDelay = (el.dataset.delay || "0") + "ms";
          el.style.opacity = "1";
          el.style.transform = "none";
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    revealEls.forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return null;
}
