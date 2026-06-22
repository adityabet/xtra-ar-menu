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

  const arActive = arStatus === 'started' || arStatus === 'placed';

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onLoad     = () => { setLoading(false); setProgress(100); };
    const onProgress = (e) => setProgress(Math.round(e.detail.totalProgress * 100));
    const onArStatus = (e) => {
      const s = e.detail.status;
      if (s === 'session-started') {
        setArStatus('started');
        // Auto-place after 2s — by then ARCore has detected the floor
        setTimeout(() => {
          const mv = viewerRef.current;
          if (!mv) return;
          // Simulate a tap in the center of model-viewer to trigger placement
          const cx = mv.clientWidth / 2;
          const cy = mv.clientHeight * 0.75; // lower center = floor area
          mv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: cx, clientY: cy }));
          mv.dispatchEvent(new PointerEvent('pointerup',   { bubbles: true, clientX: cx, clientY: cy }));
          mv.dispatchEvent(new MouseEvent('click',         { bubbles: true, clientX: cx, clientY: cy }));
        }, 2000);
      }
      else if (s === 'object-placed') setArStatus('placed');
      else if (s === 'not-presenting') setArStatus('idle');
    };
    const onError   = () => setLoading(false);

    el.addEventListener('load', onLoad);
    el.addEventListener('progress', onProgress);
    el.addEventListener('ar-status', onArStatus);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('progress', onProgress);
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
    try {
      await el.activateAR();
    } catch {
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
            shadow-intensity="0.2"
            shadow-softness="0.5"
            exposure="1.1"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', background: '#000' }}
          />
          {/* eslint-enable react/no-unknown-property */}

          {/* Overlay before placement */}
          {arStatus === 'started' && (
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 pointer-events-none z-20">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-40"
                    style={{ background: 'rgba(200,169,81,0.4)' }} />
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(200,169,81,0.85)' }}>
                    <span className="text-black text-xl">📍</span>
                  </div>
                </div>
                <span className="text-white font-semibold text-sm px-5 py-2 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.72)', fontFamily: 'var(--font-body)' }}>
                  Point camera at floor — placing in 2s…
                </span>
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

      <AnimatePresence>
        {showNoArModal && <ArNotSupportedModal onClose={() => setShowNoArModal(false)} />}
      </AnimatePresence>
    </>
  );
}
