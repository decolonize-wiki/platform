import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getCategories, getSources } from "../../../lib/methodology";
import { JsonLd } from "../../../components/JsonLd";
import { RepoLink } from "../../../components/RepoLink";

type Params = { lang: string };

const REPO = "https://github.com/decolonize-wiki/methodology";
const SITE = "https://decolonize.wiki";

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return [{ lang: "en" }];
}

export const metadata: Metadata = {
  title: "Methodology",
  description: "The versioned, cited methodology behind every flag.",
  alternates: { canonical: "/en/methodology" },
};

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) nodes.push(<strong key={k++}>{m[1]}</strong>);
    else nodes.push(<em key={k++}>{m[2]}</em>);
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function listItems(block: string, marker: RegExp): string[] {
  const items: string[] = [];
  for (const line of block.split("\n")) {
    if (marker.test(line)) items.push(line.replace(marker, ""));
    else if (items.length) items[items.length - 1] += " " + line.trim();
  }
  return items;
}

// Minimal markdown → JSX for the constructs the category files use:
// ## / ### headings, - and 1. lists, paragraphs, **bold**, *italic*.
// Unknown constructs fall through to plain paragraph text.
function renderMarkdown(md: string): ReactNode[] {
  return md.split(/\n{2,}/).map((block, i) => {
    const first = block.split("\n")[0];
    if (block.startsWith("### ")) return <h3 key={i}>{renderInline(block.slice(4))}</h3>;
    if (block.startsWith("## ")) return <h3 key={i}>{renderInline(block.slice(3))}</h3>;
    if (/^\d+\. /.test(first))
      return (
        <ol key={i}>
          {listItems(block, /^\d+\. /).map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>
      );
    if (/^- /.test(first))
      return (
        <ul key={i}>
          {listItems(block, /^- /).map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    return <p key={i}>{renderInline(block.replace(/\n\s*/g, " ").trim())}</p>;
  });
}

export default async function Page() {
  const [categories, sources] = await Promise.all([getCategories(), getSources()]);

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Methodology — decolonize.wiki",
    url: `${SITE}/en/methodology`,
    description:
      "The versioned, cited decolonial methodology behind every flag.",
    inLanguage: "en",
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    citation: sources.map((s) => s.citation),
    isPartOf: { "@type": "WebSite", name: "decolonize.wiki", url: SITE },
  };

  return (
    <>
      <JsonLd data={webPageLd} />
      <header className="mast">
        <Link href="/en" className="disp" style={{ textDecoration: "none" }}>
          Decolonize.wiki
        </Link>
        <span className="mono">
          Open methodology · <em>v0.1</em> · CC BY-SA
        </span>
      </header>

      <main id="main">
      <section className="hero">
        <div className="eyebrow">
          <span>The methodology</span>
          <span>
            <em>v0.1</em>
          </span>
          <span>CC BY-SA</span>
        </div>
        <h1 className="disp">Who are we to judge?</h1>
        <p>
          Every flag traces to published decolonial thought: Fanon, Said,
          Ngũgĩ, Quijano, Trouillot, Bispo, Krenak — <b>53 sources</b>, all
          cited, all versioned, all open to dispute by pull request.
        </p>
      </section>

      <section className="paper">
        <div className="eyebrow-p">
          <span>The categories</span>
          <span>What we flag · and what we deliberately don&apos;t</span>
        </div>
        <h2>The categories.</h2>
        {categories.map((cat) => (
          <article key={cat.id} className="mcat">
            <h3 className="disp">{cat.name}</h3>
            <div className="mprose">{renderMarkdown(cat.body)}</div>
          </article>
        ))}
      </section>

      <section className="msources">
        <h2 className="disp">The sources.</h2>
        <p className="mono">
          Every flag and every context fact verifies against this list.
          Changes by pull request, per{" "}
          <a href={`${REPO}/blob/main/GOVERNANCE.md`}>GOVERNANCE.md</a>.
        </p>
        <table className="stable">
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td className="mono">{s.id}</td>
                <td>{renderInline(s.citation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mono">
          <a href={REPO}>The methodology repository →</a>
        </p>
      </section>
      </main>

      <footer className="mfoot">
        <span>An open project · AGPL / CC BY-SA</span>
        <span>
          Not affiliated with the Wikimedia Foundation · analyses critique
          articles, not editors · <RepoLink />
        </span>
      </footer>
    </>
  );
}
