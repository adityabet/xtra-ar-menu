import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cuboid } from 'lucide-react';

export default function PalmARViewer({ src, dishName, onClose }) {
  const videoRef      = useRef(null);
  const modelRef      = useRef(null);
  const handsRef      = useRef(null);
  const rafRef        = useRef(null);
  const streamRef     = useRef(null);

  const [stage, setStage]           = useState('loading'); // loading | ready | detecting | placed
  const [palmPos, setPalmPos]       = useState(null);      // { x, y, size }
  const [mpReady, setMpReady]       = useState(false);
  const [camError, setCamError]     = useState(false);

  // ── Load MediaPipe scripts once ─────────────────────────────────────────────
  useEffect(() => {
    if (window.__mpHandsLoaded) { setMpReady(true); return; }
    const load = (url) => new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = url; s.crossOrigin = 'anonymous';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    Promise.all([
      load('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js'),
      load('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.js'),
    ]).then(() => { window.__mpHandsLoaded = true; setMpReady(true); })
      .catch(() => setCamError(true));
  }, []);

  // ── Start camera ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mpReady) return;
    const video = videoRef.current;
    if (!video) return;

    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' }, // back camera
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    }).then((stream) => {
      streamRef.current = stream;
      video.srcObject = stream;
      video.play().then(() => setStage('ready'));
    }).catch(() => setCamError(true));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, [mpReady]);

  // ── Init MediaPipe Hands ────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'ready') return;
    const video = videoRef.current;
    if (!video || !window.Hands) return;

    const hands = new window.Hands({
      locateFile: (f) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${f}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,          // lite model — fast on low-end phones
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (!results.multiHandLandmarks?.length) {
        setPalmPos(null);
        setStage('detecting');
        return;
      }

      const lm = results.multiHandLandmarks[0];
      const W = window.innerWidth;
      const H = window.innerHeight;

      // Palm center = avg of wrist(0) + 4 knuckles(5,9,13,17)
      const pts = [0, 5, 9, 13, 17];
      // Back camera is NOT mirrored — use x directly
      const cx = pts.reduce((s, i) => s + lm[i].x, 0) / pts.length * W;
      const cy = pts.reduce((s, i) => s + lm[i].y, 0) / pts.length * H;

      // Palm size = wrist → middle knuckle distance in px
      const dx = (lm[9].x - lm[0].x) * W;
      const dy = (lm[9].y - lm[0].y) * H;
      const palmSize = Math.hypot(dx, dy);

      setPalmPos({ x: cx, y: cy, size: palmSize });
      setStage('placed');
    });

    handsRef.current = hands;

    // Frame loop
    const tick = async () => {
      if (video.readyState >= 2) {
        try { await hands.send({ image: video }); } catch (_) {}
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    setStage('detecting');
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      try { hands.close(); } catch (_) {}
    };
  }, [stage === 'ready']); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Model size: scale model-viewer box based on palm size ──────────────────
  const modelSize = palmPos ? Math.max(120, Math.min(320, palmPos.size * 2.2)) : 180;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* ── Live camera feed ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline muted autoPlay
        style={{ objectPosition: 'center' }}
      />

      {/* ── Dark gradient overlay at top/bottom ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.4) 100%)' }} />

      {/* ── Header ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 h-14 z-20">
        <div className="flex items-center gap-2">
          <Cuboid size={16} color="#C8A951" />
          <span className="text-white font-semibold text-sm truncate max-w-[200px]"
            style={{ fontFamily: 'var(--font-body)' }}>{dishName}</span>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <X size={18} color="white" />
        </button>
      </div>

      {/* ── Loading state ── */}
      <AnimatePresence>
        {(stage === 'loading' || !mpReady) && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4"
            style={{ background: '#000' }}>
            <div className="w-12 h-12 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(200,169,81,0.2)', borderTopColor: '#C8A951' }} />
            <span className="text-white text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              Starting camera…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Camera error ── */}
      {camError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-8">
          <span className="text-5xl">📷</span>
          <p className="text-white text-center text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Camera access denied. Please allow camera and reload.
          </p>
          <button onClick={onClose}
            className="px-6 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(200,169,81,0.2)', color: '#C8A951', border: '1px solid rgba(200,169,81,0.3)' }}>
            Close
          </button>
        </div>
      )}

      {/* ── Show palm instruction ── */}
      <AnimatePresence>
        {stage === 'detecting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 pointer-events-none"
          >
            {/* Animated hand icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl"
            >
              ✋
            </motion.div>

            {/* Scanning ring */}
            <div className="relative w-40 h-40 -mt-4 pointer-events-none">
              <div className="absolute inset-0 rounded-full border-2 animate-ping"
                style={{ borderColor: 'rgba(200,169,81,0.4)' }} />
              <div className="absolute inset-4 rounded-full border animate-ping"
                style={{ borderColor: 'rgba(200,169,81,0.3)', animationDelay: '0.4s' }} />
            </div>

            <div className="flex flex-col items-center gap-1 -mt-6">
              <span className="text-white text-lg font-bold"
                style={{ fontFamily: 'var(--font-body)', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                Show your palm
              </span>
              <span className="text-xs text-center px-8"
                style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-text)' }}>
                Hold your open palm in front of the camera
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3D model on palm ── */}
      <AnimatePresence>
        {stage === 'placed' && palmPos && (
          <motion.div
            key="model"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute pointer-events-none"
            style={{
              left: palmPos.x,
              // Place model ABOVE the palm center (dish sits on palm)
              top: palmPos.y - modelSize * 0.9,
              width: modelSize,
              height: modelSize,
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
            }}
          >
            {/* Realistic shadow/plate under the dish */}
            <div className="absolute bottom-0 left-1/2 pointer-events-none"
              style={{
                transform: 'translateX(-50%)',
                width: '70%',
                height: '12px',
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(3px)',
              }}
            />

            {/* eslint-disable react/no-unknown-property */}
            <model-viewer
              ref={modelRef}
              src={src.glb}
              alt={dishName}
              shadow-intensity="1.2"
              shadow-softness="0.8"
              exposure="1.5"
              environment-image="neutral"
              interaction-prompt="none"
              loading="eager"
              reveal="auto"
              camera-orbit="0deg 75deg 105%"
              style={{
                width: '100%',
                height: '100%',
                background: 'transparent',
                '--progress-bar-color': 'transparent',
              }}
            />
            {/* eslint-enable react/no-unknown-property */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Palm detected — subtle glow ring at palm center ── */}
      <AnimatePresence>
        {stage === 'placed' && palmPos && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute pointer-events-none z-10 rounded-full"
            style={{
              left: palmPos.x,
              top: palmPos.y,
              width: palmPos.size * 1.6,
              height: palmPos.size * 1.2,
              transform: 'translate(-50%, -50%)',
              border: '1.5px solid rgba(200,169,81,0.35)',
              boxShadow: '0 0 20px rgba(200,169,81,0.15)',
              borderRadius: '50%',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Bottom hint ── */}
      {stage === 'placed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-10 left-0 right-0 flex justify-center z-20 pointer-events-none"
        >
          <span className="text-xs px-4 py-2 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.6)',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'var(--font-text)',
              backdropFilter: 'blur(8px)',
            }}>
            Move your palm to reposition the dish
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
