"use client";
import { useEffect, useRef, useState } from "react";

// Concept 3 draft — "The Atlas Awakens".
// A slow-spinning dark globe; each real analyzed article is a glowing red point
// at its approximate location. As a point turns to face you it becomes the
// "featured" flag, and its struck quote surfaces in the caption. Drag to spin.

type Article = {
  title: string;
  lat: number;
  long: number;
  quote: string;
  rewrite: string;
};

// Real flags, placed by approximate region — a colonial-Atlantic cluster.
const ARTICLES: Article[] = [
  { title: "Atlantic slave trade", lat: 5, long: -30, quote: "the new discoverers of these lands", rewrite: "the Europeans arriving in these already-inhabited lands" },
  { title: "Brazil", lat: -10, long: -52, quote: "first explored, conquered and settled by the Portuguese", rewrite: "when the Portuguese reached, conquered and settled Brazil" },
  { title: "Christopher Columbus", lat: 19, long: -71, quote: "were largely replaced by Europeans and Africans", rewrite: "were killed by disease, enslavement, and colonial violence" },
  { title: "Haiti", lat: 19, long: -72, quote: "vast numbers of those enslaved imported from Africa", rewrite: "trafficked to the colony by French slave traders" },
  { title: "Jamaica", lat: 18, long: -77, quote: "many Maroons were expelled to Nova Scotia", rewrite: "the British colonial authorities deported many Maroons" },
  { title: "Nigeria", lat: 9, long: 8, quote: "pacifying the heartland of the Sokoto Caliphate", rewrite: "subduing the heartland of the Sokoto Caliphate by force" },
  { title: "Scramble for Africa", lat: 2, long: 18, quote: "he discovered the sea route to India", rewrite: "he became the first European to reach India by sea" },
  { title: "DR Congo", lat: -2, long: 23, quote: "acquired rights to the Congo territory", rewrite: "secured European recognition of his claim to the Congo" },
  { title: "Kingdom of Benin", lat: 6, long: 5, quote: "Juju human sacrifice", rewrite: "religious human sacrifice" },
  { title: "South Africa", lat: -30, long: 24, quote: "raids and incursions by the Xhosa", rewrite: "cross-border movement — the term colonists' own expansion escaped" },
  { title: "Mali Empire", lat: 17, long: -4, quote: "a fabulously rich but half-legendary land", rewrite: "a documented West African empire and center of learning" },
];

export function AtlasGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = useState<Article>(ARTICLES[0]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (disposed) return;

      const small = matchMedia("(max-width: 760px)").matches;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        mount.clientWidth / mount.clientHeight,
        0.1,
        100,
      );
      camera.position.set(0, 0, 15);

      const R = 5;
      const globe = new THREE.Group();
      scene.add(globe);

      // Wireframe world — typographic latitude/longitude, not coastlines.
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.SphereGeometry(R, 36, 24)),
        new THREE.LineBasicMaterial({ color: 0x2a2a2a, transparent: true, opacity: 0.55 }),
      );
      globe.add(wire);
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(R * 0.995, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0x0d0d0d }),
      );
      globe.add(shell);

      const toVec = (lat: number, long: number, r: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (long + 180) * (Math.PI / 180);
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
        );
      };

      const dotGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const points = ARTICLES.map((a) => {
        const m = new THREE.Mesh(
          dotGeo,
          new THREE.MeshBasicMaterial({ color: 0xff3b1f }),
        );
        m.position.copy(toVec(a.lat, a.long, R * 1.01));
        globe.add(m);
        // stem from surface outward for a subtle "pin"
        const stem = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            toVec(a.lat, a.long, R),
            toVec(a.lat, a.long, R * 1.14),
          ]),
          new THREE.LineBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.5 }),
        );
        globe.add(stem);
        return m;
      });

      let composer: import("three/examples/jsm/postprocessing/EffectComposer.js").EffectComposer | null =
        null;
      if (!small) {
        try {
          const { EffectComposer } = await import("three/addons/postprocessing/EffectComposer.js");
          const { RenderPass } = await import("three/addons/postprocessing/RenderPass.js");
          const { UnrealBloomPass } = await import("three/addons/postprocessing/UnrealBloomPass.js");
          const { OutputPass } = await import("three/addons/postprocessing/OutputPass.js");
          if (disposed) return;
          composer = new EffectComposer(renderer);
          composer.addPass(new RenderPass(scene, camera));
          composer.addPass(
            new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.9, 0.5, 0.1),
          );
          composer.addPass(new OutputPass());
          composer.setSize(mount.clientWidth, mount.clientHeight);
        } catch {
          composer = null;
        }
      }

      // Drag to spin.
      let dragging = false;
      let px = 0;
      let velY = 0.0022;
      let velX = 0;
      const down = (e: PointerEvent) => {
        dragging = true;
        px = e.clientX;
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        velY = (e.clientX - px) * 0.00035;
        px = e.clientX;
      };
      const up = () => (dragging = false);
      renderer.domElement.addEventListener("pointerdown", down);
      addEventListener("pointermove", move);
      addEventListener("pointerup", up);

      const onResize = () => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        composer?.setSize(mount.clientWidth, mount.clientHeight);
      };
      addEventListener("resize", onResize);

      const render = () => (composer ? composer.render() : renderer.render(scene, camera));
      const world = new THREE.Vector3();
      let frontIdx = -1;

      const updateFeatured = () => {
        let best = -Infinity;
        let idx = 0;
        points.forEach((p, i) => {
          p.getWorldPosition(world);
          if (world.z > best) {
            best = world.z;
            idx = i;
          }
        });
        // scale the featured point up
        points.forEach((p, i) => p.scale.setScalar(i === idx ? 1.7 : 1));
        if (idx !== frontIdx) {
          frontIdx = idx;
          if (!disposed) setFeatured(ARTICLES[idx]);
        }
      };

      globe.rotation.x = 0.35;
      if (reduced) {
        updateFeatured();
        requestAnimationFrame(render);
      } else {
        let raf = 0;
        const loop = () => {
          if (disposed) return;
          if (!dragging) velY += (0.0022 - velY) * 0.02; // ease back to idle spin
          globe.rotation.y += velY;
          globe.rotation.x += (0.35 - globe.rotation.x) * 0.05 + velX;
          velX *= 0.9;
          updateFeatured();
          render();
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        cleanup = () => cancelAnimationFrame(raf);
      }

      const prev = cleanup;
      cleanup = () => {
        prev();
        renderer.domElement.removeEventListener("pointerdown", down);
        removeEventListener("pointermove", move);
        removeEventListener("pointerup", up);
        removeEventListener("resize", onResize);
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

  return (
    <div className="atlas-stage">
      <div ref={mountRef} className="atlas-canvas" aria-hidden="true" />
      <header className="lab-mast">
        <span className="disp">Decolonize.wiki</span>
        <span className="mono">The atlas · maps articles, not borders</span>
      </header>
      <div className="atlas-overlay">
        <div className="lab-eyebrow mono">Drag to spin · {ARTICLES.length} articles mapped</div>
        <h1 className="disp atlas-h1">The record, mapped.</h1>
        <div className="atlas-feature">
          <span className="mono af-title">{featured.title}</span>
          <span className="af-quote">{featured.quote}</span>
          <span className="af-rewrite">→ {featured.rewrite}</span>
        </div>
      </div>
    </div>
  );
}
