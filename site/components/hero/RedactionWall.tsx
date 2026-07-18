"use client";
import { useEffect, useRef, useState } from "react";
import type { HeroFlag } from "../../lib/hero-flags";

// Production "Redaction Wall" — the atmospheric hero canvas.
// A receding corridor of real colonial Wikipedia quotes flowing toward the
// camera out of the dark; each is struck in glowing red as it crosses the
// reading plane. Cursor parallaxes the depth. This component renders ONLY the
// decorative wall (aria-hidden); the readable headline + correction are DOM
// elsewhere. Everything here is the accessible page's atmospheric backdrop.

const HOT = 0xff3b1f;
const SOFT = 0xcfcbc2;

// Callers MUST pass a stable `flags` array and a stable (memoized) `onReady`.
// The effect below depends on both; a freshly-built array or an inline callback
// would tear down and rebuild the entire WebGL scene on every parent render.
export function RedactionWall({
  flags,
  onReady,
}: {
  flags: HeroFlag[];
  onReady?: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (!flags.length) return;
    const LAB_FLAGS = flags;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      let THREE: typeof import("three");
      let Text: typeof import("troika-three-text").Text;
      try {
        THREE = await import("three");
        ({ Text } = await import("troika-three-text"));
      } catch {
        if (!disposed) setFailed(true);
        return;
      }
      if (disposed) return;

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = matchMedia("(max-width: 760px)").matches;
      const LINE_COUNT = small ? 10 : 18;
      // Each line owns one row of a fixed ladder for its whole life — the wall
      // reads as a page of discrete lines receding, never a pile of collisions.
      // The *7 interleave keeps z-neighbors from being y-neighbors (7 is
      // coprime with both line counts).
      // Lower ceiling on mobile — the narrow frustum loses high rows off the
      // top before their strike moment.
      const ROW_SPREAD = small ? 4.2 : 6.2;
      const ROWS = Array.from(
        { length: LINE_COUNT },
        (_, i) => 1.0 + (i / (LINE_COUNT - 1)) * ROW_SPREAD,
      );
      const rowFor = (i: number) => ROWS[(i * 7) % LINE_COUNT];
      // The wall is decorative: single-line fragments, not wrapped paragraphs.
      // A quote that wraps into a block breaks the redaction metaphor — the
      // strike must cross ONE line. Cut at a word boundary, mark the cut.
      const FRAG_MAX = small ? 30 : 48;
      const frag = (q: string) => {
        if (q.length <= FRAG_MAX) return q;
        const cut = q.slice(0, FRAG_MAX);
        const sp = cut.lastIndexOf(" ");
        return cut.slice(0, sp > FRAG_MAX / 2 ? sp : FRAG_MAX).replace(/[,;:.]+$/, "") + " …";
      };

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true });
      } catch {
        if (!disposed) setFailed(true);
        return;
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      // Tight fog: lines emerge from black well before they converge at the
      // vanishing point, so the far field never reads as an overlapping pile.
      scene.fog = new THREE.Fog(0x0d0d0d, 14, 48);

      const camera = new THREE.PerspectiveCamera(
        small ? 62 : 55, // wider on mobile — the narrow aspect starves the field

        mount.clientWidth / mount.clientHeight,
        0.1,
        200,
      );
      camera.position.set(0, 0, 14);

      // Layer-isolated selective bloom. Skipped on small screens for perf; the
      // scene then renders directly and stays plain (still correct, just no
      // glow). See the two-composer recipe below.
      type Composer =
        import("three/examples/jsm/postprocessing/EffectComposer.js").EffectComposer;
      let bloomComposer: Composer | null = null;
      let finalComposer: Composer | null = null;
      // EffectComposer.dispose() does NOT dispose its passes, so these are
      // hoisted for explicit disposal in cleanup (they own render targets /
      // materials that leak on every mount/unmount otherwise).
      let bloomPass:
        | import("three/examples/jsm/postprocessing/UnrealBloomPass.js").UnrealBloomPass
        | null = null;
      let mixPass:
        | import("three/examples/jsm/postprocessing/ShaderPass.js").ShaderPass
        | null = null;
      let outputPass:
        | import("three/examples/jsm/postprocessing/OutputPass.js").OutputPass
        | null = null;
      // Quote text meshes hidden during the bloom pass so only the red strikes
      // contribute to the glow (troika Text ignores a swapped .material, so
      // .visible is what actually isolates it — see render()).
      const hiddenDuringBloom: InstanceType<typeof Text>[] = [];

      if (!small) {
        try {
          const { EffectComposer } = await import(
            "three/addons/postprocessing/EffectComposer.js"
          );
          const { RenderPass } = await import(
            "three/addons/postprocessing/RenderPass.js"
          );
          const { UnrealBloomPass } = await import(
            "three/addons/postprocessing/UnrealBloomPass.js"
          );
          const { OutputPass } = await import(
            "three/addons/postprocessing/OutputPass.js"
          );
          const { ShaderPass } = await import(
            "three/addons/postprocessing/ShaderPass.js"
          );
          if (disposed) {
            // The renderer + canvas exist by this point but `cleanup` is
            // still the initial no-op — dispose them here or they leak.
            renderer.dispose();
            renderer.domElement.remove();
            return;
          }


          const renderScene = new RenderPass(scene, camera);
          bloomPass = new UnrealBloomPass(
            new THREE.Vector2(mount.clientWidth, mount.clientHeight),
            0.35, // strength
            0.25, // radius
            0.0, // threshold 0 — isolation is by hiding non-strike meshes, not luminance
          );
          bloomComposer = new EffectComposer(renderer);
          bloomComposer.renderToScreen = false;
          bloomComposer.addPass(renderScene);
          bloomComposer.addPass(bloomPass);

          mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
              uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: bloomComposer.renderTarget2.texture },
              },
              vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
              fragmentShader: `uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv;
    void main(){ gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv); }`,
              defines: {},
            }),
            "baseTexture",
          );
          mixPass.needsSwap = true;

          finalComposer = new EffectComposer(renderer);
          finalComposer.addPass(renderScene);
          finalComposer.addPass(mixPass);
          outputPass = new OutputPass();
          finalComposer.addPass(outputPass);

          bloomComposer.setSize(mount.clientWidth, mount.clientHeight);
          finalComposer.setSize(mount.clientWidth, mount.clientHeight);
        } catch {
          // A pass/composer constructed before the throw already allocated
          // GPU render targets/materials — dispose whatever exists before
          // nulling, or it leaks silently.
          bloomPass?.dispose();
          mixPass?.dispose();
          outputPass?.dispose();
          bloomComposer?.dispose();
          finalComposer?.dispose();
          bloomComposer = null;
          finalComposer = null;
          bloomPass = null;
          mixPass = null;
          outputPass = null;
        }
      }

      // Mobile has fewer lines — shorten the corridor so the visible field
      // stays as dense (and the strike cadence as frequent) as desktop.
      const FAR = small ? -48 : -72;
      // Narrow frustum: lines outgrow a phone's width much sooner, so both the
      // fade and the recycle come earlier there.
      const NEAR_RECYCLE = small ? 9 : 12;
      const STRIKE_Z = 1.5;
      const FADE_START = small ? 2 : 4; // dissolve well before text spans the viewport
      const OVERSHOOT = 0.5; // strike bleeds past the text like a marker stroke
      const SPAN = NEAR_RECYCLE - FAR;

      type Line = {
        group: import("three").Group;
        quote: InstanceType<typeof Text>;
        strike: import("three").Mesh;
        width: number;
        struck: boolean;
        progress: number;
      };

      const lines: Line[] = [];
      let flagCursor = 0;

      // Readiness: fire onReady exactly once, only after the font has synced
      // (real glyphs generated) AND a frame has rendered — so the splash lifts
      // its loader only when actual type is on screen.
      let ready = false;
      let fontSynced = false;
      let framesRendered = false;
      const maybeReady = (force = false) => {
        if (ready) return;
        if (!force && (!fontSynced || !framesRendered)) return;
        ready = true;
        onReady?.();
      };
      // troika's font loader does NOT invoke its sync callback on a font load
      // error (it only console.errors), and we set no fallback font — so if
      // /fonts/anton.ttf 404s, fontSynced stays false and onReady would never
      // fire, hanging the splash loader. Force the ready path after 4s. The
      // single-fire guard in maybeReady keeps this to exactly one onReady call.
      const readyTimeout = setTimeout(() => maybeReady(true), 4000);

      const setText = (line: Line, onSynced?: () => void) => {
        const flag = LAB_FLAGS[flagCursor % LAB_FLAGS.length];
        flagCursor++;
        line.quote.text = frag(flag.quote);
        line.quote.sync(() => {
          const b = line.quote.textRenderInfo;
          if (b) {
            line.width = b.blockBounds[2] - b.blockBounds[0] + OVERSHOOT;
            (line.strike.position as import("three").Vector3).x = -line.width / 2;
          }
          onSynced?.();
        });
      };

      const strikeGeo = new THREE.PlaneGeometry(1, 0.13);
      strikeGeo.translate(0.5, 0, 0); // grows left→right from x=0

      // x biased slightly right of the headline's column for balance;
      // tighter jitter on narrow viewports so lines don't clip the edges.
      const X_BIAS = small ? 0 : 0.8;
      const X_JIT = small ? 1.5 : 4;

      for (let i = 0; i < LINE_COUNT; i++) {
        const group = new THREE.Group();
        group.position.set(
          X_BIAS + (Math.random() - 0.5) * X_JIT,
          rowFor(i),
          FAR + (i / LINE_COUNT) * SPAN,
        );

        const quote = new Text();
        quote.font = "/fonts/anton.ttf";
        quote.fontSize = small ? 0.36 : 0.5;
        quote.color = SOFT;
        quote.anchorX = "center";
        quote.anchorY = "middle";
        quote.whiteSpace = "nowrap";
        group.add(quote);
        hiddenDuringBloom.push(quote);

        const strike = new THREE.Mesh(
          strikeGeo,
          new THREE.MeshBasicMaterial({ color: HOT, transparent: true }),
        );
        strike.position.z = 0.06;
        strike.scale.x = 0.0001;
        group.add(strike);

        const line: Line = {
          group,
          quote,
          strike,
          width: 4,
          struck: false,
          progress: 0,
        };
        setText(
          line,
          i === 0
            ? () => {
                fontSynced = true;
                maybeReady();
              }
            : undefined,
        );
        scene.add(group);
        lines.push(line);
      }

      // Cursor parallax
      const target = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        target.x = (e.clientX / innerWidth - 0.5) * 2;
        target.y = (e.clientY / innerHeight - 0.5) * 2;
      };
      addEventListener("pointermove", onMove, { passive: true });

      const onResize = () => {
        if (!mount) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        bloomComposer?.setSize(mount.clientWidth, mount.clientHeight);
        finalComposer?.setSize(mount.clientWidth, mount.clientHeight);
      };
      addEventListener("resize", onResize);

      const clock = new THREE.Clock();
      const SPEED = 6.0;

      const strikeMat = (l: Line) => l.strike.material as import("three").MeshBasicMaterial;

      const stepLine = (line: Line, dz: number) => {
        const z = (line.group.position.z += dz);
        if (z > STRIKE_Z && !line.struck) line.struck = true;
        if (line.struck && line.progress < 1) {
          line.progress = Math.min(1, line.progress + dz * 0.35);
          line.strike.scale.x = Math.max(0.0001, line.progress * line.width);
        }
        // Near-fade: dissolve lines as they pass the camera instead of clipping.
        const near =
          z > FADE_START
            ? Math.max(0, 1 - (z - FADE_START) / (NEAR_RECYCLE - FADE_START))
            : 1;
        line.quote.fillOpacity = (1 - 0.45 * line.progress) * near;
        strikeMat(line).opacity = near;

        if (z > NEAR_RECYCLE) {
          line.group.position.z -= SPAN;
          line.group.position.x = X_BIAS + (Math.random() - 0.5) * X_JIT; // keep its row; re-jitter x only
          line.struck = false;
          line.progress = 0;
          line.strike.scale.x = 0.0001;
          setText(line);
        }
      };

      // Selective bloom render: hide every non-strike mesh, render the
      // strike-only bloom offscreen, restore visibility, then render the full
      // scene and add the bloom texture over it. (troika Text ignores a swapped
      // .material — it manages its own SDF material — so we toggle .visible,
      // which does work, to keep the wall text crisp and bloom only the strikes.)
      const render = () => {
        if (bloomComposer && finalComposer) {
          for (const q of hiddenDuringBloom) q.visible = false;
          bloomComposer.render();
          for (const q of hiddenDuringBloom) q.visible = true;
          finalComposer.render();
        } else {
          renderer.render(scene, camera);
        }
        framesRendered = true;
        maybeReady();
      };

      if (reduced) {
        // Static composed frame: strike everything in place, no motion.
        lines.forEach((line, i) => {
          line.group.position.z = -34 + (i / LINE_COUNT) * 38;
          line.struck = true;
          line.progress = 1;
          line.strike.scale.x = line.width;
          line.quote.fillOpacity = 0.55;
        });
        requestAnimationFrame(render);
      } else {
        // Authored opening: force the line nearest the reading plane to start
        // striking immediately, so the first strike fires on load, not after
        // the flow has drifted forward.
        let nearest = lines[0];
        let best = Infinity;
        for (const l of lines) {
          const d = Math.abs(l.group.position.z - STRIKE_Z);
          if (d < best) {
            best = d;
            nearest = l;
          }
        }
        nearest.struck = true;
        nearest.progress = 0;

        let raf = 0;
        const loop = () => {
          if (disposed) return;
          if (document.hidden) {
            raf = requestAnimationFrame(loop);
            return;
          }
          const dt = Math.min(clock.getDelta(), 0.05);
          const dz = SPEED * dt;
          for (const line of lines) stepLine(line, dz);
          camera.position.x += (target.x * 3 - camera.position.x) * 0.04;
          camera.position.y += (-target.y * 2 - camera.position.y) * 0.04;
          camera.lookAt(0, 0, -8);
          render();
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        cleanup = () => cancelAnimationFrame(raf);
      }

      const prevCleanup = cleanup;
      cleanup = () => {
        prevCleanup();
        clearTimeout(readyTimeout);
        removeEventListener("pointermove", onMove);
        removeEventListener("resize", onResize);
        lines.forEach((l) => {
          l.quote.dispose();
          (l.strike.material as import("three").Material).dispose();
        });
        strikeGeo.dispose();
        // EffectComposer.dispose() leaves its passes' render targets/materials
        // undisposed, so dispose the passes explicitly.
        bloomPass?.dispose();
        mixPass?.dispose();
        outputPass?.dispose();
        bloomComposer?.dispose();
        finalComposer?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [flags, onReady]);

  if (failed) return null; // page's static hero remains visible underneath
  return <div ref={mountRef} className="wall-canvas" aria-hidden="true" />;
}
