import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Navbar({ title, showBack = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left */}
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-full active:scale-95 transition-all"
            style={{ color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)' }}
          >
            <ChevronLeft size={22} />
          </button>
        )}
      </div>

      {/* Center */}
      <div className="flex flex-col items-center">
        {isHome ? (
          <>
            <span className="shimmer-gold font-bold text-base tracking-widest">XTRA</span>
            <span className="text-[9px] tracking-[0.3em] uppercase -mt-0.5" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-body)' }}>AR Menu</span>
          </>
        ) : (
          <span className="font-semibold text-sm tracking-wide" style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{title}</span>
        )}
      </div>

      {/* Right — empty placeholder to keep logo centered */}
      <div className="w-10" />
    </header>
  );
}
