import type { Analysis } from "@schema/analysis";

const SITE = "https://decolonize.wiki";
const CC_BY_SA = "https://creativecommons.org/licenses/by-sa/4.0/";

const publisher = {
  "@type": "Organization",
  name: "decolonize.wiki",
  url: SITE,
};

// Article + BreadcrumbList schema for one analysis, canonicalized to `pageUrl`.
// `imageUrl` is the analysis's own OG verdict card.
export function analysisJsonLd(
  analysis: Analysis,
  pageUrl: string,
  imageUrl: string,
) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${analysis.article.title} — decolonial analysis`,
    image: imageUrl,
    description: analysis.summary.paragraph,
    datePublished: analysis.article.fetchedAt,
    dateModified: analysis.article.fetchedAt,
    author: publisher,
    publisher,
    isBasedOn: analysis.article.url,
    license: CC_BY_SA,
    inLanguage: analysis.language,
    about: { "@type": "Thing", name: analysis.article.title },
    mainEntityOfPage: pageUrl,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "decolonize.wiki", item: `${SITE}/en` },
      {
        "@type": "ListItem",
        position: 2,
        name: `${analysis.article.title} — decolonial analysis`,
        item: pageUrl,
      },
    ],
  };

  return [article, breadcrumb];
}
