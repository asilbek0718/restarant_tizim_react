import React from 'react';
import { TRANSLATIONS } from '@/shared/constants/translations';

const StaffRoleBadge = ({ role }) => {
  const t = TRANSLATIONS.staff.roles;

  const getRoleConfig = () => {
    const roleKey = role?.toLowerCase();
    switch (roleKey) {
      case 'admin':
      case 'manager':
        return { label: t[roleKey] || role, classes: 'bg-primary-500/10 text-primary-600 border-primary-500/20 dark:text-primary-400' };
      case 'kitchen':
        return { label: t.kitchen, classes: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400' };
      case 'waiter':
        return { label: t.waiter, classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400' };
      case 'cashier':
        return { label: t.cashier, classes: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' };
      case 'delivery':
        return { label: t.delivery, classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400' };
      case 'cleaner':
        return { label: t.cleaner, classes: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400' };
      default:
        return { label: role || 'Xodim', classes: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-gray-300' };
    }
  };

  const config = getRoleConfig();

  return (
    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border whitespace-nowrap shadow-sm transition-all ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default StaffRoleBadge;
