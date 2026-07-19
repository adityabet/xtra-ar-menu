import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cuboid, Info, ChevronRight } from 'lucide-react';

// Ingredient label positions arranged in a circle around the dish
const LABEL_ANGLES = [320, 40, 100, 160, 220, 270];

function IngredientLabel({ name, index, total, modelSize }) {
  const angle = LABEL_ANGLES[index % LABEL_ANGLES.length];
  const rad = (angle * Math.PI) / 180;
  const radius = modelSize * 0.72;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
        zIndex: 20,
      }}
    >
      {/* Connector line */}
      <svg
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          width: Math.abs(x) + 8,
          height: Math.abs(y) + 8,
          transform: `translate(${x > 0 ? '-' : ''}${Math.abs(x / 2)}px, ${y > 0 ? '-' : ''}${Math.abs(y / 2)}px)`,
          overflow: 'visible',
          pointerEvents: 'none',
          opacity: 0.45,
        }}
      >
        <line
          x1="50%" y1="50%"
          x2={x > 0 ? '100%' : '0%'}
          y2={y > 0 ? '100%' : '0%'}
          stroke="#C8A951"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
      </svg>

      {/* Label chip */}
      <div
        className="whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-full"
        style={{
          background: 'rgba(10,6,2,0.72)',
          border: '1px solid rgba(200,169,81,0.45)',
          color: '#E8C96A',
          fontFamily: 'system-ui, sans-serif',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          fontSize: '10px',
          letterSpacing: '0.02em',
        }}
      >
        {name}
      </div>
    </motion.div>
  );
}

export default function CameraARViewer({ src, dishName, ingredients = [], onClose }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const modelRef   = useRef(null);

  const [stage, setStage]               = useState('loading');  // loading | ready | error
  const [showIngredients, setShowIngredients] = useState(false);
  const [modelReady, setModelReady]     = useState(false);
  const [screenW, setScreenW]           = useState(window.innerWidth);
  const [screenH, setScreenH]           = useState(window.innerHeight);

  // Model size: fills 65% of smaller screen dimension
  const modelSize = Math.min(screenW, screenH) * 0.65;

  // ── Screen resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      setScreenW(window.innerWidth);
      setScreenH(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Start back camera ──────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    }).then((stream) => {
      streamRef.current = stream;
      video.srcObject = stream;
      video.play().then(() => setStage('ready'));
    }).catch(() => setStage('error'));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── model-viewer load event ────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'ready') return;
    const mv = modelRef.current;
    if (!mv) return;
    const onLoad = () => setModelReady(true);
    mv.addEventListener('load', onLoad);
    // Already loaded (cached)
    if (mv.loaded) setModelReady(true);
    return () => mv.removeEventListener('load', onLoad);
  }, [stage]);

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
      />

      {/* ── Subtle vignette overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {/* Top/bottom gradient bars */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* ── Header ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 h-14 z-30">
        <div className="flex items-center gap-2">
          <Cuboid size={16} color="#C8A951" />
          <span
            className="text-white font-semibold text-sm truncate max-w-[200px]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {dishName}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <X size={18} color="white" />
        </button>
      </div>

      {/* ── Loading ── */}
      <AnimatePresence>
        {stage === 'loading' && (
          <motion.div
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4"
            style={{ background: '#000' }}
          >
            <div
              className="w-12 h-12 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(200,169,81,0.2)', borderTopColor: '#C8A951' }}
            />
            <span className="text-white text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              Starting camera…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Camera error ── */}
      {stage === 'error' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-8">
          <span className="text-5xl">📷</span>
          <p className="text-white text-center text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Camera access denied. Please allow camera and reload.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(200,169,81,0.2)', color: '#C8A951', border: '1px solid rgba(200,169,81,0.3)' }}
          >
            Close
          </button>
        </div>
      )}

      {/* ── 3D model + ingredient labels ── */}
      {stage === 'ready' && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: modelSize,
            height: modelSize,
          }}
        >
          {/* Ingredient labels — Phase 2 */}
          <AnimatePresence>
            {showIngredients && modelReady && ingredients.slice(0, 6).map((ing, i) => (
              <IngredientLabel
                key={ing}
                name={ing}
                index={i}
                total={Math.min(ingredients.length, 6)}
                modelSize={modelSize / 2}
              />
            ))}
          </AnimatePresence>

          {/* Soft glow behind model */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(200,169,81,0.08) 0%, transparent 70%)',
              transform: 'scale(1.1)',
            }}
          />

          {/* Drop shadow under dish */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: '4%',
              left: '15%',
              right: '15%',
              height: '14px',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(5px)',
            }}
          />

          {/* model-viewer */}
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
            camera-controls
            loading="eager"
            reveal="auto"
            camera-orbit="0deg 70deg 105%"
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              '--progress-bar-color': 'transparent',
              pointerEvents: 'auto',
            }}
          />
          {/* eslint-enable react/no-unknown-property */}
        </div>
      )}

      {/* ── Model loading spinner (while GLB loads) ── */}
      <AnimatePresence>
        {stage === 'ready' && !modelReady && (
          <motion.div
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none"
          >
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(200,169,81,0.2)', borderTopColor: '#C8A951' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom controls ── */}
      {stage === 'ready' && modelReady && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-3 pb-10 px-6"
        >
          {/* Ingredients toggle button */}
          <button
            onClick={() => setShowIngredients(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              background: showIngredients
                ? 'rgba(200,169,81,0.95)'
                : 'rgba(10,6,2,0.65)',
              color: showIngredients ? '#1A0F00' : '#C8A951',
              border: `1px solid ${showIngredients ? 'transparent' : 'rgba(200,169,81,0.4)'}`,
              fontFamily: 'system-ui, sans-serif',
              backdropFilter: 'blur(10px)',
              pointerEvents: 'auto',
            }}
          >
            <Info size={15} />
            {showIngredients ? 'Hide Ingredients' : 'See Ingredients'}
            {!showIngredients && <ChevronRight size={14} />}
          </button>

          {/* Hint */}
          <span
            className="text-xs text-center"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-text)' }}
          >
            Drag to rotate · Pinch to zoom
          </span>
        </motion.div>
      )}

      {/* ── Corner scan lines (aesthetic AR feel) ── */}
      {stage === 'ready' && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[
            { top: 20, left: 20, rotate: 0 },
            { top: 20, right: 20, rotate: 90 },
            { bottom: 20, right: 20, rotate: 180 },
            { bottom: 20, left: 20, rotate: 270 },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                ...pos,
                width: 28,
                height: 28,
                transform: `rotate(${pos.rotate}deg)`,
                borderTop: '2px solid rgba(200,169,81,0.6)',
                borderLeft: '2px solid rgba(200,169,81,0.6)',
                borderRadius: '2px 0 0 0',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
