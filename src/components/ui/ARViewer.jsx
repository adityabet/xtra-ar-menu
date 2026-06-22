import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cuboid, Smartphone, Cpu, MemoryStick, Globe } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── AR Not Supported Modal ─────────────────────────────────────────────────────
function ArNotSupportedModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="w-full max-w-md rounded-t-3xl pb-10 px-5 pt-5"
        style={{ background: '#111', border: '1px solid rgba(200,169,81,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(200,169,81,0.10)', border: '1px solid rgba(200,169,81,0.25)' }}>
          <Smartphone size={30} color="#C8A951" />
        </div>
        <h2 className="text-white text-lg font-bold text-center mb-1" style={{ fontFamily: 'var(--font-body)' }}>AR Not Supported</h2>
        <p className="text-center text-xs mb-5" style={{ color: '#6B6B6B', fontFamily: 'var(--font-text)' }}>
          Your device doesn't support AR. You can still view the 3D model.
        </p>
        <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A951' }}>🤖 Android</p>
            {[
              [<Smartphone size={11}/>, 'Android 8.0+'],
              [<Cpu size={11}/>, 'ARCore device (Snapdragon 660+ / Dimensity 700+)'],
              [<MemoryStick size={11}/>, '3 GB RAM minimum'],
              [<Globe size={11}/>, 'Chrome on HTTPS'],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-2 mb-1">
                <span style={{ color: '#C8A951', marginTop: 1 }}>{icon}</span>
                <span className="text-xs" style={{ color: '#888', fontFamily: 'var(--font-text)' }}>{text}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A951' }}> iOS</p>
            {[
              [<Smartphone size={11}/>, 'iPhone 6s or later'],
              [<Cpu size={11}/>, 'A9 chip (ARKit)'],
              [<Globe size={11}/>, 'Safari on HTTPS'],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-2 mb-1">
                <span style={{ color: '#C8A951', marginTop: 1 }}>{icon}</span>
                <span className="text-xs" style={{ color: '#888', fontFamily: 'var(--font-text)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.25)', color: '#C8A951', fontFamily: 'var(--font-body)' }}>
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main ARViewer ──────────────────────────────────────────────────────────────
export default function ARViewer({ src, dishName, ingredients, onClose }) {
  const rendererRef  = useRef(null);
  const sceneRef     = useRef(null);
  const cameraRef    = useRef(null);
  const controlsRef  = useRef(null);
  const modelRef     = useRef(null);
  const hitSrcRef    = useRef(null);
  const reticleRef   = useRef(null);
  const posBufferRef = useRef([]);
  const placedRef    = useRef(false);
  const sessionRef   = useRef(null);
  const baseScaleRef = useRef(1);
  const lastPinchRef = useRef(null);
  const canvasRef    = useRef(null); // reference to body-mounted canvas

  const [status, setStatus]           = useState('loading');
  const [showNoArModal, setShowNoArModal] = useState(false);

  const isAR = status === 'ar' || status === 'placed';

  // ── Build Three.js scene — canvas appended to body (fullscreen) ─────────────
  useEffect(() => {
    // Create fullscreen canvas on body so WebXR can properly take it over
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 100; background: #000; display: block;
    `;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const W = window.innerWidth, H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 50);
    camera.position.set(0, 0.35, 1.0);
    cameraRef.current = camera;

    // Lighting
    scene.add(new THREE.AmbientLight(0xfff8e7, 1.0));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(2, 4, 3); dir.castShadow = true;
    scene.add(dir);
    scene.add(Object.assign(new THREE.DirectionalLight(0xffe0c0, 0.4), { position: new THREE.Vector3(-2, 1, -2) }));

    // Shadow floor disc for 3D view
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 64),
      new THREE.ShadowMaterial({ opacity: 0.12 })
    );
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    scene.add(floor);

    // OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.07;
    controls.autoRotate = true; controls.autoRotateSpeed = 1.2;
    controls.enablePan = false;
    controls.minDistance = 0.2; controls.maxDistance = 2.5;
    controls.minPolarAngle = Math.PI / 6; controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    renderer.xr.addEventListener('sessionstart', () => { controls.enabled = false; });
    renderer.xr.addEventListener('sessionend',   () => { controls.enabled = true;  });

    // Load GLB
    new GLTFLoader().load(src.glb, (gltf) => {
      const model = gltf.scene;
      model.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

      // Scale to real dish size (~22cm)
      const box  = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = 0.22 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);
      baseScaleRef.current = scale;

      // Center
      box.setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -box.min.y, -center.z);

      scene.add(model);
      modelRef.current = model;
      setStatus('ready');
    }, undefined, () => setStatus('error'));

    // Gold reticle ring for AR placement
    const rGeo = new THREE.RingGeometry(0.05, 0.065, 40);
    rGeo.rotateX(-Math.PI / 2);
    const reticle = new THREE.Mesh(rGeo,
      new THREE.MeshBasicMaterial({ color: 0xC8A951, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    reticle.matrixAutoUpdate = false; reticle.visible = false;
    scene.add(reticle);
    reticleRef.current = reticle;

    // Render loop
    renderer.setAnimationLoop((_, frame) => {
      // AR hit-test
      if (frame && hitSrcRef.current && !placedRef.current) {
        const refSpace = renderer.xr.getReferenceSpace();
        const hits = frame.getHitTestResults(hitSrcRef.current);
        if (hits.length > 0) {
          const pose = hits[0].getPose(refSpace);
          if (pose) {
            const mat = new THREE.Matrix4().fromArray(pose.transform.matrix);
            const pos = new THREE.Vector3().setFromMatrixPosition(mat);
            // Smooth last 10 positions — eliminates shaking
            posBufferRef.current.push(pos.clone());
            if (posBufferRef.current.length > 10) posBufferRef.current.shift();
            const smooth = posBufferRef.current
              .reduce((a, p) => a.add(p), new THREE.Vector3())
              .divideScalar(posBufferRef.current.length);
            const quat = new THREE.Quaternion().setFromRotationMatrix(mat);
            reticle.matrix.compose(smooth, quat, new THREE.Vector3(1, 1, 1));
            reticle.visible = true;
          }
        } else { reticle.visible = false; }
      }
      if (!frame) controls.update();
      renderer.render(scene, camera);
    });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [src]);

  // ── Launch AR ──────────────────────────────────────────────────────────────
  const handleArTap = async () => {
    if (!navigator.xr) { setShowNoArModal(true); return; }
    try {
      const ok = await navigator.xr.isSessionSupported('immersive-ar');
      if (!ok) { setShowNoArModal(true); return; }

      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
      });
      sessionRef.current = session;
      await rendererRef.current.xr.setSession(session);
      setStatus('ar');
      placedRef.current = false;
      posBufferRef.current = [];

      const viewerSpace = await session.requestReferenceSpace('viewer');
      hitSrcRef.current = await session.requestHitTestSource({ space: viewerSpace });

      // Tap floor to place dish
      session.addEventListener('select', () => {
        const reticle = reticleRef.current;
        const model   = modelRef.current;
        if (!placedRef.current && reticle?.visible && model) {
          placedRef.current = true;
          const pos  = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
          const quat = new THREE.Quaternion().setFromRotationMatrix(reticle.matrix);
          model.position.copy(pos);
          model.quaternion.copy(quat);
          reticle.visible = false;
          setStatus('placed');
        }
      });

      session.addEventListener('end', () => {
        if (hitSrcRef.current) { hitSrcRef.current.cancel(); hitSrcRef.current = null; }
        placedRef.current = false;
        posBufferRef.current = [];
        if (reticleRef.current) reticleRef.current.visible = false;
        setStatus('ready');
      });

    } catch (e) {
      console.error('AR error:', e);
      setStatus('ready');
      setShowNoArModal(true);
    }
  };

  const exitAR = () => sessionRef.current?.end();

  // Pinch-to-zoom in AR
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length !== 2 || !lastPinchRef.current || !modelRef.current) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const next = Math.max(
      baseScaleRef.current * 0.3,
      Math.min(modelRef.current.scale.x * (dist / lastPinchRef.current), baseScaleRef.current * 4)
    );
    modelRef.current.scale.setScalar(next);
    lastPinchRef.current = dist;
  };
  const onTouchEnd = () => { lastPinchRef.current = null; };

  const arZoom = (dir) => {
    const m = modelRef.current; if (!m) return;
    m.scale.setScalar(dir === 'in'
      ? Math.min(m.scale.x * 1.25, baseScaleRef.current * 4)
      : Math.max(m.scale.x * 0.8,  baseScaleRef.current * 0.3));
  };

  // ── React UI — z-index 101, always above the canvas ───────────────────────
  return (
    <>
      {/* ── 3D View UI (shown over black canvas before AR) ── */}
      {!isAR && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 flex flex-col"
          style={{ zIndex: 101, background: 'transparent', pointerEvents: 'none' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 flex-shrink-0"
            style={{ background: '#000', borderBottom: '1px solid rgba(212,175,55,0.1)', pointerEvents: 'auto' }}>
            <div className="flex items-center gap-2">
              <Cuboid size={16} color="#C8A951" />
              <span className="text-white font-semibold text-sm truncate max-w-[200px]">{dishName}</span>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={18} />
            </button>
          </div>

          {/* Spacer — canvas shows through here */}
          <div className="flex-1" />

          {/* Loading overlay */}
          <AnimatePresence>
            {status === 'loading' && (
              <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
                style={{ top: 56 }}>
                <div className="w-14 h-14 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }} />
                <span className="text-gray-500 text-xs tracking-widest uppercase">Loading 3D Model…</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ingredients */}
          {ingredients?.length > 0 && status !== 'loading' && (
            <div className="flex-shrink-0 px-4 pt-3 pb-2 pointer-events-auto"
              style={{ background: 'rgba(10,10,10,0.95)', borderTop: '1px solid rgba(212,175,55,0.12)' }}>
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-2"
                style={{ color: '#C8A951', fontFamily: 'var(--font-body)' }}>✦ Ingredients</p>
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map(ing => (
                  <span key={ing} className="text-[11px] px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)', color: '#bbb', fontFamily: 'var(--font-text)' }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AR Button */}
          <div className="flex-shrink-0 px-4 pb-8 pt-3 flex flex-col gap-2 items-center pointer-events-auto"
            style={{ background: '#000', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
            <motion.button
              whileTap={{ scale: 0.96 }} onClick={handleArTap}
              className="w-full max-w-xs py-4 rounded-2xl font-bold text-black text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#D4AF37 0%,#F0D060 50%,#A0842A 100%)', fontFamily: 'var(--font-body)' }}>
              <Cuboid size={18} />
              View in AR
            </motion.button>
            <p className="text-gray-600 text-[11px] text-center px-2" style={{ fontFamily: 'var(--font-text)' }}>
              Point camera at the <span style={{ color: '#C8A951' }}>floor</span> — tap the gold ring to place the dish
            </p>
          </div>
        </motion.div>
      )}

      {/* ── AR UI — floats over live camera feed ── */}
      {isAR && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 101, pointerEvents: 'auto' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close AR */}
          <button onClick={exitAR}
            className="absolute top-6 right-4 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(8px)' }}>
            <X size={20} color="#fff" />
          </button>

          {/* Instruction: scan floor */}
          {status === 'ar' && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <div className="px-5 py-3 rounded-2xl text-center"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <p className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-body)' }}>Point camera at the floor</p>
                <p className="text-xs mt-0.5" style={{ color: '#C8A951', fontFamily: 'var(--font-text)' }}>Tap the gold ring to place the dish</p>
              </div>
            </div>
          )}

          {/* Zoom controls after placed */}
          {status === 'placed' && (
            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <button onTouchStart={() => arZoom('out')}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,175,55,0.35)', backdropFilter: 'blur(10px)' }}>
                  −
                </button>
                <div className="px-4 py-2 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(200,169,81,0.25)', backdropFilter: 'blur(10px)' }}>
                  <p className="text-xs" style={{ color: '#C8A951', fontFamily: 'var(--font-text)' }}>Pinch or tap ± to resize</p>
                </div>
                <button onTouchStart={() => arZoom('in')}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,175,55,0.35)', backdropFilter: 'blur(10px)' }}>
                  +
                </button>
              </div>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-text)' }}>
                ✦ Walk around to view from every angle
              </p>
            </div>
          )}
        </div>
      )}

      {/* No AR modal */}
      <AnimatePresence>
        {showNoArModal && <ArNotSupportedModal onClose={() => setShowNoArModal(false)} />}
      </AnimatePresence>
    </>
  );
}
