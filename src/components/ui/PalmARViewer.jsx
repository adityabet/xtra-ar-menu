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
          <Cuboid size={16} color="#A93A46" />
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
              style={{ borderColor: 'rgba(169,58,70,0.2)', borderTopColor: '#A93A46' }} />
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
            style={{ background: 'rgba(169,58,70,0.2)', color: '#A93A46', border: '1px solid rgba(169,58,70,0.3)' }}>
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
            {/* Professional palm SVG */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Palm base */}
                <path d="M18 58 C16 48 15 38 15 30 C15 24 19 20 24 20 C27 20 30 22 31 26 L31 44" stroke="#A93A46" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Index finger */}
                <path d="M31 44 L31 18 C31 13 35 10 39 10 C43 10 46 13 46 18 L46 44" stroke="#A93A46" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Middle finger */}
                <path d="M46 44 L46 14 C46 9 50 6 54 6 C58 6 61 9 61 14 L61 44" stroke="#A93A46" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Ring finger */}
                <path d="M61 44 L61 18 C61 13 65 10 69 10 C73 10 76 13 76 18 L76 44" stroke="#A93A46" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Pinky */}
                <path d="M76 44 L76 26 C76 21 79 18 82 18 C85 18 88 21 88 26 L88 52 C88 62 82 70 74 72" stroke="#A93A46" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Palm body */}
                <path d="M15 58 C14 68 16 76 22 82 L34 92 C38 96 44 98 50 98 C62 98 74 90 76 78 L76 72 C68 76 58 78 48 76 C34 74 20 66 15 58 Z" stroke="#A93A46" strokeWidth="2.5" fill="rgba(169,58,70,0.08)" strokeLinejoin="round"/>
                {/* Wrist lines */}
                <path d="M28 96 C34 102 42 106 50 106" stroke="#A93A46" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                <path d="M24 100 C30 106 40 110 50 110" stroke="#A93A46" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                {/* Palm center glow dot */}
                <circle cx="46" cy="72" r="3" fill="#A93A46" opacity="0.6"/>
                <circle cx="46" cy="72" r="6" fill="#A93A46" opacity="0.15"/>
              </svg>
            </motion.div>

            {/* Scanning ring */}
            <div className="relative w-40 h-40 -mt-4 pointer-events-none">
              <div className="absolute inset-0 rounded-full border-2 animate-ping"
                style={{ borderColor: 'rgba(169,58,70,0.4)' }} />
              <div className="absolute inset-4 rounded-full border animate-ping"
                style={{ borderColor: 'rgba(169,58,70,0.3)', animationDelay: '0.4s' }} />
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
              border: '1.5px solid rgba(169,58,70,0.35)',
              boxShadow: '0 0 20px rgba(169,58,70,0.15)',
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
