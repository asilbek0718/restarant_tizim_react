import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Users, 
  Settings, 
  LogOut, 
  PieChart, 
  TableProperties, 
  WalletCards,
  ChefHat,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/auth/authStore';
import { TRANSLATIONS } from '@/shared/constants/translations';
import { usePermissions } from '@/shared/hooks/usePermissions';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { canAccessModule } = usePermissions();
  const t = TRANSLATIONS.sidebar;
  const common = TRANSLATIONS.common;

  // Dynamically filter menu items using the same permission engine as routing
  const menuItems = useMemo(() => {
    const items = [
      { icon: LayoutDashboard, label: t.dashboard, path: '/', module: 'dashboard' },
      { icon: TableProperties, label: t.tables, path: '/tables', module: 'tables' },
      { icon: UtensilsCrossed, label: t.menu, path: '/menu', module: 'menu' },
      { icon: ClipboardList, label: t.orders, path: '/orders', module: 'orders' },
      { icon: ChefHat, label: t.kitchen, path: '/kitchen', module: 'kitchen' },
      { icon: WalletCards, label: t.cashier, path: '/cashier', module: 'cashier' },
      { icon: PieChart, label: t.analytics, path: '/analytics', module: 'analytics' },
      { icon: Users, label: t.staff, path: '/staff', module: 'staff' },
      { icon: Settings, label: t.settings, path: '/settings', module: 'settings' },
    ];

    return items.filter(item => canAccessModule(item.module));
  }, [canAccessModule, t]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 sm:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 premium-gradient rounded-xl sm:rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgb(14,165,233,0.3)] border border-white/20">
            <UtensilsCrossed className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight dark:text-white text-slate-900 leading-none">
              LUXE
            </h1>
            <span className="text-[9px] sm:text-[11px] font-black tracking-widest text-primary-500 uppercase">RESTO</span>
          </div>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-2 sm:py-4 space-y-1 sm:space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className={({ isActive }) => `
              nav-link group ${isActive ? 'active shadow-sm' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-xl sm:rounded-[14px] transition-all duration-300 ${isActive ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-transparent text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white'}`}>
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110`} />
                </div>
                <span className={`font-bold text-xs sm:text-[15px] tracking-wide transition-colors ${isActive ? 'text-primary-700 dark:text-primary-300' : ''}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 sm:p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl sm:rounded-[24px] text-red-500 hover:bg-red-500/10 transition-all duration-300 font-bold text-xs sm:text-sm"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{common.logout}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`
        fixed left-0 top-0 h-screen w-60 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border-r dark:border-white/[0.05] border-slate-200/50 z-50 hidden lg:block
        transition-all duration-500
      `}>
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-[260px] max-w-[80vw] glass-card border-r z-[70] lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
