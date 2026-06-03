import React, { useState, useMemo } from 'react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import { PageContainer, SectionHeader } from '@/shared/ui';
import FoodGrid from '../components/menu/FoodGrid';
import FoodCategoryTabs from '../components/menu/FoodCategoryTabs';
import FoodSearchBar from '../components/menu/FoodSearchBar';
import FoodFormModal from '../components/menu/FoodFormModal';
import FoodStatsCard from '../components/menu/FoodStatsCard';
import PopularFoodsTable from '../components/menu/PopularFoodsTable';
import { Utensils, Star, Flame, Coffee, Plus, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import useMenuStore from '@/store/menu/menuStore';
import useOrderStore from '@/store/orders/orderStore';
import { menuService } from '@/shared/services/menuService';
import { useEffect } from 'react';

import { usePermissions } from '@/shared/hooks/usePermissions';
import { useFetch } from '@/shared/hooks/useFetch';

import CategoryFormModal from '../components/menu/CategoryFormModal';

const Menu = () => {
  const t = TRANSLATIONS.menu;
  const common = TRANSLATIONS.common;
  const { can } = usePermissions();
  const canManage = can('manage:menu');
  const canDelete = can('actions:delete_menu_item');
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const orders = useOrderStore(state => state.orders);
  const items = useMenuStore(state => state.items);
  const storeCategories = useMenuStore(state => state.categories);
  const getStats = useMenuStore(state => state.getStats);
  const stats = useMemo(() => getStats(), [items, getStats]);

  const { loading, error, refresh } = useFetch(menuService.fetchMenuItems, [], []);
  const { loading: catsLoading } = useFetch(menuService.fetchCategories, [], []);

  const categories = useMemo(() => [
    { id: 'all', name: 'Barchasi', icon: '🍽️' },
    ...storeCategories
  ], [storeCategories]);

  // Calculate real sales from orders for popularity sorting
  const popularFoodsData = useMemo(() => {
    const itemSales = {};
    orders.forEach(o => {
      if(o.items) {
        o.items.forEach(i => {
          itemSales[i.id] = (itemSales[i.id] || 0) + i.quantity;
        });
      }
    });

    return items
      .map(i => ({ ...i, sales: itemSales[i.id] || 0 }))
      .filter(i => i.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders, items]);

  // Food Handlers
  const handleEdit = (food) => {
    if (!canManage) return;
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    if (!canManage) return;
    setSelectedFood(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (food) => {
    if (!canDelete) return;
    if (window.confirm(`${food.name}ni o'chirishni xohlaysizmi?`)) {
      await menuService.deleteMenuItem(food.id);
    }
  };

  const handleSave = async (data) => {
    if (selectedFood) {
      await menuService.updateMenuItem(selectedFood.id, data);
    } else {
      await menuService.createMenuItem(data);
    }
    setIsModalOpen(false);
  };

  // Category Handlers
  const handleAddCategory = () => {
    if (!canManage) return;
    setSelectedCategory(null);
    setIsCatModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    if (!canManage) return;
    setSelectedCategory(cat);
    setIsCatModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!canDelete) return;
    if (window.confirm("Ushbu kategoriyani o'chirishni xohlaysizmi? Bu kategoriya ostidagi taomlar o'chirilmaydi.")) {
      await menuService.deleteCategory(id);
      if (activeCategory === id) setActiveCategory('all');
    }
  };

  const handleSaveCategory = async (data) => {
    if (selectedCategory) {
      await menuService.updateCategory(selectedCategory.id, data);
    } else {
      await menuService.createCategory(data);
    }
    setIsCatModalOpen(false);
  };

  // Advanced Filtering & Sorting
  const filteredItems = useMemo(() => items
    .filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const searchLower = (searchQuery || '').toLowerCase();
      const matchesSearch = (item.name || '').toLowerCase().includes(searchLower) || 
                            (item.description || '').toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesCategory && matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'price_asc') return (Number(a.discountPrice || a.price)) - (Number(b.discountPrice || b.price));
      if (sortOrder === 'price_desc') return (Number(b.discountPrice || b.price)) - (Number(a.discountPrice || a.price));
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      if (sortOrder === 'newest') {
        const getTs = (id) => {
          const s = String(id || '');
          return s.includes('-') ? Number(s.split('-')[1]) : Number(s) || 0;
        };
        return getTs(b.id) - getTs(a.id);
      }
      return 0;
    }), [items, activeCategory, searchQuery, statusFilter, sortOrder]);

  if (loading && !items.length) {
    return (
      <PageContainer>
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-[3px] animate-pulse">Menyu yuklanmoqda...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-8 text-center">
          <div className="p-8 bg-red-500/10 rounded-[40px] border border-red-500/20">
            <Utensils className="w-16 h-16 text-red-500 opacity-60" />
          </div>
          <div>
            <h2 className="text-3xl font-black dark:text-white text-slate-900 uppercase tracking-tighter mb-3">Xatolik yuz berdi</h2>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">Server bilan aloqa o'rnatib bo'lmadi. Iltimos, internet aloqasini tekshiring.</p>
          </div>
          <button 
            onClick={() => refresh()}
            className="px-10 py-4 bg-primary-500 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-2xl shadow-primary-500/40 active:scale-95"
          >
            Qayta yuklash
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeader 
        title={t.title} 
        description={t.subtitle} 
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <FoodStatsCard title="Jami" value={stats.total} icon={Utensils} colorClass="text-blue-500 bg-blue-500" />
        <FoodStatsCard title="Bor" value={stats.available} icon={Star} colorClass="text-green-500 bg-green-500" />
        <FoodStatsCard title="Kam qolgan" value={stats.lowStock} icon={Flame} colorClass="text-amber-500 bg-amber-500" />
        <FoodStatsCard title="Tugagan" value={stats.outOfStock} icon={Flame} colorClass="text-red-500 bg-red-500" />
      </div>

      {/* Unified Toolbar area */}
      <div className="glass-card p-4 sm:p-6 rounded-3xl sm:rounded-[40px] mb-8 sm:mb-10 border dark:border-white/5 border-slate-200/60 shadow-2xl bg-white/40 dark:bg-black/20 backdrop-blur-3xl">
        <FoodSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onAddFood={canManage ? handleAdd : null}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
        
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 sm:mt-8 pt-4 sm:pt-8 border-t dark:border-white/5 border-slate-100">
                <FoodCategoryTabs 
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  canManage={canManage}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onAdd={handleAddCategory}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Grid */}
      <div className="mb-16">
        {filteredItems.length > 0 ? (
          <FoodGrid 
            foods={filteredItems}
            onEdit={canManage ? handleEdit : null}
            onDelete={canDelete ? handleDelete : null}
          />
        ) : (
          <div className="h-[30vh] sm:h-[40vh] flex flex-col items-center justify-center text-center p-6 sm:p-10 bg-slate-50/50 dark:bg-white/[0.02] rounded-3xl sm:rounded-[40px] border-2 border-dashed dark:border-white/5 border-slate-200">
             <Search className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mb-4 sm:mb-6" />
             <h3 className="text-xl font-black dark:text-white text-slate-900 uppercase tracking-tight">Taomlar topilmadi</h3>
             <p className="text-slate-500 mt-2 font-medium">Qidiruv yoki filtrlash parametrlarini o'zgartirib ko'ring</p>
          </div>
        )}
      </div>

      {/* Popular Items */}
      {popularFoodsData.length > 0 && <PopularFoodsTable foods={popularFoodsData} />}

      {canManage && (
        <>
          <FoodFormModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            food={selectedFood}
            categories={storeCategories}
            onSave={handleSave}
          />
          <CategoryFormModal 
            isOpen={isCatModalOpen}
            onClose={() => setIsCatModalOpen(false)}
            category={selectedCategory}
            onSave={handleSaveCategory}
          />
        </>
      )}
    </PageContainer>
  );
};

export default Menu;
