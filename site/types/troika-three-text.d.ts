declare module "troika-three-text" {
  import { Mesh } from "three";
  export class Text extends Mesh {
    text: string;
    fontSize: number;
    color: number | string;
    anchorX: number | "left" | "center" | "right" | string;
    anchorY: number | "top" | "middle" | "bottom" | string;
    maxWidth: number;
    textAlign: "left" | "right" | "center" | "justify";
    whiteSpace: "normal" | "nowrap";
    fillOpacity: number;
    outlineWidth: number | string;
    font: string | null;
    textRenderInfo?: { blockBounds: number[] };
    sync(callback?: () => void): void;
    dispose(): void;
  }
}
