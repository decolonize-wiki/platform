"use client";
import { useEffect, useRef, useState } from "react";
import { LAB_FLAGS } from "../../lib/lab-flags";

// Concept 1 draft — "The Redaction Wall".
// A receding corridor of real colonial Wikipedia quotes flowing toward the
// camera out of the dark; each is struck in glowing red as it crosses the
// reading plane, and its correction surfaces beneath. Cursor parallaxes the
// depth. Everything WebGL is decorative (aria-hidden); the page's server-
// rendered text is the accessible/crawlable layer.

const HOT = 0xff3b1f;
const SOFT = 0xcfcbc2;
const PAPER = 0xf4f2ec;

export function RedactionWall() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
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

      // Optional bloom so the red reads as hot ink, not flat paint. Skipped on
      // small screens for perf.
      let composer: import("three/examples/jsm/postprocessing/EffectComposer.js").EffectComposer | null =
        null;
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
          if (disposed) return;
          composer = new EffectComposer(renderer);
          composer.addPass(new RenderPass(scene, camera));
          const bloom = new UnrealBloomPass(
            new THREE.Vector2(mount.clientWidth, mount.clientHeight),
            0.5,
            0.35,
            0.15,
          );
          composer.addPass(bloom);
          composer.addPass(new OutputPass());
          composer.setSize(mount.clientWidth, mount.clientHeight);
        } catch {
          composer = null; // fall back to direct render
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
        correction: InstanceType<typeof Text>;
        width: number;
        struck: boolean;
        progress: number;
        corr: number;
      };

      const lines: Line[] = [];
      let flagCursor = 0;

      const setText = (line: Line) => {
        const flag = LAB_FLAGS[flagCursor % LAB_FLAGS.length];
        flagCursor++;
        line.quote.text = flag.quote;
        line.correction.text = "→ " + flag.rewrite;
        line.quote.sync(() => {
          const b = (line.quote as unknown as { textRenderInfo?: { blockBounds: number[] } })
            .textRenderInfo;
          if (b) {
            line.width = b.blockBounds[2] - b.blockBounds[0];
            (line.strike.position as import("three").Vector3).x = -line.width / 2;
          }
        });
        line.correction.sync();
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
        quote.fontSize = 0.5;
        quote.color = SOFT;
        quote.anchorX = "center";
        quote.anchorY = "middle";
        quote.maxWidth = 12;
        quote.textAlign = "center";
        group.add(quote);

        const strike = new THREE.Mesh(
          strikeGeo,
          new THREE.MeshBasicMaterial({ color: HOT, transparent: true }),
        );
        strike.position.z = 0.06;
        strike.scale.x = 0.0001;
        group.add(strike);

        const correction = new Text();
        correction.fontSize = 0.34;
        correction.color = PAPER;
        correction.anchorX = "center";
        correction.anchorY = "middle";
        correction.maxWidth = 12;
        correction.textAlign = "center";
        correction.position.y = -0.62;
        correction.fillOpacity = 0;
        group.add(correction);

        const line: Line = {
          group,
          quote,
          strike,
          correction,
          width: 4,
          struck: false,
          progress: 0,
          corr: 0,
        };
        setText(line);
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
        composer?.setSize(mount.clientWidth, mount.clientHeight);
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
          if (line.progress > 0.4) line.corr = Math.min(1, line.corr + dz * 0.6);
        }
        // Near-fade: dissolve lines as they pass the camera instead of clipping.
        const near = z > 8 ? Math.max(0, 1 - (z - 8) / (NEAR_RECYCLE - 8)) : 1;
        line.quote.fillOpacity = (1 - 0.45 * line.progress) * near;
        line.correction.fillOpacity = line.corr * near;
        strikeMat(line).opacity = near;

        if (z > NEAR_RECYCLE) {
          line.group.position.z -= SPAN;
          line.group.position.y = 1 + Math.random() * 6;
          line.struck = false;
          line.progress = 0;
          line.corr = 0;
          line.strike.scale.x = 0.0001;
          setText(line);
        }
      };

      const render = () => (composer ? composer.render() : renderer.render(scene, camera));

      if (reduced) {
        // Static composed frame: strike everything in place, no motion.
        lines.forEach((line, i) => {
          line.group.position.z = FAR + 10 + (i / LINE_COUNT) * 26;
          line.struck = true;
          line.progress = 1;
          line.corr = 1;
          line.strike.scale.x = line.width;
          line.quote.fillOpacity = 0.55;
          line.correction.fillOpacity = 1;
        });
        requestAnimationFrame(render);
      } else {
        let raf = 0;
        const loop = () => {
          if (disposed) return;
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
          l.correction.dispose();
          (l.strike.material as import("three").Material).dispose();
        });
        strikeGeo.dispose();
        composer?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  if (failed) return null; // page's static hero remains visible underneath
  return <div ref={mountRef} className="wall-canvas" aria-hidden="true" />;
}
