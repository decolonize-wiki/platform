const norm = (s: string) => s.replace(/\s+/g, " ").trim();

export function verifyQuotes(
  extract: string,
  flags: ReadonlyArray<{ id: string; quote: string }>,
): Array<{ id: string; found: boolean }> {
  const haystack = norm(extract);
  return flags.map((f) => ({
    id: f.id,
    found: haystack.includes(norm(f.quote)),
  }));
}
