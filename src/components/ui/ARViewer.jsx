import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cuboid, Smartphone, Cpu, MemoryStick, Globe, ChevronDown, ChevronUp } from 'lucide-react';

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
        <h2 className="text-white text-lg font-bold text-center mb-1" style={{ fontFamily: 'var(--font-body)' }}>
          AR Not Supported
        </h2>
        <p className="text-center text-xs mb-5" style={{ color: '#6B6B6B', fontFamily: 'var(--font-text)' }}>
          Your device doesn't support AR. You can still view the 3D model above.
        </p>
        <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#C8A951' }}>🤖 Android</p>
            {[
              [<Smartphone size={11} />, 'Android 8.0+'],
              [<Cpu size={11} />, 'ARCore device (Snapdragon 660+ / Dimensity 700+)'],
              [<MemoryStick size={11} />, '3 GB RAM minimum'],
              [<Globe size={11} />, 'Chrome on HTTPS'],
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
              [<Smartphone size={11} />, 'iPhone 6s or later'],
              [<Cpu size={11} />, 'A9 chip (ARKit)'],
              [<Globe size={11} />, 'Safari on HTTPS'],
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
  const viewerRef = useRef(null);
  const [loading, setLoading]           = useState(true);
  const [progress, setProgress]         = useState(0);
  const [arStatus, setArStatus]         = useState('idle'); // idle | started | placed
  const [showNoArModal, setShowNoArModal] = useState(false);
  const [ingOpen, setIngOpen]           = useState(true);
  const [scaleVal, setScaleVal]         = useState(0.3);
  const [zoomPct, setZoomPct]           = useState(null); // null = hidden
  const [arZoomPct, setArZoomPct]       = useState(null);
  const defaultFovRef                   = useRef(null);
  const zoomTimerRef                    = useRef(null);
  const arZoomTimerRef                  = useRef(null);
  const arStatusRef                     = useRef('idle');

  const arActive = arStatus === 'started' || arStatus === 'placed';

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onLoad     = () => {
      setLoading(false);
      setProgress(100);
      // capture default FOV once model is loaded
      defaultFovRef.current = el.getFieldOfView?.() ?? null;
    };
    const onCameraChange = () => {
      if (!defaultFovRef.current) return;
      const fov = el.getFieldOfView?.();
      if (!fov) return;
      // smaller FOV = zoomed in; larger = zoomed out. 100% = default view
      const pct = Math.round((defaultFovRef.current / fov) * 100);
      setZoomPct(pct);
      clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = setTimeout(() => setZoomPct(null), 1500);
    };
    const onProgress = (e) => setProgress(Math.round(e.detail.totalProgress * 100));
    const onArStatus = (e) => {
      const s = e.detail.status;
      if (s === 'session-started') {
        arStatusRef.current = 'started';
        setArStatus('started');
        // WebXR requires a REAL finger tap to lock — synthetic events are ignored by the browser
        // We show a full-screen tap overlay instead
      }
      else if (s === 'object-placed') setArStatus('placed');
      else if (s === 'not-presenting') setArStatus('idle');
    };
    const onError   = () => setLoading(false);

    // Watch scale attribute for AR pinch-to-zoom %
    const baseScale = 0.3;
    const observer = new MutationObserver(() => {
      const raw = el.getAttribute('scale') || `${baseScale} ${baseScale} ${baseScale}`;
      const s = parseFloat(raw.split(' ')[0]);
      const pct = Math.round((s / baseScale) * 100);
      setArZoomPct(pct);
      clearTimeout(arZoomTimerRef.current);
      arZoomTimerRef.current = setTimeout(() => setArZoomPct(null), 1500);
    });
    observer.observe(el, { attributes: true, attributeFilter: ['scale'] });

    el.addEventListener('load', onLoad);
    el.addEventListener('camera-change', onCameraChange);
    el.addEventListener('progress', onProgress);
    el.addEventListener('ar-status', onArStatus);
    el.addEventListener('error', onError);
    return () => {
      observer.disconnect();
      el.removeEventListener('load', onLoad);
      el.removeEventListener('camera-change', onCameraChange);
      el.removeEventListener('progress', onProgress);
      clearTimeout(zoomTimerRef.current);
      clearTimeout(arZoomTimerRef.current);
      el.removeEventListener('ar-status', onArStatus);
      el.removeEventListener('error', onError);
    };
  }, [src]);

  const scaleStep = (dir) => {
    const el = viewerRef.current;
    if (!el) return;
    const cur = parseFloat((el.getAttribute('scale') || '0.3 0.3 0.3').split(' ')[0]);
    const next = dir === 'in'
      ? Math.min(+(cur * 1.3).toFixed(3), 1.5)
      : Math.max(+(cur * 0.77).toFixed(3), 0.05);
    el.setAttribute('scale', `${next} ${next} ${next}`);
    setScaleVal(next);
  };

  const handleArTap = async () => {
    const el = viewerRef.current;
    if (!el) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    // --- Quick early rejection ---
    if (isIOS) {
      if (!src.usdz || !el.canActivateAR) { setShowNoArModal(true); return; }
    } else {
      // model-viewer's own check — false = definitely not supported
      if (!el.canActivateAR) { setShowNoArModal(true); return; }
      // WebXR API check — some phones say true but ARCore is missing
      const xrSupported = await navigator.xr?.isSessionSupported('immersive-ar').catch(() => false) ?? false;
      if (!xrSupported) { setShowNoArModal(true); return; }
    }

    // --- Timeout fallback: if AR session doesn't start in 5s, show popup ---
    // Handles phones where activateAR() doesn't throw but silently does nothing
    const noStartTimer = setTimeout(() => {
      if (arStatusRef.current !== 'started' && arStatusRef.current !== 'placed') {
        setShowNoArModal(true);
      }
    }, 5000);

    try {
      await el.activateAR();
    } catch {
      clearTimeout(noStartTimer);
      setShowNoArModal(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: '#000' }}
      >
        {/* Header */}
        {!arActive && (
          <div className="flex items-center justify-between px-4 h-14 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(212,175,55,0.1)', background: '#000' }}>
            <div className="flex items-center gap-2">
              <Cuboid size={16} color="#C8A951" />
              <span className="text-white font-semibold text-sm truncate max-w-[200px]"
                style={{ fontFamily: 'var(--font-body)' }}>{dishName}</span>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* model-viewer — fills remaining space */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>

          {/* Loading spinner */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 pointer-events-none"
                style={{ background: '#000' }}>
                <div className="w-14 h-14 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }} />
                <div className="flex flex-col items-center gap-2 w-48">
                  <span className="text-gray-500 text-xs tracking-widest uppercase">
                    Loading 3D Model{progress > 0 ? ` ${progress}%` : '…'}
                  </span>
                  {progress > 0 && (
                    <div className="w-full h-1 rounded-full" style={{ background: 'rgba(212,175,55,0.15)' }}>
                      <div className="h-1 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, background: '#D4AF37' }} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pinch-to-zoom hint in 3D mode */}
          {arStatus === 'idle' && !loading && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none z-10">
              <span className="text-[10px] px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#999', fontFamily: 'var(--font-text)' }}>
                Pinch to zoom · Drag to rotate
              </span>
            </div>
          )}

          {/* OUTSIDE AR: zoom % badge at top of 3D viewer */}
          <AnimatePresence>
            {arStatus === 'idle' && zoomPct !== null && (
              <motion.div
                key="zoom-3d"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-10"
              >
                <span className="text-sm font-bold px-4 py-1.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.72)', color: '#D4AF37', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
                  {zoomPct}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* eslint-disable react/no-unknown-property */}
          <model-viewer
            ref={viewerRef}
            src={src.glb}
            {...(src.usdz ? { 'ios-src': src.usdz } : {})}
            alt={dishName}
            ar
            ar-modes="webxr quick-look"
            ar-scale="auto"
            ar-placement="floor"
            scale="0.3 0.3 0.3"
            camera-controls
            auto-rotate
            auto-rotate-delay="1500"
            rotation-per-second="10deg"
            loading="eager"
            reveal="auto"
            interaction-prompt="none"
            shadow-intensity="0"
            shadow-softness="0"
            exposure="1.1"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', background: '#000' }}
          />
          {/* eslint-enable react/no-unknown-property */}

          {/* Full-screen tap overlay — disappears only after real finger tap places the model */}
          {arStatus === 'started' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20"
              style={{ background: 'rgba(0,0,0,0.25)' }}>
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-4 w-full px-8"
              >
                {/* pulsing hand icon */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: 'rgba(212,175,55,0.35)' }} />
                  <div className="absolute inset-2 rounded-full animate-ping"
                    style={{ background: 'rgba(212,175,55,0.2)', animationDelay: '0.3s' }} />
                  <span className="text-4xl relative z-10">👆</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white text-lg font-bold text-center"
                    style={{ fontFamily: 'var(--font-body)', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                    Point at floor & tap to place
                  </span>
                  <span className="text-xs text-center"
                    style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-text)' }}>
                    Once placed the dish stays fixed on the floor
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Ingredients — collapsible */}
        {!arActive && ingredients?.length > 0 && (
          <div className="flex-shrink-0" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(212,175,55,0.12)' }}>
            <button
              onClick={() => setIngOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5"
            >
              <span className="text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: '#C8A951', fontFamily: 'var(--font-body)' }}>✦ Ingredients</span>
              {ingOpen ? <ChevronDown size={14} color="#C8A951" /> : <ChevronUp size={14} color="#C8A951" />}
            </button>
            <AnimatePresence>
              {ingOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden px-4 pb-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {ingredients.map(ing => (
                      <span key={ing} className="text-[11px] px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)', color: '#bbb', fontFamily: 'var(--font-text)' }}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Size adjust + AR Button */}
        {!arActive && (
          <div className="flex-shrink-0 px-4 pb-8 pt-3 flex flex-col gap-3"
            style={{ background: '#000', borderTop: '1px solid rgba(212,175,55,0.1)' }}>

            {/* Pre-AR size control */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] tracking-widest uppercase" style={{ color: '#C8A951', fontFamily: 'var(--font-body)' }}>
                Dish Size in AR
              </span>
              <div className="flex items-center gap-2">
                <button onPointerDown={() => scaleStep('out')}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl font-bold active:scale-90"
                  style={{ background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.3)' }}>−</button>
                <span className="text-xs w-8 text-center" style={{ color: '#888', fontFamily: 'var(--font-text)' }}>
                  {Math.round(scaleVal / 0.3 * 100)}%
                </span>
                <button onPointerDown={() => scaleStep('in')}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl font-bold active:scale-90"
                  style={{ background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.3)' }}>+</button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }} onClick={handleArTap}
              className="w-full py-4 rounded-2xl font-bold text-black text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#D4AF37 0%,#F0D060 50%,#A0842A 100%)', fontFamily: 'var(--font-body)' }}>
              <Cuboid size={18} />
              View in AR
            </motion.button>
            <p className="text-gray-600 text-[11px] text-center" style={{ fontFamily: 'var(--font-text)' }}>
              Set size above → point camera at the <span style={{ color: '#C8A951' }}>floor</span> to place
            </p>
          </div>
        )}
      </motion.div>



      {/* INSIDE AR: zoom % badge fixed over the AR camera feed */}
      <AnimatePresence>
        {arActive && arZoomPct !== null && (
          <motion.div
            key="zoom-ar"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="fixed top-8 left-0 right-0 flex justify-center pointer-events-none z-[999]"
          >
            <span className="text-base font-bold px-5 py-2 rounded-full"
              style={{ background: 'rgba(0,0,0,0.72)', color: '#D4AF37', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
              {arZoomPct}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNoArModal && <ArNotSupportedModal onClose={() => setShowNoArModal(false)} />}
      </AnimatePresence>
    </>
  );
}
