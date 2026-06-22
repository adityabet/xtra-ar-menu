import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cuboid, ZoomIn, ZoomOut, RotateCcw, Smartphone, Cpu, MemoryStick, Globe } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── AR Not Supported Modal ─────────────────────────────────────────────────────
function ArNotSupportedModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
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
        <h2 className="text-white text-lg font-bold text-center mb-1" style={{ fontFamily: 'var(--font-body)' }}>
          AR Not Supported
        </h2>
        <p className="text-center text-xs mb-6" style={{ color: '#6B6B6B', fontFamily: 'var(--font-text)' }}>
          Your device doesn't meet the AR requirements. You can still enjoy the 3D model above.
        </p>
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A951', fontFamily: 'var(--font-body)' }}>🤖 Android Requirements</p>
            {[
              [<Smartphone size={12} />, 'Android 8.0 or higher'],
              [<Cpu size={12} />, 'ARCore supported (Snapdragon 660+ / Dimensity 700+)'],
              [<MemoryStick size={12} />, '3 GB RAM minimum'],
              [<Globe size={12} />, 'Google Chrome (latest) over HTTPS'],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-2 mb-1">
                <span style={{ color: '#C8A951', marginTop: 1 }}>{icon}</span>
                <span className="text-xs" style={{ color: '#999', fontFamily: 'var(--font-text)' }}>{text}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A951', fontFamily: 'var(--font-body)' }}> iOS Requirements</p>
            {[
              [<Smartphone size={12} />, 'iPhone 6s or later'],
              [<Cpu size={12} />, 'A9 chip or higher (ARKit)'],
              [<MemoryStick size={12} />, 'iOS 12 or higher'],
              [<Globe size={12} />, 'Safari browser required'],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-2 mb-1">
                <span style={{ color: '#C8A951', marginTop: 1 }}>{icon}</span>
                <span className="text-xs" style={{ color: '#999', fontFamily: 'var(--font-text)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-[11px] mb-4" style={{ color: '#444', fontFamily: 'var(--font-text)' }}>
          Make sure you're on <span style={{ color: '#C8A951' }}>HTTPS</span> and camera permission is allowed
        </p>
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.25)', color: '#C8A951', fontFamily: 'var(--font-body)' }}>
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main ARViewer ──────────────────────────────────────────────────────────────
export default function ARViewer({ src, dishName, onClose }) {
  const canvasRef       = useRef(null);
  const rendererRef     = useRef(null);
  const sceneRef        = useRef(null);
  const cameraRef       = useRef(null);
  const controlsRef     = useRef(null);
  const modelRef        = useRef(null);
  const hitSrcRef       = useRef(null);
  const reticleRef      = useRef(null);
  const posBufferRef    = useRef([]);
  const placedRef       = useRef(false);
  const sessionRef      = useRef(null);
  const baseScaleRef    = useRef(1);      // model's base scale after GLB load
  const lastPinchRef    = useRef(null);   // last pinch distance for zoom gesture

  const [status, setStatus]           = useState('loading'); // loading | ready | ar | placed | error
  const [showNoArModal, setShowNoArModal] = useState(false);

  // ── Build Three.js scene ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.01, 50);
    camera.position.set(0, 0.4, 1.2);
    cameraRef.current = camera;

    // Lighting
    scene.add(new THREE.AmbientLight(0xfff8e7, 1.0));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(2, 4, 3);
    dir.castShadow = true;
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xffe0c0, 0.4);
    fill.position.set(-2, 1, -2);
    scene.add(fill);

    // Shadow receiver (floor disc in 3D view)
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(0.8, 64),
      new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    scene.add(floor);

    // Orbit controls for 3D view
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.07;
    controls.autoRotate     = true;
    controls.autoRotateSpeed = 1.2;
    controls.enablePan      = false;
    controls.minDistance    = 0.2;
    controls.maxDistance    = 2.5;
    controls.minPolarAngle  = Math.PI / 6;
    controls.maxPolarAngle  = Math.PI / 2;
    controlsRef.current = controls;

    // Disable controls during AR
    renderer.xr.addEventListener('sessionstart', () => { controls.enabled = false; });
    renderer.xr.addEventListener('sessionend',   () => { controls.enabled = true;  });

    // Load GLB
    new GLTFLoader().load(
      src.glb,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        // Auto-scale to ~22cm (real dish size)
        const box  = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = 0.22 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        baseScaleRef.current = scale; // save base scale for pinch zoom reference

        // Center on Y=0
        box.setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -box.min.y, -center.z);

        scene.add(model);
        modelRef.current = model;
        setStatus('ready');
      },
      undefined,
      () => setStatus('error')
    );

    // Reticle (gold ring — shown in AR before placing)
    const reticleGeo = new THREE.RingGeometry(0.05, 0.065, 40);
    reticleGeo.rotateX(-Math.PI / 2);
    const reticle = new THREE.Mesh(
      reticleGeo,
      new THREE.MeshBasicMaterial({ color: 0xC8A951, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
    reticleRef.current = reticle;

    // Main render loop
    renderer.setAnimationLoop((_, frame) => {
      // ── AR hit-test ──
      if (frame && hitSrcRef.current && !placedRef.current) {
        const refSpace = renderer.xr.getReferenceSpace();
        const results  = frame.getHitTestResults(hitSrcRef.current);

        if (results.length > 0) {
          const pose = results[0].getPose(refSpace);
          if (pose) {
            const mat = new THREE.Matrix4().fromArray(pose.transform.matrix);
            const pos = new THREE.Vector3().setFromMatrixPosition(mat);

            // Smooth position — average last 10 frames → eliminates shaking
            posBufferRef.current.push(pos.clone());
            if (posBufferRef.current.length > 10) posBufferRef.current.shift();
            const smooth = posBufferRef.current
              .reduce((a, p) => a.add(p), new THREE.Vector3())
              .divideScalar(posBufferRef.current.length);

            const quat   = new THREE.Quaternion().setFromRotationMatrix(mat);
            reticle.matrix.compose(smooth, quat, new THREE.Vector3(1, 1, 1));
            reticle.visible = true;
          }
        } else {
          reticle.visible = false;
        }
      }

      // ── 3D view auto-rotate ──
      if (!frame) controls.update();

      renderer.render(scene, camera);
    });

    // Resize handler
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
    };
  }, [src]);

  // ── Launch AR ──────────────────────────────────────────────────────────────
  const handleArTap = async () => {
    if (!navigator.xr) { setShowNoArModal(true); return; }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (!supported) { setShowNoArModal(true); return; }

      // Show AR overlay BEFORE requesting session so dom-overlay element is in DOM + visible
      setStatus('ar');
      await new Promise(r => setTimeout(r, 80));

      const overlayEl = document.getElementById('ar-overlay');
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        ...(overlayEl ? { domOverlay: { root: overlayEl } } : {}),
      });
      sessionRef.current = session;

      await rendererRef.current.xr.setSession(session);
      placedRef.current  = false;
      posBufferRef.current = [];

      // Tap to place dish
      session.addEventListener('select', () => {
        const reticle = reticleRef.current;
        const model   = modelRef.current;
        if (!placedRef.current && reticle?.visible && model) {
          placedRef.current = true;
          const pos = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
          const quat = new THREE.Quaternion().setFromRotationMatrix(reticle.matrix);
          model.position.copy(pos);
          model.quaternion.copy(quat);
          reticle.visible = false;
          setStatus('placed');
        }
      });

      session.addEventListener('end', () => {
        if (hitSrcRef.current) { hitSrcRef.current.cancel(); hitSrcRef.current = null; }
        placedRef.current    = false;
        posBufferRef.current = [];
        if (reticleRef.current) reticleRef.current.visible = false;
        setStatus('ready');
      });

    } catch (e) {
      console.error('AR error:', e);
      setStatus('ready'); // revert so button stays visible
      setShowNoArModal(true);
    }
  };

  const exitAR = () => { sessionRef.current?.end(); };

  // AR model scale buttons
  const arZoom = (dir) => {
    const model = modelRef.current;
    if (!model) return;
    const cur = model.scale.x;
    const next = dir === 'in'
      ? Math.min(cur * 1.25, baseScaleRef.current * 4)   // max 4× real size
      : Math.max(cur * 0.8,  baseScaleRef.current * 0.3); // min 30% real size
    model.scale.setScalar(next);
  };

  // Pinch-to-zoom in AR — 2 fingers scale the placed model
  const onArTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };
  const onArTouchMove = (e) => {
    if (e.touches.length !== 2 || !lastPinchRef.current) return;
    const model = modelRef.current;
    if (!model) return;
    const dx   = e.touches[0].clientX - e.touches[1].clientX;
    const dy   = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ratio = dist / lastPinchRef.current;
    const next = Math.max(
      baseScaleRef.current * 0.3,
      Math.min(model.scale.x * ratio, baseScaleRef.current * 4)
    );
    model.scale.setScalar(next);
    lastPinchRef.current = dist;
  };
  const onArTouchEnd = () => { lastPinchRef.current = null; };

  const zoom = (dir) => {
    const cam = cameraRef.current;
    if (!cam) return;
    cam.position.multiplyScalar(dir === 'in' ? 0.85 : 1.18);
  };

  const resetView = () => {
    if (cameraRef.current) cameraRef.current.position.set(0, 0.4, 1.2);
    controlsRef.current?.reset();
  };

  const isAR = status === 'ar' || status === 'placed';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: '#000' }}
      >
        {/* Header — hidden in AR */}
        {!isAR && (
          <div className="flex items-center justify-between px-4 h-14 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
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
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ background: '#000' }}
          />

          {/* Loading */}
          <AnimatePresence>
            {status === 'loading' && (
              <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
                style={{ background: '#000' }}>
                <div className="w-14 h-14 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }} />
                <span className="text-gray-500 text-xs tracking-widest uppercase">Loading 3D Model…</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {status === 'error' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">⚠️</span>
              <p className="text-gray-400 text-sm">Could not load 3D model.</p>
            </div>
          )}

          {/* Zoom / Reset controls — 3D view only */}
          {status === 'ready' && (
            <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
              {[{ icon: <ZoomIn size={16} />, fn: () => zoom('in') },
                { icon: <ZoomOut size={16} />, fn: () => zoom('out') },
                { icon: <RotateCcw size={16} />, fn: resetView }]
                .map((b, i) => (
                  <button key={i} onClick={b.fn}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 active:scale-90 transition-all"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {b.icon}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Ingredients panel — shown below 3D viewer */}
        {!isAR && ingredients?.length > 0 && (
          <div className="flex-shrink-0 px-4 pt-3 pb-2"
            style={{ borderTop: '1px solid rgba(212,175,55,0.12)', background: '#0a0a0a' }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2"
              style={{ color: '#C8A951', fontFamily: 'var(--font-body)' }}>✦ Ingredients</p>
            <div className="flex flex-wrap gap-1.5">
              {ingredients.map((ing) => (
                <span key={ing} className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)', color: '#bbb', fontFamily: 'var(--font-text)' }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom button — show always except when in AR session */}
        {!isAR && (
          <div className="flex-shrink-0 px-4 pb-8 pt-3 flex flex-col gap-2 items-center"
            style={{ borderTop: '1px solid rgba(212,175,55,0.1)', background: '#000' }}>
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleArTap}
              className="w-full max-w-xs py-4 rounded-2xl font-bold text-black text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#D4AF37 0%,#F0D060 50%,#A0842A 100%)', fontFamily: 'var(--font-body)' }}>
              <Cuboid size={18} />
              View in AR
            </motion.button>
            <p className="text-gray-600 text-[11px] text-center px-2" style={{ fontFamily: 'var(--font-text)' }}>
              Point camera at the <span style={{ color: '#C8A951' }}>floor in front of you</span> — tap the gold ring to place the dish
            </p>
          </div>
        )}
      </motion.div>

      {/* AR overlay — always in DOM so dom-overlay can reference it; visibility controls display */}
      <div id="ar-overlay"
        style={{ position: 'fixed', inset: 0, zIndex: 70, visibility: isAR ? 'visible' : 'hidden', pointerEvents: isAR ? 'auto' : 'none' }}
        onTouchStart={onArTouchStart}
        onTouchMove={onArTouchMove}
        onTouchEnd={onArTouchEnd}>
        {/* Exit AR */}
        <button
          onClick={exitAR}
          className="fixed top-6 right-4 z-[70] w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(8px)' }}>
          <X size={20} color="#fff" />
        </button>

        {/* Instruction */}
        {status === 'ar' && (
          <div className="fixed bottom-12 left-0 right-0 flex justify-center z-[70]">
            <div className="px-5 py-3 rounded-2xl text-center"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <p className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                Point at the floor
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#C8A951', fontFamily: 'var(--font-text)' }}>
                Tap the gold ring to place the dish
              </p>
            </div>
          </div>
        )}

        {status === 'placed' && (
          <div className="fixed bottom-10 left-0 right-0 flex flex-col items-center gap-3 z-[70]">
            {/* Zoom buttons */}
            <div className="flex items-center gap-3">
              <button onTouchStart={() => arZoom('out')}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold active:scale-90 transition-all"
                style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(212,175,55,0.35)', backdropFilter: 'blur(10px)' }}>
                −
              </button>
              <div className="px-4 py-2 rounded-full"
                style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(200,169,81,0.25)', backdropFilter: 'blur(10px)' }}>
                <p className="text-xs" style={{ color: '#C8A951', fontFamily: 'var(--font-text)' }}>
                  Pinch or tap ± to resize
                </p>
              </div>
              <button onTouchStart={() => arZoom('in')}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold active:scale-90 transition-all"
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

      {/* No AR modal */}
      <AnimatePresence>
        {showNoArModal && <ArNotSupportedModal onClose={() => setShowNoArModal(false)} />}
      </AnimatePresence>
    </>
  );
}
