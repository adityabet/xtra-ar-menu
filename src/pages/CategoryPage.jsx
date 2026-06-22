import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import DishCard from '../components/menu/DishCard';
import { getCategoryById } from '../data/menuData';

export default function CategoryPage() {
  const { catId } = useParams();
  const category = getCategoryById(catId);

  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Category not found.</p>
      </div>
    );
  }

  const subs = category.subcategories;
  const activeSub = subs[activeIndex];
  const hasTabs = subs.length > 1;

  const goTo = (index) => {
    if (index === activeIndex) return;
    setSlideDir(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const handlePanEnd = (_, info) => {
    const { offset, velocity } = info;
    const isSwipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 200;
    if (!isSwipe) return;
    if (offset.x < 0) { if (activeIndex < subs.length - 1) goTo(activeIndex + 1); }
    else               { if (activeIndex > 0)              goTo(activeIndex - 1); }
  };

  const variants = {
    enter:  (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Navbar title={category.name} showBack />

      <div className="pt-14">
        {/* Category header */}
        <div
          className="px-4 pt-6 pb-5"
          style={{
            background: 'linear-gradient(180deg, rgba(200,169,81,0.08) 0%, transparent 100%)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(200,169,81,0.12)', border: '1px solid rgba(200,169,81,0.28)' }}
            >
              {category.emoji}
            </div>
            <div className="flex-1">
              <div
                className="font-bold text-xl"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
              >
                {category.name}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text-muted)' }}
              >
                {category.description}
              </div>
            </div>
          </div>
        </div>

        {/* Swipeable tab indicator */}
        {hasTabs && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-center gap-3 mb-3">
              {subs.map((sub, i) => (
                <button key={sub.id} onClick={() => goTo(i)} className="flex items-center gap-1.5 transition-all duration-300">
                  <motion.div
                    animate={{
                      width: i === activeIndex ? 28 : 8,
                      background: i === activeIndex ? '#C8A951' : 'rgba(0,0,0,0.15)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-2 rounded-full"
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-1">
              <span
                className="text-xs"
                style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text-faint)' }}
              >
                {activeIndex > 0 ? '← ' + subs[activeIndex - 1].name : ''}
              </span>
              <div className="text-center">
                <span className="text-sm font-bold" style={{ color: '#C8A951', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {activeSub.type === 'veg' ? '🌿 ' : activeSub.type === 'non-veg' ? '🍗 ' : activeSub.type === 'mocktail' ? '🍹 ' : '☕ '}
                  {activeSub.name}
                </span>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text-faint)' }}
                >
                  {activeSub.dishes.length} dishes · swipe to switch
                </div>
              </div>
              <span
                className="text-xs"
                style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text-faint)' }}
              >
                {activeIndex < subs.length - 1 ? subs[activeIndex + 1].name + ' →' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Swipeable dish list */}
        <div className="relative overflow-hidden px-4 pb-10 mt-2">
          <AnimatePresence mode="popLayout" custom={slideDir}>
            <motion.div
              key={activeIndex}
              custom={slideDir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              drag={hasTabs ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onPanEnd={handlePanEnd}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'pan-y' }}
            >
              {activeSub?.dishes.map((dish, i) => (
                <DishCard key={dish.id} dish={dish} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
