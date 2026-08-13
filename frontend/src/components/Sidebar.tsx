import { NavLink } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Courses', '/courses'],
  ['Add Course', '/courses/new'],
  ['Calculator', '/grade-calculator'],
  ['Study Guide', '/study-guide'],
  ['Study Groups', '/study-groups'],
  ['Leaderboard', '/leaderboard'],
  ['Achievements', '/achievements'],
  ['Profile', '/profile']
];

const Sidebar = () => {
  const { sidebarOpen, closeSidebar } = useUiStore();

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-slate-950/70 transition lg:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed left-0 top-[73px] z-30 h-[calc(100vh-73px)] w-72 border-r border-white/10 bg-slate-950/95 p-5 backdrop-blur-xl transition lg:sticky lg:top-[73px] lg:block lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="glass-card p-4">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-300">Your pace</p>
          <p className="mt-2 text-2xl font-bold text-white">Stay ahead of every grade drop.</p>
        </div>
        <nav className="mt-6 space-y-2">
          {navItems.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-gradient-to-r from-brand-500/30 to-blue-500/25 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
