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
        style={{ background: '#111', border: '1px solid rgba(169,58,70,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(169,58,70,0.10)', border: '1px solid rgba(169,58,70,0.25)' }}>
          <Smartphone size={30} color="#A93A46" />
        </div>
        <h2 className="text-white text-lg font-bold text-center mb-1" style={{ fontFamily: 'var(--font-body)' }}>
          AR Not Supported
        </h2>
        <p className="text-center text-xs mb-5" style={{ color: '#6B6B6B', fontFamily: 'var(--font-text)' }}>
          Your device doesn't support AR. You can still view the 3D model above.
        </p>
        <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#A93A46' }}>🤖 Android</p>
            {[
              [<Smartphone size={11} />, 'Android 8.0+'],
              [<Cpu size={11} />, 'ARCore device (Snapdragon 660+ / Dimensity 700+)'],
              [<MemoryStick size={11} />, '3 GB RAM minimum'],
              [<Globe size={11} />, 'Chrome on HTTPS'],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-2 mb-1">
                <span style={{ color: '#A93A46', marginTop: 1 }}>{icon}</span>
                <span className="text-xs" style={{ color: '#888', fontFamily: 'var(--font-text)' }}>{text}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#A93A46' }}> iOS</p>
            {[
              [<Smartphone size={11} />, 'iPhone 6s or later'],
              [<Cpu size={11} />, 'A9 chip (ARKit)'],
              [<Globe size={11} />, 'Safari on HTTPS'],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-start gap-2 mb-1">
                <span style={{ color: '#A93A46', marginTop: 1 }}>{icon}</span>
                <span className="text-xs" style={{ color: '#888', fontFamily: 'var(--font-text)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: 'rgba(169,58,70,0.12)', border: '1px solid rgba(169,58,70,0.25)', color: '#A93A46', fontFamily: 'var(--font-body)' }}>
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Safari Required Modal (iOS Chrome) ───────────────────────────────────────
function SafariRequiredModal({ onClose }) {
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
        style={{ background: '#111', border: '1px solid rgba(169,58,70,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(169,58,70,0.10)', border: '1px solid rgba(169,58,70,0.25)' }}>
          <span className="text-4xl">🧭</span>
        </div>
        <h2 className="text-white text-lg font-bold text-center mb-1" style={{ fontFamily: 'var(--font-body)' }}>
          Open in Safari
        </h2>
        <p className="text-center text-sm mb-5" style={{ color: '#999', fontFamily: 'var(--font-text)', lineHeight: 1.6 }}>
          AR on iPhone only works in <span style={{ color: '#A93A46', fontWeight: 600 }}>Safari</span>.{'\n'}
          Please open this page in Safari to view dishes in AR.
        </p>
        <div className="rounded-2xl px-4 py-3 mb-4 flex items-start gap-3"
          style={{ background: 'rgba(169,58,70,0.08)', border: '1px solid rgba(169,58,70,0.2)' }}>
          <span className="text-xl mt-0.5">💡</span>
          <span className="text-xs" style={{ color: '#aaa', fontFamily: 'var(--font-text)', lineHeight: 1.6 }}>
            Tap the <span style={{ color: '#A93A46' }}>Share button</span> in your browser → select{' '}
            <span style={{ color: '#A93A46' }}>"Open in Safari"</span>
          </span>
        </div>
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl text-sm font-semibold"
          style={{ background: 'rgba(169,58,70,0.12)', border: '1px solid rgba(169,58,70,0.25)', color: '#A93A46', fontFamily: 'var(--font-body)' }}>
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main ARViewer ──────────────────────────────────────────────────────────────
export default function ARViewer({ src, dishName, ingredients, onClose }) {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady]   = useState(() => !!customElements.get('model-viewer'));
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [arStatus, setArStatus]         = useState('idle'); // idle | started | placed
  const [showNoArModal, setShowNoArModal]     = useState(false);
  const [showSafariModal, setShowSafariModal] = useState(false);
  const [ingOpen, setIngOpen]           = useState(true);
  const [scaleVal, setScaleVal]         = useState(0.3);
  const [zoomPct, setZoomPct]           = useState(null); // null = hidden
  const [arZoomPct, setArZoomPct]       = useState(null);
  const defaultFovRef                   = useRef(null);
  const zoomTimerRef                    = useRef(null);
  const arZoomTimerRef                  = useRef(null);
  const arStatusRef                     = useRef('idle');
  const arPinchRef                      = useRef(null); // { dist, basePct }

  const arActive = arStatus === 'started' || arStatus === 'placed';

  // Wait for model-viewer web component before mounting (script loads async on mobile)
  useEffect(() => {
    if (viewerReady) return;
    customElements.whenDefined('model-viewer').then(() => setViewerReady(true));
  }, [viewerReady]);

  // Detect pinch in AR via window touch events (WebXR dom-overlay still fires these)
  useEffect(() => {
    if (!arActive) return;

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        arPinchRef.current = {
          dist: Math.hypot(dx, dy),
          basePct: arZoomPct ?? 100,
        };
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length !== 2 || !arPinchRef.current) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / arPinchRef.current.dist;
      const pct = Math.round(Math.min(Math.max(arPinchRef.current.basePct * ratio, 20), 300));
      setArZoomPct(pct);
      clearTimeout(arZoomTimerRef.current);
      arZoomTimerRef.current = setTimeout(() => setArZoomPct(null), 1500);
    };
    const onTouchEnd = () => { arPinchRef.current = null; };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
    };
  }, [arActive, arZoomPct]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !viewerReady) return;

    const onLoad = () => {
      loaded = true;
      clearTimeout(loadTimeout);
      clearTimeout(errorTimer);
      setLoading(false);
      setLoadError(false);
      setProgress(100);
      defaultFovRef.current = el.getFieldOfView?.() ?? null;
    };
    const onCameraChange = () => {
      // Block during AR — pinch in AR must NOT affect outside 3D model zoom
      if (arStatusRef.current !== 'idle') return;
      if (!defaultFovRef.current) return;
      const fov = el.getFieldOfView?.();
      if (!fov) return;
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
      }
      else if (s === 'object-placed') {
        arStatusRef.current = 'placed';
        setArStatus('placed');
        setTimeout(() => {
          try {
            const mv = viewerRef.current;

            // ── Step 1: Cancel hit-test source so ARCore stops recalculating ──
            const arRenderers = [
              mv?._renderer?.arRenderer,
              mv?._arRenderer,
              mv?.renderer?.arRenderer,
            ];
            for (const ar of arRenderers) {
              if (!ar) continue;
              try { ar._hitTestSource?.cancel(); ar._hitTestSource = null; } catch (_) {}
              try { ar._hitTestSourceForTransientInput?.cancel(); ar._hitTestSourceForTransientInput = null; } catch (_) {}
            }

            // ── Step 2: Get the Three.js scene and record EXACT placed position ──
            const modelScene =
              mv?.model?.scene ??
              mv?._model?.scene ??
              mv?.scene?.children?.[0];

            if (modelScene) {
              // Force a matrix update to capture the true placed position
              modelScene.updateMatrixWorld(true);

              const lockedPos   = modelScene.position.clone();
              const lockedQuat  = modelScene.quaternion.clone();
              const lockedScale = modelScene.scale.clone();

              // Freeze matrix so model-viewer stops overwriting it
              modelScene.matrixAutoUpdate = false;
              modelScene.updateMatrix();

              // ── Step 3: Hard-lock loop — force position back every frame ──
              // This eliminates 100% of residual ARCore drift jitter
              let lockRaf;
              const lock = () => {
                if (arStatusRef.current !== 'placed') { cancelAnimationFrame(lockRaf); return; }
                modelScene.position.copy(lockedPos);
                modelScene.quaternion.copy(lockedQuat);
                modelScene.scale.copy(lockedScale);
                modelScene.updateMatrix();
                lockRaf = requestAnimationFrame(lock);
              };
              lockRaf = requestAnimationFrame(lock);
            }
          } catch (_) {}
        }, 350);
      }
      else if (s === 'not-presenting') setArStatus('idle');
    };
    let loaded = false;
    let errorTimer = null;
    // Defer error UI by 3s — if load fires in between, error is ignored
    // This handles non-fatal texture errors that fire before the load event
    const onError = () => {
      if (!loaded) {
        clearTimeout(errorTimer);
        errorTimer = setTimeout(() => {
          if (!loaded) { setLoading(false); setLoadError(true); }
        }, 3000);
      }
    };

    // 60s hard timeout for truly broken networks
    const loadTimeout = setTimeout(() => {
      if (!loaded) { setLoading(false); setLoadError(true); }
    }, 60000);

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

    // Preloaded/cached models can finish before listeners attach (common on mobile)
    if (el.loaded) onLoad();

    return () => {
      clearTimeout(loadTimeout);
      clearTimeout(errorTimer);
      observer.disconnect();
      el.removeEventListener('load', onLoad);
      el.removeEventListener('camera-change', onCameraChange);
      el.removeEventListener('progress', onProgress);
      clearTimeout(zoomTimerRef.current);
      clearTimeout(arZoomTimerRef.current);
      el.removeEventListener('ar-status', onArStatus);
      el.removeEventListener('error', onError);
    };
  }, [src, viewerReady]);

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

    const isIOS    = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // iPhone on Chrome/Firefox — Quick Look only works in Safari
    if (isIOS && !isSafari) { setShowSafariModal(true); return; }

    if (!el.canActivateAR) { setShowNoArModal(true); return; }
    if (isIOS && !src.usdz)  { setShowNoArModal(true); return; }

    // iOS Quick Look operates outside the browser — it never fires
    // model-viewer ar-status events, so a timeout-based fallback would
    // falsely trigger "AR Not Supported" while Quick Look is active.
    // Only set the safety timer on Android (WebXR fires ar-status events).
    let noStartTimer = null;
    if (!isIOS) {
      noStartTimer = setTimeout(() => {
        if (arStatusRef.current !== 'started' && arStatusRef.current !== 'placed') {
          setShowNoArModal(true);
        }
      }, 8000);
    }

    try {
      await el.activateAR();
    } catch {
      if (noStartTimer) clearTimeout(noStartTimer);
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
            style={{ borderBottom: '1px solid rgba(169,58,70,0.1)', background: '#000' }}>
            <div className="flex items-center gap-2">
              <Cuboid size={16} color="#A93A46" />
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

          {/* Loading spinner / error */}
          <AnimatePresence>
            {(loading || loadError) && (
              <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
                style={{ background: '#000', pointerEvents: loadError ? 'auto' : 'none' }}>
                {loadError ? (
                  <>
                    <span style={{ fontSize: '2rem' }}>☕</span>
                    <span className="text-xs tracking-widest uppercase" style={{ color: '#666', fontFamily: 'var(--font-text)' }}>
                      Failed to load 3D model
                    </span>
                    <button
                      onClick={() => {
                        const el = viewerRef.current;
                        if (el) {
                          const s = src.glb;
                          el.src = '';
                          requestAnimationFrame(() => { el.src = s; });
                        }
                        setLoadError(false);
                        setLoading(true);
                        setProgress(0);
                      }}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(169,58,70,0.12)', border: '1px solid rgba(169,58,70,0.3)', color: '#A93A46', fontFamily: 'var(--font-body)' }}
                    >
                      Retry
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'rgba(169,58,70,0.2)', borderTopColor: '#C4555F' }} />
                    <div className="flex flex-col items-center gap-2 w-48">
                      <span className="text-gray-500 text-xs tracking-widest uppercase">
                        Loading 3D Model{progress > 0 ? ` ${progress}%` : '…'}
                      </span>
                      {progress > 0 && (
                        <div className="w-full h-1 rounded-full" style={{ background: 'rgba(169,58,70,0.15)' }}>
                          <div className="h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%`, background: '#C4555F' }} />
                        </div>
                      )}
                    </div>
                  </>
                )}
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
                  style={{ background: 'rgba(0,0,0,0.72)', color: '#C4555F', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
                  {zoomPct}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* eslint-disable react/no-unknown-property */}
          {viewerReady && (
          <model-viewer
            ref={viewerRef}
            src={src.glb}
            crossorigin="anonymous"
            {...(src.usdz ? { 'ios-src': src.usdz } : {})}
            alt={dishName}
            ar
            ar-modes="webxr"
            ar-scale="fixed"
            ar-placement="floor"
            xr-environment
            camera-controls
            auto-rotate
            auto-rotate-delay="1500"
            rotation-per-second="10deg"
            loading="eager"
            reveal="auto"
            interaction-prompt="none"
            shadow-intensity="0.3"
            shadow-softness="0.5"
            exposure="1"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', background: '#000' }}
          >
            {/* AR-only zoom % hotspot — centered on model, faces camera */}
            {arActive && arZoomPct !== null && (
              <div
                slot="hotspot-ar-zoom"
                data-position="0m 0m 0m"
                data-normal="0m 0m 1m"
                style={{
                  background: 'rgba(0,0,0,0.75)',
                  color: '#C4555F',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: '15px',
                  letterSpacing: '0.05em',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  border: '1px solid rgba(169,58,70,0.4)',
                }}
              >
                {arZoomPct}%
              </div>
            )}
          </model-viewer>
          )}
          {/* eslint-enable react/no-unknown-property */}

          {/* Lock overlay after placement — absorbs single-finger drags so model stays fixed */}
          {arStatus === 'placed' && (
            <div
              className="absolute inset-0 z-10"
              style={{ background: 'transparent' }}
              onTouchStart={(e) => { if (e.touches.length === 1) e.stopPropagation(); }}
              onTouchMove={(e)  => { if (e.touches.length === 1) e.stopPropagation(); }}
            />
          )}

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
                    style={{ background: 'rgba(169,58,70,0.35)' }} />
                  <div className="absolute inset-2 rounded-full animate-ping"
                    style={{ background: 'rgba(169,58,70,0.2)', animationDelay: '0.3s' }} />
                  <span className="text-4xl relative z-10">👆</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white text-lg font-bold text-center"
                    style={{ fontFamily: 'var(--font-body)', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                    Point at table surface
                  </span>
                  <span className="text-xs text-center"
                    style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-text)' }}>
                    Wait for the ring to appear on the table, then tap
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Ingredients — collapsible */}
        {!arActive && ingredients?.length > 0 && (
          <div className="flex-shrink-0" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(169,58,70,0.12)' }}>
            <button
              onClick={() => setIngOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5"
            >
              <span className="text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: '#A93A46', fontFamily: 'var(--font-body)' }}>✦ Ingredients</span>
              {ingOpen ? <ChevronDown size={14} color="#A93A46" /> : <ChevronUp size={14} color="#A93A46" />}
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
                        style={{ background: 'rgba(169,58,70,0.1)', border: '1px solid rgba(169,58,70,0.22)', color: '#bbb', fontFamily: 'var(--font-text)' }}>
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
            style={{ background: '#000', borderTop: '1px solid rgba(169,58,70,0.1)' }}>

            {/* Pre-AR size control */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] tracking-widest uppercase" style={{ color: '#A93A46', fontFamily: 'var(--font-body)' }}>
                Dish Size in AR
              </span>
              <div className="flex items-center gap-2">
                <button onPointerDown={() => scaleStep('out')}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl font-bold active:scale-90"
                  style={{ background: 'rgba(169,58,70,0.12)', border: '1px solid rgba(169,58,70,0.3)' }}>−</button>
                <span className="text-xs w-8 text-center" style={{ color: '#888', fontFamily: 'var(--font-text)' }}>
                  {Math.round(scaleVal / 0.3 * 100)}%
                </span>
                <button onPointerDown={() => scaleStep('in')}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xl font-bold active:scale-90"
                  style={{ background: 'rgba(169,58,70,0.12)', border: '1px solid rgba(169,58,70,0.3)' }}>+</button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }} onClick={handleArTap}
              className="w-full py-4 rounded-2xl font-bold text-black text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#C4555F 0%,#C4555F 50%,#8B2635 100%)', fontFamily: 'var(--font-body)' }}>
              <Cuboid size={18} />
              View in AR
            </motion.button>
            <p className="text-gray-600 text-[11px] text-center" style={{ fontFamily: 'var(--font-text)' }}>
              Set size above → point camera at the <span style={{ color: '#A93A46' }}>floor</span> to place
            </p>
          </div>
        )}
      </motion.div>



      <AnimatePresence>
        {showNoArModal && <ArNotSupportedModal onClose={() => setShowNoArModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSafariModal && <SafariRequiredModal onClose={() => setShowSafariModal(false)} />}
      </AnimatePresence>
    </>
  );
}
