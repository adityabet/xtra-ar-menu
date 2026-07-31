import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cuboid, Lock } from 'lucide-react';

export default function GyroARViewer({ src, dishName, onClose }) {
  const videoRef   = useRef(null);
  const modelRef   = useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const gyroRef    = useRef({ beta: 65, gamma: 0 });
  const smoothRef  = useRef({ beta: 65, gamma: 0 });
  const lockedRef  = useRef(null); // { beta, gamma, x, y, size }

  const [stage, setStage]         = useState('loading');   // loading | gyro-prompt | scanning | locked | error
  const [modelPos, setModelPos]   = useState({ x: 0, y: 0, size: 200 });
  const [modelReady, setModelReady] = useState(false);

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // ── Position formula ────────────────────────────────────────────────────────
  // beta: 0 = flat (ceiling), 90 = vertical (horizon)
  // Typical "look at table" angle: 55–80°
  const calcPos = (beta, gamma) => {
    const b = Math.max(25, Math.min(88, beta));
    const t = (b - 25) / 63;                         // 0→1 as tilt increases
    const y = H() * 0.28 + t * H() * 0.50;          // moves down screen as phone tilts
    const x = W() / 2 - (gamma || 0) * 2.5;         // side tilt shifts left/right
    const size = 150 + t * 160;                      // 150–310px
    return { x, y, size };
  };

  const ema = (cur, tgt, a = 0.10) => cur + a * (tgt - cur);

  // ── Start back camera ───────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    }).then((stream) => {
      streamRef.current = stream;
      video.srcObject = stream;
      video.play().then(() => {
        // iOS 13+ needs explicit permission for DeviceOrientation
        if (
          typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function'
        ) {
          setStage('gyro-prompt');
        } else {
          setStage('scanning');
        }
      });
    }).catch(() => setStage('error'));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Gyroscope + animation loop ──────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'scanning' && stage !== 'locked') return;

    const onOrientation = (e) => {
      if (e.beta == null) return;
      gyroRef.current = { beta: e.beta, gamma: e.gamma ?? 0 };
    };
    window.addEventListener('deviceorientation', onOrientation, true);

    const tick = () => {
      const g = gyroRef.current;
      const s = smoothRef.current;
      s.beta  = ema(s.beta,  g.beta);
      s.gamma = ema(s.gamma, g.gamma);

      if (stage === 'scanning') {
        setModelPos(calcPos(s.beta, s.gamma));
      } else if (stage === 'locked' && lockedRef.current) {
        // Subtle parallax — model shifts slightly as phone moves, sells depth
        const db = (s.beta  - lockedRef.current.beta)  * 2.5;
        const dg = (s.gamma - lockedRef.current.gamma) * 3.0;
        setModelPos({
          x:    lockedRef.current.x - dg,
          y:    lockedRef.current.y + db,
          size: lockedRef.current.size,
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('deviceorientation', onOrientation, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [stage]);

  // ── model-viewer load event ─────────────────────────────────────────────────
  useEffect(() => {
    if (stage === 'loading' || stage === 'error' || stage === 'gyro-prompt') return;
    const mv = modelRef.current;
    if (!mv) return;
    const onLoad = () => setModelReady(true);
    mv.addEventListener('load', onLoad);
    if (mv.loaded) setModelReady(true);
    return () => mv.removeEventListener('load', onLoad);
  }, [stage]);

  // ── iOS gyro permission ─────────────────────────────────────────────────────
  const requestGyro = async () => {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === 'granted' || res !== 'denied') setStage('scanning');
      else setStage('scanning'); // proceed anyway, model uses default angle
    } catch {
      setStage('scanning');
    }
  };

  // ── Tap to lock ─────────────────────────────────────────────────────────────
  const handleTap = () => {
    if (stage !== 'scanning') return;
    const s = smoothRef.current;
    const pos = calcPos(s.beta, s.gamma);
    lockedRef.current = { ...pos, beta: s.beta, gamma: s.gamma };
    setStage('locked');
  };

  // Unlock — tap again to re-position
  const handleUnlock = () => {
    lockedRef.current = null;
    setStage('scanning');
  };

  // Default model position on scan start
  useEffect(() => {
    if (stage === 'scanning') setModelPos(calcPos(65, 0));
  }, [stage]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* ── Camera feed ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline muted autoPlay
      />

      {/* ── Vignette ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.52) 0%, transparent 20%, transparent 74%, rgba(0,0,0,0.42) 100%)',
      }} />

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

      {/* ── Loading ── */}
      <AnimatePresence>
        {stage === 'loading' && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4"
            style={{ background: '#000' }}>
            <div className="w-12 h-12 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(169,58,70,0.2)', borderTopColor: '#A93A46' }} />
            <span className="text-white text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              Starting camera…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS gyro permission ── */}
      <AnimatePresence>
        {stage === 'gyro-prompt' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 px-8">
            <span className="text-6xl">📱</span>
            <div className="flex flex-col items-center gap-2">
              <span className="text-white font-bold text-lg text-center"
                style={{ fontFamily: 'var(--font-body)' }}>Enable Motion Sensor</span>
              <span className="text-xs text-center"
                style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-text)' }}>
                Needed to place the dish on your table
              </span>
            </div>
            <button onClick={requestGyro}
              className="px-8 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#A93A46,#C4555F)', color: '#FFFFFF', fontFamily: 'var(--font-body)' }}>
              Allow Access
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Camera error ── */}
      {stage === 'error' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-8">
          <span className="text-5xl">📷</span>
          <p className="text-white text-center text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Camera access denied. Please allow camera and reload.
          </p>
          <button onClick={onClose} className="px-6 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(169,58,70,0.2)', color: '#A93A46', border: '1px solid rgba(169,58,70,0.3)' }}>
            Close
          </button>
        </div>
      )}

      {/* ── 3D model ── */}
      <AnimatePresence>
        {(stage === 'scanning' || stage === 'locked') && (
          <motion.div
            key="model"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="absolute pointer-events-none"
            style={{
              left: modelPos.x,
              top:  modelPos.y,
              width:  modelPos.size,
              height: modelPos.size,
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
            }}
          >
            {/* Elliptical ground shadow — sells "on surface" illusion */}
            <div className="absolute pointer-events-none" style={{
              bottom: '1%',
              left: '8%', right: '8%',
              height: '16px',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.62) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(5px)',
            }} />

            {/* eslint-disable react/no-unknown-property */}
            <model-viewer
              ref={modelRef}
              src={src.glb}
              alt={dishName}
              shadow-intensity="1.3"
              shadow-softness="0.75"
              exposure="1.5"
              environment-image="neutral"
              interaction-prompt="none"
              loading="eager"
              reveal="auto"
              camera-orbit="0deg 68deg 105%"
              style={{
                width: '100%', height: '100%',
                background: 'transparent',
                '--progress-bar-color': 'transparent',
              }}
            />
            {/* eslint-enable react/no-unknown-property */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Model loading spinner ── */}
      <AnimatePresence>
        {(stage === 'scanning' || stage === 'locked') && !modelReady && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(169,58,70,0.2)', borderTopColor: '#A93A46' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scanning: full-screen tap area + instruction ── */}
      <AnimatePresence>
        {stage === 'scanning' && modelReady && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
            onClick={handleTap}
          >
            {/* Scanning ring around model */}
            <motion.div
              className="absolute pointer-events-none"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                left: modelPos.x,
                top:  modelPos.y,
                width: modelPos.size * 1.25,
                height: modelPos.size * 0.35,
                transform: 'translate(-50%, 30%)',
                border: '1.5px solid rgba(169,58,70,0.55)',
                borderRadius: '50%',
              }}
            />

            {/* Instruction pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
            >
              <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(169,58,70,0.25)' }}>
                <span className="text-white text-sm font-bold"
                  style={{ fontFamily: 'var(--font-body)', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  Tilt phone at your table, then tap
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-text)' }}>
                  Dish will lock to the surface
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Locked: bottom bar + tap-again to reposition ── */}
      <AnimatePresence>
        {stage === 'locked' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-10 left-0 right-0 flex justify-center z-20"
          >
            <button
              onClick={handleUnlock}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(169,58,70,0.35)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Lock size={13} color="#A93A46" />
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-text)' }}>
                Placed on table · Tap to reposition
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Corner AR markers ── */}
      {(stage === 'scanning' || stage === 'locked') && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[
            { top: 20, left: 20, rotate: 0 },
            { top: 20, right: 20, rotate: 90 },
            { bottom: 20, right: 20, rotate: 180 },
            { bottom: 20, left: 20, rotate: 270 },
          ].map((pos, i) => (
            <div key={i} className="absolute" style={{
              ...pos, width: 26, height: 26,
              transform: `rotate(${pos.rotate}deg)`,
              borderTop: '2px solid rgba(169,58,70,0.55)',
              borderLeft: '2px solid rgba(169,58,70,0.55)',
              borderRadius: '2px 0 0 0',
            }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
