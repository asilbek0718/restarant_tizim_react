import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import useAuthStore from '@/store/auth/authStore';
import { TRANSLATIONS } from '@/shared/constants/translations';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ toggleSidebar }) => {
  const user = useAuthStore((state) => state.user);
  const t = TRANSLATIONS.navbar;
  const roles = TRANSLATIONS.staff.roles;

  return (
    <header className="h-14 sm:h-16 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-3xl border-b dark:border-white/[0.05] border-slate-200/50 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg glass-card hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          <Menu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>

        <div className="relative w-full max-w-md hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="input-field pl-11 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-1.5 sm:p-2 rounded-lg glass-card hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400">
          <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-500 rounded-full border border-white dark:border-[#050505]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l dark:border-white/[0.08] border-slate-200/80">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold dark:text-white text-slate-900 leading-tight tracking-tight">{user?.name || 'Tizim admini'}</p>
            <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{roles[user?.role] || roles.manager}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl premium-gradient flex items-center justify-center border border-white/20 shadow-md shrink-0">
            <User className="text-white w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
