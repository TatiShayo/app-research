"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-terra hover:bg-terra-dark text-white px-5 py-2.5 text-sm font-semibold transition-colors"
    >
      Print this sign
    </button>
  );
}
