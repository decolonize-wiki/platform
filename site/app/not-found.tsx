import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="hero">
      <h1 className="disp">404 — not in the record.</h1>
      <p className="mono">
        <Link href="/en">← Back to decolonize.wiki</Link>
      </p>
    </main>
  );
}
