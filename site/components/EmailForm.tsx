"use client";

import { useState } from "react";

export function EmailForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error ?? "Could not subscribe — try again.");
      }
    } catch {
      setError("Could not subscribe — try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="mono signup-status">
        You&apos;re on the list.
      </p>
    );
  }

  return (
    <form className="signup-form" onSubmit={onSubmit}>
      <input
        type="email"
        required
        aria-label="Email address"
        placeholder="you@example.org"
        className="signup-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="cta" disabled={pending}>
        {pending ? "Subscribing…" : "Get the digest"}
      </button>
      {error && (
        <p role="alert" className="mono signup-error">
          {error}
        </p>
      )}
    </form>
  );
}
