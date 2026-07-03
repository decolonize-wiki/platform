import Link from "next/link";
import { RepoLink } from "../components/RepoLink";

export default function NotFound() {
  return (
    <>
      <main id="main" className="hero">
        <h1 className="disp">404 — not in the record.</h1>
        <p className="mono">
          <Link href="/en">← Back to decolonize.wiki</Link>
        </p>
      </main>
      <footer className="mfoot">
        <span>An open project · AGPL / CC BY-SA</span>
        <span>
          Not affiliated with the Wikimedia Foundation · <RepoLink />
        </span>
      </footer>
    </>
  );
}
