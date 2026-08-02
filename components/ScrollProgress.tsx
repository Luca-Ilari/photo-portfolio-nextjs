"use client";

export default function ScrollProgress() {
  return (
    <div className="scroll-bar-wrap" aria-hidden="true">
      <div data-scroll-bar className="scroll-bar-fill" />
    </div>
  );
}
