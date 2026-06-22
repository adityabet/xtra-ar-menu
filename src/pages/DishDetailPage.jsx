import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Cuboid, Clock, Flame, Star, ChefHat } from 'lucide-react';
import { getDishById } from '../data/menuData';
import VegBadge from '../components/menu/VegBadge';
import ARViewer from '../components/ui/ARViewer';

export default function DishDetailPage() {
  const { dishId } = useParams();
  const navigate = useNavigate();
  const [arOpen, setArOpen] = useState(false);

  const result = getDishById(dishId);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Dish not found.</p>
      </div>
    );
  }

  const { dish, category } = result;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Hero Image — always dark overlay so text stays readable ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '56vw', minHeight: 220, maxHeight: 340 }}>
        <img
          src={dish.image}
          alt={dish.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 35%, rgba(0,0,0,0.75) 100%)' }}
        />

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all"
          style={{
            background: 'rgba(244,239,230,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <ChevronLeft size={20} style={{ color: '#3B2A1A' }} />
        </button>

        {/* Chef pick */}
        {dish.isChefRecommended && (
          <div
            className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(200,169,81,0.92)', color: '#1A0F00' }}
          >
            <Star size={10} fill="currentColor" />
            Chef's Pick
          </div>
        )}

        {/* Category chip */}
        <div className="absolute bottom-4 left-4">
          <span
            className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest"
            style={{
              background: 'rgba(200,169,81,0.18)',
              border: '1px solid rgba(200,169,81,0.35)',
              color: '#C8A951',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {category.emoji} {category.name}
          </span>
        </div>

        {/* Price */}
        <div className="absolute bottom-4 right-4">
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '1.125rem', color: '#C8A951' }}>₹{dish.price}</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-5 pb-36">

        {/* Name + veg badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-3"
        >
          <VegBadge type={dish.type} size="lg" />
          <h1
            className="text-xl leading-tight flex-1"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--text)' }}
          >
            {dish.name}
          </h1>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-4 mb-5"
        >
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            <Clock size={13} color="#C8A951" />
            {dish.prepTime}
          </div>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'system-ui, sans-serif' }}>
            <Flame size={13} color="#E86B3A" />
            {dish.calories} kcal
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm leading-relaxed mb-6"
          style={{ fontFamily: 'var(--font-text)', fontWeight: 400, color: 'var(--text-muted)' }}
        >
          {dish.description}
        </motion.p>

        {/* Ingredients */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <ChefHat size={14} color="#C8A951" />
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text)' }}
            >
              Ingredients
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dish.ingredients.map((ing) => (
              <span
                key={ing}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  background: 'rgba(200,169,81,0.10)',
                  border: '1px solid rgba(200,169,81,0.22)',
                  color: 'var(--text-muted)',
                }}
              >
                {ing}
              </span>
            ))}
          </div>
        </motion.div>

        {/* AR Info card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(200,169,81,0.07)',
            border: '1px solid rgba(200,169,81,0.20)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Cuboid size={14} color="#C8A951" />
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: 'system-ui, sans-serif', color: '#C8A951' }}
            >
              View in Augmented Reality
            </span>
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ fontFamily: 'var(--font-text)', color: 'var(--text-muted)' }}
          >
            Point your camera at the <strong>floor in front of you</strong> — the dish will appear at real size so you can see exactly how it looks before ordering.
          </p>
        </motion.div>
      </div>

      {/* ── Fixed AR Button ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 z-30"
        style={{
          background: `linear-gradient(180deg, transparent 0%, var(--bg) 35%)`,
        }}
      >
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setArOpen(true)}
          className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2"
          style={{
            fontFamily: 'system-ui, sans-serif',
            background: 'linear-gradient(135deg, #C8A951 0%, #E8C96A 50%, #9A7A35 100%)',
            color: '#1A0F00',
          }}
        >
          <Cuboid size={18} />
          View in AR / 3D
        </motion.button>
      </div>

      {/* AR Viewer overlay */}
      <AnimatePresence>
        {arOpen && (
          <ARViewer
            src={dish.model}
            dishName={dish.name}
            ingredients={dish.ingredients}
            onClose={() => setArOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
