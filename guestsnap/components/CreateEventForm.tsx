"use client";

import { useState } from "react";

export default function CreateEventForm({ priceLabel }: { priceLabel: string }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 w-full max-w-md" id="create">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Event name — e.g. “Amara & Jonah’s Wedding”"
        className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-terra"
      />
      <div className="flex gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-terra text-stone-600"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="flex-[1.4] rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-terra"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-terra hover:bg-terra-dark disabled:opacity-60 text-white font-semibold px-6 py-3.5 text-base transition-colors"
      >
        {busy ? "One moment…" : `Create my event — ${priceLabel}, one-time`}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-stone-500">
        One flat price per event. Unlimited guests, unlimited photos, gallery live for 12 months.
      </p>
    </form>
  );
}
