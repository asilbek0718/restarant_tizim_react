import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import { PageContainer, SectionHeader } from '@/shared/ui';
import StaffCard from '../components/staff/StaffCard';
import StaffTable from '../components/staff/StaffTable';
import StaffPerformanceCard from '../components/staff/StaffPerformanceCard';
import StaffAttendanceTable from '../components/staff/StaffAttendanceTable';
import StaffFormModal from '../components/staff/StaffFormModal';
import StaffDetailsModal from '../components/staff/StaffDetailsModal';
import { Search, Plus, Users, Activity, Star, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '@/shared/hooks/usePermissions';

import useStaffStore from '@/store/staff/staffStore';

const Staff = () => {
  const t = TRANSLATIONS.staff;
  const common = TRANSLATIONS.common;
  const { can } = usePermissions();
  const canManageStaff = can('manage:staff');

  const [viewType, setViewType] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const { 
    staff, 
    addEmployee, 
    updateEmployee, 
    deactivateEmployee, 
    restoreEmployee, 
    getStats,
    attendance 
  } = useStaffStore();
  
  const stats = getStats();

  const filteredAndSortedStaff = useMemo(() => {
    let result = (staff || []).filter(s => {
      const searchLower = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        (s.name || '').toLowerCase().includes(searchLower) ||
        (s.phone || '').includes(searchQuery) ||
        (s.employeeId || '').toLowerCase().includes(searchLower);
      
      const matchesCategory = activeCategory === 'all' || 
        (activeCategory === 'kitchen' && s.role === 'kitchen') ||
        (activeCategory === 'service' && ['waiter', 'cashier', 'delivery'].includes(s.role)) ||
        (activeCategory === 'administration' && ['admin', 'manager'].includes(s.role)) ||
        (activeCategory === 'inactive' && !s.is_active) ||
        (activeCategory === 'active' && s.is_active);
      
      // Default behavior: don't show inactive unless specifically requested
      if (activeCategory !== 'inactive' && !s.is_active) return false;

      return matchesSearch && matchesCategory;
    });

    // Sorting logic
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'shift':
          return a.shift.localeCompare(b.shift);
        case 'performance':
          return (b.performance || 0) - (a.performance || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [staff, searchQuery, activeCategory, sortBy]);

  const handleEditStaff = (s) => {
    if (!canManageStaff) return;
    setSelectedStaff(s);
    setIsModalOpen(true);
  };

  const handleViewDetails = (s) => {
    setSelectedStaff(s);
    setIsDetailsOpen(true);
  };

  const handleAddStaff = () => {
    if (!canManageStaff) return;
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (!canManageStaff) return;
    if (data.id && staff.some(s => s.id === data.id)) {
      updateEmployee(data.id, data);
    } else {
      addEmployee(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (s) => {
    if (!canManageStaff) return;
    if (window.confirm(t.messages.confirmDeactivate)) {
      deactivateEmployee(s.id);
    }
  };

  const handleRestore = (s) => {
    if (!canManageStaff) return;
    if (window.confirm(t.messages.confirmRestore)) {
      restoreEmployee(s.id);
    }
  };

  return (
    <PageContainer>
      <SectionHeader 
        title={t.title} 
        description={t.subtitle} 
        actionElement={
          canManageStaff ? (
            <button onClick={handleAddStaff} className="px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-[24px] bg-primary-500 hover:bg-primary-600 text-white font-black text-xs sm:text-sm transition-all shadow-[0_20px_50px_rgba(14,165,233,0.3)] hover:shadow-primary-500/50 hover:-translate-y-1 flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-widest whitespace-nowrap">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> {t.addEmployee}
            </button>
          ) : null
        }
      />

      {/* Advanced Toolbar */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between mb-8">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/50 dark:bg-white/[0.03] rounded-xl sm:rounded-[24px] w-full xl:w-auto overflow-x-auto no-scrollbar border border-slate-200/50 dark:border-white/5">
          {['all', 'active', 'kitchen', 'service', 'administration', 'inactive'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-[18px] text-[9px] sm:text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeCategory === cat ? 'bg-white dark:bg-primary-500 text-primary-500 dark:text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {cat === 'all' ? t.allStaff : cat === 'active' ? t.activeStaff : cat === 'inactive' ? t.inactiveStaff : t[cat] || cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
            <input 
              type="text" 
              placeholder="Ism, telefon yoki ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-[24px] text-xs sm:text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full sm:w-48 pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-4 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-[24px] text-[10px] sm:text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white cursor-pointer shadow-sm"
              >
                <option value="newest">Yangi qo'shilganlar</option>
                <option value="role">Rol bo'yicha</option>
                <option value="status">Holat bo'yicha</option>
                <option value="shift">Smena bo'yicha</option>
                <option value="performance">Samaradorlik</option>
              </select>
              <ArrowUpDown className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 pointer-events-none" />
              <ChevronDown className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex p-1 bg-slate-100/50 dark:bg-white/[0.03] rounded-xl sm:rounded-[24px] border border-slate-200/50 dark:border-white/5">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-[18px] transition-all ${viewType === 'grid' ? 'bg-white dark:bg-white/10 text-primary-500 shadow-xl' : 'text-slate-400'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="2"/><rect width="7" height="7" x="14" y="3" rx="2"/><rect width="7" height="7" x="14" y="14" rx="2"/><rect width="7" height="7" x="3" y="14" rx="2"/></svg>
              </button>
              <button 
                onClick={() => setViewType('table')}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-[18px] transition-all ${viewType === 'table' ? 'bg-white dark:bg-white/10 text-primary-500 shadow-xl' : 'text-slate-400'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats - Premium Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        {[
          { label: t.stats.total, value: stats.total, icon: Users, color: 'primary' },
          { label: t.stats.online, value: stats.online, icon: Activity, color: 'green' },
          { label: t.stats.avgPerformance, value: `${stats.avgPerformance}%`, icon: Star, color: 'amber' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-[32px] border-b-8 border-b-primary-500/50 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500"
          >
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 text-${stat.color}-500`}>
               <stat.icon className="w-24 h-24 sm:w-32 sm:h-32" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2 sm:mb-3">{stat.label}</p>
            <p className="text-3xl sm:text-5xl font-black dark:text-white text-slate-900 leading-none">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Staff Content */}
      <div className="mb-16">
        <AnimatePresence mode="wait">
          {filteredAndSortedStaff.length > 0 ? (
            viewType === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredAndSortedStaff.map((s) => (
                  <StaffCard 
                    key={s.id} 
                    staff={s} 
                    onEdit={handleEditStaff}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StaffTable 
                  staff={filteredAndSortedStaff} 
                  onEdit={handleEditStaff}
                  onView={handleViewDetails}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                />
              </motion.div>
            )
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center glass-card rounded-[40px] border border-dashed border-slate-200 dark:border-white/10"
            >
               <div className="w-24 h-24 bg-slate-50 dark:bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                  <Users className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-2xl font-black dark:text-white text-slate-900">{t.messages.noStaff}</h3>
               <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Qidiruv kriteriyalariga mos xodimlar topilmadi.</p>
               <button onClick={handleAddStaff} className="mt-8 text-sm font-black text-primary-500 uppercase tracking-widest hover:underline">Yangi xodim qo'shish</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Secondary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-5">
          <StaffPerformanceCard 
            title={t.performance} 
            value={stats.avgPerformance} 
            percentage={2.4} 
            isPositive={true} 
          />
        </div>
        <div className="lg:col-span-7 h-[400px]">
          <StaffAttendanceTable records={attendance} />
        </div>
      </div>

      <StaffFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={selectedStaff}
        onSave={handleSave}
      />

      <StaffDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        staff={selectedStaff}
      />
    </PageContainer>
  );
};

export default Staff;

