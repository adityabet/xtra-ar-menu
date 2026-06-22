import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ZoomIn, ZoomOut, Cuboid, ChevronDown, ChevronUp, Smartphone, Cpu, MemoryStick, Globe } from 'lucide-react';

// ── AR Not Supported Modal ────────────────────────────────────────────────────
function ArNotSupportedModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="w-full max-w-md rounded-t-3xl pb-10 px-5 pt-5"
        style={{ background: '#111', border: '1px solid rgba(200,169,81,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(200,169,81,0.10)', border: '1px solid rgba(200,169,81,0.25)' }}
        >
          <Smartphone size={30} color="#C8A951" />
        </div>

        <h2 className="text-white text-lg font-bold text-center mb-1" style={{ fontFamily: 'var(--font-body)' }}>
          AR Not Supported
        </h2>
        <p className="text-center text-xs mb-6" style={{ color: '#6B6B6B', fontFamily: 'var(--font-text)' }}>
          Your device doesn't meet the AR requirements.
          You can still enjoy the 3D model above.
        </p>

        {/* Requirements */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Android */}
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A951', fontFamily: 'var(--font-body)' }}>
              🤖 Android Requirements
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { icon: <Smartphone size={12} />, text: 'Android 8.0 or higher' },
                { icon: <Cpu size={12} />, text: 'ARCore supported device (Snapdragon 660+ / Dimensity 700+)' },
                { icon: <MemoryStick size={12} />, text: '3 GB RAM minimum (4 GB recommended)' },
                { icon: <Globe size={12} />, text: 'Google Chrome browser (latest)' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: '#C8A951', marginTop: 1 }}>{r.icon}</span>
                  <span className="text-xs" style={{ color: '#999', fontFamily: 'var(--font-text)' }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* iOS */}
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A951', fontFamily: 'var(--font-body)' }}>
               iOS Requirements
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { icon: <Smartphone size={12} />, text: 'iPhone 6s or later / iPad (5th gen+)' },
                { icon: <Cpu size={12} />, text: 'A9 chip or higher (ARKit support)' },
                { icon: <MemoryStick size={12} />, text: 'iOS 12 or higher' },
                { icon: <Globe size={12} />, text: 'Safari browser (required for iOS AR)' },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: '#C8A951', marginTop: 1 }}>{r.icon}</span>
                  <span className="text-xs" style={{ color: '#999', fontFamily: 'var(--font-text)' }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px]" style={{ color: '#444', fontFamily: 'var(--font-text)' }}>
          Tip: Make sure you're on <span style={{ color: '#C8A951' }}>HTTPS</span> and camera permission is allowed
        </p>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.25)', color: '#C8A951', fontFamily: 'var(--font-body)' }}
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Ingredients overlay panel ─────────────────────────────────────────────────
function IngredientsOverlay({ ingredients, dishName, arActive }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!ingredients?.length) return null;

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 220, damping: 28 }}
      className="absolute bottom-0 left-0 right-0 z-20"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] text-gold active:scale-95 transition-all"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.25)', backdropFilter: 'blur(12px)' }}
        >
          {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {collapsed ? 'Show Ingredients' : 'Hide'}
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pt-4 pb-6"
              style={{
                background: arActive ? 'rgba(0,0,0,0.72)' : 'rgba(10,10,10,0.92)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(212,175,55,0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gold text-xs">✦</span>
                <span className="text-white font-semibold text-xs tracking-widest uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  Ingredients
                </span>
                <span className="text-gray-600 text-xs">· {dishName}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, i) => (
                  <motion.span
                    key={ing}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="text-gray-200 text-xs px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.28)', backdropFilter: 'blur(8px)' }}
                  >
                    {ing}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main ARViewer ─────────────────────────────────────────────────────────────
export default function ARViewer({ src, dishName, ingredients, onClose }) {
  const viewerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [arActive, setArActive] = useState(false);
  const [error, setError] = useState(false);
  const [showNoArModal, setShowNoArModal] = useState(false);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onLoad = () => setLoading(false);

    const onArStatus = (e) => {
      const s = e.detail.status;
      setArActive(s === 'session-started' || s === 'object-placed');
      if (s === 'failed') setShowNoArModal(true);
      if (s === 'not-presenting') { setArActive(false); }
    };

    const onError = () => { setLoading(false); setError(true); };

    el.addEventListener('load', onLoad);
    el.addEventListener('ar-status', onArStatus);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('ar-status', onArStatus);
      el.removeEventListener('error', onError);
      stopArRotation();
    };
  }, [src]);

  // When AR button is tapped — always try to launch AR first, show modal only if it fails
  const handleArTap = async () => {
    const mv = viewerRef.current;
    if (!mv) return;
    try {
      await mv.activateAR();
    } catch {
      setShowNoArModal(true);
    }
  };

  const resetCamera = () => viewerRef.current?.resetTurntableRotation?.();
  const zoom = (dir) => {
    const el = viewerRef.current;
    if (!el) return;
    const cur = el.getCameraOrbit();
    el.cameraOrbit = `${cur.theta}rad ${cur.phi}rad ${cur.radius * (dir === 'in' ? 0.8 : 1.25)}m`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: '#000' }}
      >
        {/* Header */}
        <AnimatePresence>
          {!arActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between px-4 h-14 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}
            >
              <div className="flex items-center gap-2">
                <Cuboid size={16} className="text-gold" />
                <span className="text-white font-semibold text-sm truncate max-w-[200px]">{dishName}</span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D / AR viewer */}
        <div className="flex-1 relative" style={{ background: '#000' }}>

          {/* Loading spinner */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
                style={{ background: '#000' }}
              >
                <div
                  className="w-14 h-14 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }}
                />
                <span className="text-gray-500 text-xs tracking-widest uppercase">Loading 3D Model…</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="text-4xl">⚠️</span>
              <p className="text-gray-400 text-sm">Could not load 3D model.</p>
            </div>
          )}

          {/* model-viewer */}
          {/* eslint-disable react/no-unknown-property */}
          <model-viewer
            ref={viewerRef}
            src={src.glb}
            {...(src.usdz ? { 'ios-src': src.usdz } : {})}
            alt={dishName}
            ar
            ar-modes="webxr quick-look"
            ar-scale="fixed"
            ar-placement="floor"
            camera-controls
            auto-rotate
            auto-rotate-delay="1200"
            rotation-per-second="12deg"
            interpolation-decay="200"
            interaction-prompt="none"
            shadow-intensity="1"
            shadow-softness="1"
            exposure="1.1"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', background: '#000', touchAction: 'none' }}
          />
          {/* eslint-enable react/no-unknown-property */}

          {/* Zoom / reset controls */}
          {!loading && !error && !arActive && (
            <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
              {[
                { icon: <ZoomIn size={16} />, fn: () => zoom('in') },
                { icon: <ZoomOut size={16} />, fn: () => zoom('out') },
                { icon: <RotateCcw size={16} />, fn: resetCamera },
              ].map((b, i) => (
                <button
                  key={i}
                  onClick={b.fn}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 active:scale-90 transition-all"
                  style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {b.icon}
                </button>
              ))}
            </div>
          )}

          {/* Ingredients overlay */}
          {!loading && !error && (
            <IngredientsOverlay ingredients={ingredients} dishName={dishName} arActive={arActive} />
          )}
        </div>

        {/* Bottom AR button */}
        {!loading && !error && !arActive && (
          <div
            className="flex-shrink-0 px-4 pb-8 pt-4 flex flex-col gap-2 items-center"
            style={{ borderTop: '1px solid rgba(212,175,55,0.1)', background: '#000' }}
          >
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleArTap}
              className="w-full max-w-xs py-4 rounded-2xl font-bold text-black text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#D4AF37 0%,#F0D060 50%,#A0842A 100%)', fontFamily: 'var(--font-body)' }}
            >
              <Cuboid size={18} />
              View in AR
            </motion.button>
            <p className="text-gray-600 text-[11px] text-center px-2" style={{ fontFamily: 'var(--font-text)' }}>
              Point camera at the <span style={{ color: '#C8A951' }}>centre of the table</span> — move phone slightly back if dish doesn't appear
            </p>
          </div>
        )}
      </motion.div>

      {/* AR Not Supported Modal */}
      <AnimatePresence>
        {showNoArModal && <ArNotSupportedModal onClose={() => setShowNoArModal(false)} />}
      </AnimatePresence>
    </>
  );
}
