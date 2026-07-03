// Server component: emits a JSON-LD <script>. Serialize with JSON.stringify and
// escape `<` so the payload can never break out of the script element.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
