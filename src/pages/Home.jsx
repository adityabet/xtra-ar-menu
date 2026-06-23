import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Navigation, MessageSquare } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import CategoryCard from '../components/menu/CategoryCard';
import { categories, ALL_MODEL_URLS } from '../data/menuData';
import { preloadModels } from '../lib/preloader';

export default function Home() {
  useEffect(() => {
    preloadModels(ALL_MODEL_URLS);
  }, []);

  const totalDishes = categories.reduce(
    (s, c) => s + c.subcategories.reduce((ss, sc) => ss + sc.dishes.length, 0), 0
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="pt-14">

        {/* ── Hero Banner ── */}
        <div
          className="relative px-4 pt-8 pb-7 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(200,169,81,0.10) 0%, transparent 100%)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(200,169,81,0.12) 0%, transparent 70%)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="shimmer-gold text-3xl font-bold tracking-widest mb-0.5">
              XTRA
            </div>
            <div
              className="text-[10px] tracking-[0.4em] uppercase mb-5"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--text-faint)' }}
            >
              Rooftop Lounge & Cafe
            </div>

            {/* Stats row */}
            <div
              className="flex items-center justify-center gap-4 text-xs mb-5"
              style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text-muted)' }}
            >
              <span className="flex items-center gap-1">
                <Star size={10} color="#C8A951" fill="#C8A951" />
                <span className="font-bold" style={{ color: '#C8A951' }}>5.0</span> Rating
              </span>
              <span className="w-px h-3" style={{ background: 'var(--border)' }} />
              <a
                href="https://www.google.com/maps/place/The+Brewyard+Speciality+Coffee/@18.4751611,73.8618864,16z/data=!3m1!4b1!4m6!3m5!1s0x3bc2eb2f7a228a93:0x7ddc7a54f15b739b!8m2!3d18.4751611!4d73.8618864!16s%2Fg%2F11x1w5gsfy!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1" style={{ color: 'inherit' }}
              >
                <MapPin size={10} color="#C8A951" />
                Navale Bridge, Pune
              </a>
            </div>

            {/* Directions + Reviews buttons */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <a
                href="https://www.google.com/maps/place/The+Brewyard+Speciality+Coffee/@18.4751611,73.8618864,16z/data=!3m1!4b1!4m6!3m5!1s0x3bc2eb2f7a228a93:0x7ddc7a54f15b739b!8m2!3d18.4751611!4d73.8618864!16s%2Fg%2F11x1w5gsfy!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold active:scale-95 transition-transform"
                style={{ background: 'rgba(200,169,81,0.13)', border: '1px solid rgba(200,169,81,0.3)', color: '#C8A951', fontFamily: 'var(--font-body)' }}
              >
                <Navigation size={13} />
                Directions
              </a>
              <a
                href="https://www.google.com/maps/place/The+Brewyard+Speciality+Coffee/@18.4751611,73.8618864,16z/data=!4m8!3m7!1s0x3bc2eb2f7a228a93:0x7ddc7a54f15b739b!8m2!3d18.4751611!4d73.8618864!9m1!1b1!16s%2Fg%2F11x1w5gsfy!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold active:scale-95 transition-transform"
                style={{ background: 'rgba(200,169,81,0.13)', border: '1px solid rgba(200,169,81,0.3)', color: '#C8A951', fontFamily: 'var(--font-body)' }}
              >
                <MessageSquare size={13} />
                Rate Us
              </a>
            </div>

            {/* AR badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]"
              style={{
                background: 'rgba(200,169,81,0.10)',
                border: '1px solid rgba(200,169,81,0.25)',
                color: '#C8A951',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Tap any dish to view it in AR
            </div>
          </motion.div>
        </div>

        {/* ── Gold divider ── */}
        <div className="gold-line mx-8 my-0" />

        {/* ── Menu heading ── */}
        <div className="px-4 pt-5 pb-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="font-bold text-lg"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Our Menu
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text-faint)' }}
            >
              {categories.length} categories · {totalDishes} dishes
            </div>
          </motion.div>
        </div>

        {/* ── Category list ── */}
        <div className="px-4 pb-10 flex flex-col gap-3">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>

        {/* ── Footer note ── */}
        <div className="pb-8 px-4 text-center">
          <p
            className="text-[11px]"
            style={{ fontFamily: 'system-ui, sans-serif', color: 'var(--text-faint)' }}
          >
            ✦ Prices inclusive of taxes · Subject to change ✦
          </p>
        </div>
      </div>
    </div>
  );
}
