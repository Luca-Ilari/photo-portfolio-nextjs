"use client";

import Link from "next/link";

interface NextSeriesSectionProps {
  href: string;
  title: string;
}

export default function NextSeriesSection({ href, title }: NextSeriesSectionProps) {
  return (
    <section style={{
      borderTop: "1px solid rgba(237,234,229,.14)",
      padding: "clamp(44px,9vh,100px) clamp(14px,3.5vw,44px) clamp(64px,12vh,140px)",
    }}>
      <div style={{
        maxWidth: 1500, margin: "0 auto",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20,
      }}>
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", opacity: .5 }}>
            Next series
          </p>
          <Link href={href} className="next-title">
            {title}
          </Link>
        </div>
        <Link href={href} aria-label={`Go to ${title}`} className="next-arrow">
          →
        </Link>
      </div>
    </section>
  );
}
