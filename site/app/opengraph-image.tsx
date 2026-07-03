import { ImageResponse } from "next/og";

export const alt =
  'decolonize.wiki — "DISCOVERED"? The receipts on colonial framing.';
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

const BLACK = "#0d0d0d";
const PAPER = "#f4f2ec";
const HOT = "#ff3b1f";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: BLACK,
          color: PAPER,
          fontFamily: "sans-serif",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 168,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: -6,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          <span>&ldquo;Discovered&rdquo;</span>
          <span style={{ color: HOT, fontSize: 200 }}>?</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 34,
            fontFamily: "monospace",
            color: PAPER,
            letterSpacing: 1,
          }}
        >
          decolonize.wiki — the receipts on colonial framing
        </div>
      </div>
    ),
    { ...size },
  );
}
