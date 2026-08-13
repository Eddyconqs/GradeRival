import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="btn-secondary lg:hidden">☰</button>
          <Link to="/dashboard" className="text-xl font-black tracking-tight text-white">
            Grade<span className="text-brand-400">Rival</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 sm:block">
            {user?.school ?? 'Track every grade, outpace every deadline'}
          </div>
          {user && (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
            >
              <img src={user.avatar ?? `https://ui-avatars.com/api/?name=${user.username}&background=8b5cf6&color=ffffff`} alt={user.username} className="h-9 w-9 rounded-full object-cover" />
              <span className="hidden sm:block">{user.username}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
