import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function CategoryCard({ category, index }) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/category/${category.id}`)}
      className="relative overflow-hidden rounded-2xl text-left w-full active:scale-[0.97] transition-transform card-shadow"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Gold accent bar top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, transparent, #C8A951, transparent)' }}
      />

      <div className="flex items-center gap-4 p-4">
        {/* Emoji bubble */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: 'rgba(200,169,81,0.12)',
            border: '1px solid rgba(200,169,81,0.28)',
          }}
        >
          {category.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-base leading-tight"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text)' }}
          >
            {category.name}
          </div>
          <div
            className="text-xs mt-0.5 truncate"
            style={{ fontFamily: 'var(--font-text)', color: 'var(--text-muted)' }}
          >
            {category.description}
          </div>
          <div
            className="text-xs mt-1"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-faint)' }}
          >
            {category.subcategories.reduce((sum, s) => sum + s.dishes.length, 0)} dishes
          </div>
        </div>

        <ChevronRight size={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
      </div>
    </motion.button>
  );
}
