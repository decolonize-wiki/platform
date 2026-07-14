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

// Selective bloom: strikes live on their own layer so a dedicated pass can
// glow only the red ink while the type stays crisp (a luminance threshold
// can't — the red is darker than the soft text).
const BLOOM_LAYER = 1;

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
      const LINE_COUNT = small ? 8 : 18;
      const LANES = small ? [-2.4, 0, 2.4] : [-7, -3.5, 0, 3.5, 7];

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
      scene.fog = new THREE.Fog(0x0d0d0d, 18, 82);

      const camera = new THREE.PerspectiveCamera(
        55,
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
      let darkMat: import("three").MeshBasicMaterial | null = null;
      // Non-strike meshes darkened to black during the bloom pass so only the
      // red strikes contribute to the glow.
      const darkenables: InstanceType<typeof Text>[] = [];

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
          if (disposed) return;

          darkMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

          const renderScene = new RenderPass(scene, camera);
          const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(mount.clientWidth, mount.clientHeight),
            0.9, // strength
            0.5, // radius
            0.0, // threshold 0 — the layer is already isolated by darkening
          );
          bloomComposer = new EffectComposer(renderer);
          bloomComposer.renderToScreen = false;
          bloomComposer.addPass(renderScene);
          bloomComposer.addPass(bloomPass);

          const mixPass = new ShaderPass(
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
          finalComposer.addPass(new OutputPass());

          bloomComposer.setSize(mount.clientWidth, mount.clientHeight);
          finalComposer.setSize(mount.clientWidth, mount.clientHeight);
        } catch {
          bloomComposer = null;
          finalComposer = null;
          darkMat = null;
        }
      }

      const FAR = -72;
      const NEAR_RECYCLE = 16;
      const STRIKE_Z = 1.5;
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
      const maybeReady = () => {
        if (ready || !fontSynced || !framesRendered) return;
        ready = true;
        onReady?.();
      };

      const setText = (line: Line, onSynced?: () => void) => {
        const flag = LAB_FLAGS[flagCursor % LAB_FLAGS.length];
        flagCursor++;
        line.quote.text = flag.quote;
        line.quote.sync(() => {
          const b = line.quote.textRenderInfo;
          if (b) {
            line.width = b.blockBounds[2] - b.blockBounds[0];
            (line.strike.position as import("three").Vector3).x = -line.width / 2;
          }
          onSynced?.();
        });
      };

      const strikeGeo = new THREE.PlaneGeometry(1, 0.07);
      strikeGeo.translate(0.5, 0, 0); // grows left→right from x=0

      for (let i = 0; i < LINE_COUNT; i++) {
        const group = new THREE.Group();
        const lane = LANES[i % LANES.length];
        group.position.set(
          lane + (Math.random() - 0.5) * 1.4,
          1 + Math.random() * 6, // upper-biased so the flow clears the headline
          FAR + (i / LINE_COUNT) * SPAN,
        );

        const quote = new Text();
        quote.font = "/fonts/anton.ttf";
        quote.fontSize = 0.5;
        quote.color = SOFT;
        quote.anchorX = "center";
        quote.anchorY = "middle";
        quote.maxWidth = 12;
        quote.textAlign = "center";
        group.add(quote);
        darkenables.push(quote);

        const strike = new THREE.Mesh(
          strikeGeo,
          new THREE.MeshBasicMaterial({ color: HOT, transparent: true }),
        );
        strike.position.z = 0.06;
        strike.scale.x = 0.0001;
        strike.layers.enable(BLOOM_LAYER);
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
          line.progress = Math.min(1, line.progress + dz * 0.9);
          line.strike.scale.x = Math.max(0.0001, line.progress * line.width);
        }
        // Near-fade: dissolve lines as they pass the camera instead of clipping.
        const near = z > 8 ? Math.max(0, 1 - (z - 8) / (NEAR_RECYCLE - 8)) : 1;
        line.quote.fillOpacity = (1 - 0.45 * line.progress) * near;
        strikeMat(line).opacity = near;

        if (z > NEAR_RECYCLE) {
          line.group.position.z -= SPAN;
          line.group.position.y = 1 + Math.random() * 6;
          line.struck = false;
          line.progress = 0;
          line.strike.scale.x = 0.0001;
          setText(line);
        }
      };

      // Layer-isolated selective bloom render: darken every non-strike mesh to
      // black, render the strike-only bloom offscreen, restore materials, then
      // render the full scene and add the bloom texture over it.
      const render = () => {
        if (bloomComposer && finalComposer && darkMat) {
          const saved = darkenables.map((q) => q.material);
          for (const q of darkenables) q.material = darkMat;
          bloomComposer.render();
          darkenables.forEach((q, i) => {
            q.material = saved[i];
          });
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
          line.group.position.z = FAR + 10 + (i / LINE_COUNT) * 26;
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
        removeEventListener("pointermove", onMove);
        removeEventListener("resize", onResize);
        lines.forEach((l) => {
          l.quote.dispose();
          (l.strike.material as import("three").Material).dispose();
        });
        strikeGeo.dispose();
        darkMat?.dispose();
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
