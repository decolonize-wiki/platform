export type CardMedium = "og" | "post" | "story" | "square";

export function buildAttribution(a: {
  title: string;
  lang: string;
  slug: string;
  seq: string | number;
  medium: CardMedium;
}): string {
  return `${a.title} · text: Wikipedia, CC BY-SA · decolonize.wiki/${a.lang}/${a.slug}/${a.seq}?utm_source=card&utm_medium=${a.medium}`;
}
