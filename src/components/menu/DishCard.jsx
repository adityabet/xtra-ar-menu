import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cuboid, Star } from 'lucide-react';
import VegBadge from './VegBadge';

export default function DishCard({ dish, index }) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/dish/${dish.id}`)}
      className="w-full text-left overflow-hidden rounded-2xl card-shadow"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65) 100%)' }}
        />

        {/* AR badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold tracking-wide"
          style={{ background: 'rgba(200,169,81,0.92)', color: '#1A0F00' }}
        >
          <Cuboid size={10} />
          AR
        </div>

        {/* Chef recommended */}
        {dish.isChefRecommended && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px]"
            style={{ background: 'rgba(244,239,230,0.88)', border: '1px solid rgba(200,169,81,0.4)' }}
          >
            <Star size={9} color="#C8A951" fill="#C8A951" />
            <span style={{ color: '#3B2A1A' }}>Chef's Pick</span>
          </div>
        )}

        {/* Price — Poppins Bold */}
        <div
          className="absolute bottom-2 right-2 text-sm text-white"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}
        >
          ₹{dish.price}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <VegBadge type={dish.type} size="sm" />
          <div className="flex-1 min-w-0">
            <div
              className="text-sm leading-tight line-clamp-1"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--text)' }}
            >
              {dish.name}
            </div>
            <div
              className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
              style={{ fontFamily: 'var(--font-text)', fontWeight: 400, color: 'var(--text-muted)' }}
            >
              {dish.description}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div
          className="flex items-center gap-3 mt-2 text-[11px]"
          style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text-faint)' }}
        >
          <span>⏱ {dish.prepTime}</span>
          <span>🔥 {dish.calories} cal</span>
        </div>
      </div>
    </motion.button>
  );
}
