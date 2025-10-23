import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default function CarViewer({
  className = "h-[520px] md:h-[560px] w-full rounded-3xl bg-transparent",
  spin = false,
  spinSpeed = 0.6,

  // default apa adanya; ganti dari App.jsx
  modelUrl = "three/models/mclaren.glb",
  textureUrl = null,            // <— tambahin prop ini
  modelScale = 1.0,
  modelOffset = [0, 0, 0],
  bodyColor = null,
  modelTiltDeg = 0,
  accentColor = null,

  cameraFov = 34,
  fitPadding = 1.18,
  initialAzimuthDeg = 135,
  initialElevDeg = 20,
  targetYOffsetRatio = -0.10,
  showGrid = true,
}) {
  const mountRef = useRef(null);
  const reqRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- helper: resolve URL dengan BASE_URL (Vite) ---
    const BASE = (import.meta?.env?.BASE_URL || "/").replace(/\/+$/, "/");
    const resolveUrl = (p) => {
      if (!p) return p;
      if (/^https?:\/\//i.test(p)) return p;
      return (BASE + p.replace(/^\/+/, ""));
    };

    const finalModelUrl   = resolveUrl(modelUrl);
    const finalTextureUrl = textureUrl ? resolveUrl(textureUrl) : null;
    const dracoPath       = resolveUrl("draco/");
    const hdrUrl          = resolveUrl("three/textures/equirectangular/venice_sunset_1k.hdr");

    console.log("[Model] base:", BASE, "| model:", finalModelUrl, "| tex:", finalTextureUrl);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0); 
    const size = () => ({ w: Math.max(1, container.clientWidth || 1), h: Math.max(1, container.clientHeight || 1) });
    const { w, h } = size();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", background: "transparent", display: "block" });

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(cameraFov, w / h, 0.1, 2000);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableRotate = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90);

    camera.position.set(15, 10, -15);
    controls.target.set(0, 2, 0);
    controls.update();

    // --- Lights ---
    const amb  = new THREE.AmbientLight(0xffffff, 0.35);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x0e1116, 1.0);

    const key  = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(6, 10, 6);

    const fill = new THREE.DirectionalLight(0xffffff, 1.2);
    fill.position.set(-6, 4, -2);

    const rim  = new THREE.DirectionalLight(0xffffff, 1.0);
    rim.position.set(-3, 5, 6);

    scene.add(amb, hemi, key, fill, rim);


    // --- Environment (HDR) ---
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    (async () => {
      try {
        scene.environment = await new Promise((res, rej) =>
          new RGBELoader().load(
            hdrUrl,
            (hdr) => { const tex = pmrem.fromEquirectangular(hdr).texture; hdr.dispose(); res(tex); },
            undefined,
            rej
          )
        );
      } catch (e) {
        console.warn("HDR gagal dimuat:", hdrUrl, e?.message);
      }
    })();

    // ------- PRELOAD TEKSTUR (opsional) -------
    const texPromise = finalTextureUrl
      ? new Promise((res) => {
          new THREE.TextureLoader().load(
            finalTextureUrl,
            (t) => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; res(t); },
            undefined,
            (err) => { console.warn("Gagal load texture:", finalTextureUrl, err?.message); res(null); }
          );
        })
      : Promise.resolve(null);

    // --- State ---
    let rootObj = null, mixer = null, debugCube = null;

    const frameObject = (obj) => {
      obj.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);

      const baseTargetY = Math.max(0.5, size.y * 0.35);
      const targetY = baseTargetY + size.y * targetYOffsetRatio;
      controls.target.set(0, targetY, 0);
      controls.update();

      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const radius = Math.max(0.001, sphere.radius) * modelScale;

      const fovV = THREE.MathUtils.degToRad(camera.fov);
      const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
      const distV = radius / Math.sin(fovV / 2);
      const distH = radius / Math.sin(fovH / 2);
      const camDist = Math.max(distV, distH) * fitPadding;

      const az = THREE.MathUtils.degToRad(initialAzimuthDeg);
      const el = THREE.MathUtils.degToRad(initialElevDeg);
      const y = camDist * Math.sin(el);
      const r = camDist * Math.cos(el);
      const x = r * Math.cos(az);
      const z = r * Math.sin(az);
      camera.position.set(x, y, z);
      camera.lookAt(controls.target);
    };

    const applyBodyColor = (root) => {
      if (!bodyColor) return;
      const col = new THREE.Color(bodyColor);
      root.traverse((o) => {
        if (o.isMesh && o.material) {
          const name = (o.material.name || o.name || "").toLowerCase();
          if (/(paint|body|carpaint|car_paint|car-paint)/.test(name)) {
            o.material = o.material.clone();
            o.material.color?.copy(col);
            o.material.needsUpdate = true;
          }
        }
      });
    };

    const applyAccentColor = (root) => {
      if (!accentColor) return;
      const target = new THREE.Color(accentColor);
      const patterns = [/blue|accent|stripe|stitch|seat|interior|caliper/i];
      root.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          const n = (m.name || o.name || "").toLowerCase();
          const byName = patterns.some((rx) => rx.test(n));
          let byHue = false;
          if (m.color) { const hsl = { h:0, s:0, l:0 }; m.color.getHSL(hsl); byHue = hsl.h>0.52 && hsl.h<0.70 && hsl.s>0.2; }
          if (byName || byHue) { m.color?.set(target); m.emissive?.set(target); m.needsUpdate = true; }
        });
      });
    };

    // --- Paksa pakai 1 tekstur ke semua mesh kalau textureUrl diberikan ---
    const applyTextureOverride = (root, tex) => {
      if (!tex) return;
      root.traverse((o) => {
        if (!o.isMesh) return;

        // pastikan normal OK
        if (o.geometry && !o.geometry.attributes.normal) {
          o.geometry.computeVertexNormals();
        }

        const toStd = (mat) => {
          const baseColor = (mat?.color && mat.color.isColor) ? mat.color.clone() : new THREE.Color(0xffffff);
          const std = new THREE.MeshStandardMaterial({
            map: tex,
            color: baseColor,
            roughness: 0.8,
            metalness: 0.05,
            skinning: !!o.isSkinnedMesh,
          });
          std.needsUpdate = true;
          return std;
        };

        if (Array.isArray(o.material)) {
          o.material = o.material.map(toStd);
        } else {
          o.material = toStd(o.material);
        }
      });
    };

    const addDebugCube = () => {
      if (debugCube) return;
      debugCube = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshStandardMaterial({ color: 0x13eafd })
      );
      scene.add(debugCube);
      frameObject(debugCube);
      console.warn("DEBUG cube tampil karena gagal load model:", finalModelUrl);
    };

    const handleRoot = async (root, animations = []) => {
      if (!root || (root.children?.length ?? 0) === 0) {
        console.warn("DAE/GLTF ter-load tapi scene kosong. Menampilkan debug cube.");
        addDebugCube();
        return;
      }

      // kalau DAE-nya rebah (Z-up), kamu bisa coba aktifkan ini:
      // root.rotation.x = -Math.PI / 2;

      root.scale.setScalar(modelScale);
      root.position.set(modelOffset[0] ?? 0, modelOffset[1] ?? 0, modelOffset[2] ?? 0);
      root.rotation.x += THREE.MathUtils.degToRad(modelTiltDeg);

      // override texture kalau ada
      const tex = await texPromise;
      applyTextureOverride(root, tex);

      applyBodyColor(root);
      applyAccentColor(root);

      scene.add(root);
      rootObj = root;
      requestAnimationFrame(() => frameObject(root));

      if (animations.length) {
        mixer = new THREE.AnimationMixer(root);
        mixer.clipAction(animations[0]).play();
      }
    };

    // --- pilih loader berdasar ekstensi ---
    const ext = finalModelUrl.split("?")[0].split(".").pop()?.toLowerCase();
    if (ext === "dae") {
      const loader = new ColladaLoader();
      const resPath = finalModelUrl.replace(/[^/]+$/, "/");
      loader.setResourcePath(resPath);
      console.log("[Model] loading DAE:", finalModelUrl, "resPath:", resPath);

      loader.load(
        finalModelUrl,
        (collada) => {
          const root  = collada.scene || collada;
          const anims = (root.animations?.length ? root.animations : (collada.animations || []));
          console.log("[Model] DAE loaded. children:", root?.children?.length ?? 0);
          handleRoot(root, anims);
        },
        undefined,
        (e) => { console.error("DAE load error:", e); addDebugCube(); }
      );

    } else {
      const draco = new DRACOLoader();
      draco.setDecoderPath(dracoPath);
      draco.preload();
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      loader.load(
        finalModelUrl,
        (gltf) => handleRoot(gltf.scene, gltf.animations || []),
        undefined,
        (e) => { console.error("GLB/GLTF load error:", e); addDebugCube(); }
      );
    }

    // --- Resize & Loop ---
    const onResize = () => {
      const { w, h } = size();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (rootObj) frameObject(rootObj);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      const dt = clock.getDelta();
      if (spin) {
        camera.position.applyAxisAngle(new THREE.Vector3(0,1,0), spinSpeed * dt);
        camera.lookAt(controls.target);
      }
      if (mixer) mixer.update(dt);
      if (debugCube) { debugCube.rotation.y += dt * 0.8; debugCube.rotation.x += dt * 0.4; }
      controls.update();
      renderer.render(scene, camera);
      reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(reqRef.current);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      controls.dispose();
      pmrem.dispose();
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose?.();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
            for (const k in m) { const v = m[k]; if (v && v.isTexture) v.dispose?.(); }
            m.dispose?.();
          });
        }
      });
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [
    modelUrl, textureUrl, spin, spinSpeed,
    modelScale, modelOffset, bodyColor, modelTiltDeg, accentColor,
    cameraFov, fitPadding, initialAzimuthDeg, initialElevDeg,
    targetYOffsetRatio, showGrid
  ]);

  return <div className={`relative ${className}`} ref={mountRef} />;
}
