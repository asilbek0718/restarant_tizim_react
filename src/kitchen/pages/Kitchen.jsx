import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, AlertCircle, CheckCircle2, Flame, Timer, Search, Filter, User, Send, Star } from 'lucide-react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import useOrderStore from '@/store/orders/orderStore';
import { orderService } from '@/shared/services/orderService';
import { useState, useEffect, useMemo } from 'react';
import { ORDER_STATUS, ITEM_STATUS, ITEM_STATUS_COLORS } from '@/shared/constants/statuses';
import { useFetch } from '@/shared/hooks/useFetch';
import EmptyState from '@/shared/ui/EmptyState';
import { useTick } from '@/shared/providers/TickerProvider';

const KitchenOrder = ({ order }) => {
  const t = TRANSLATIONS?.kitchen;
  const common = TRANSLATIONS?.common;
  const { updateItemStatus } = useOrderStore();
  const now = useTick();

  const elapsed = useMemo(() => {
    if (!order?.createdAt) return 0;
    const start = new Date(order.createdAt).getTime();
    return Math.max(0, Math.floor((now - start) / 60000));
  }, [order?.createdAt, now]);

  const isEntireOrderReady = useMemo(() => {
    if (!order?.items || order.items.length === 0) return false;
    return order.items.every(item => 
      item.status === ITEM_STATUS.READY || 
      item.status === ITEM_STATUS.SERVED || 
      item.status === ITEM_STATUS.CANCELLED
    );
  }, [order?.items]);

  if (!order) return null;

  const handleStart = async () => {
    await orderService.transitionStatus(order.id, ORDER_STATUS.PREPARING);
  };

  const handleReady = async () => {
    if (!isEntireOrderReady) return;
    await orderService.transitionStatus(order.id, ORDER_STATUS.READY);
  };

  const getItemStatusLabel = (status) => {
    switch(status) {
      case ITEM_STATUS.PENDING: return 'Kutilmoqda';
      case ITEM_STATUS.PREPARING: return 'Tayyorlanmoqda';
      case ITEM_STATUS.READY: return 'Tayyor';
      case ITEM_STATUS.SERVED: return 'Yetkazilgan';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'vip': return 'bg-purple-500 text-white border-purple-600 shadow-purple-500/20';
      case 'urgent': return 'bg-red-500 text-white border-red-600 shadow-red-500/20';
      default: return 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-transparent';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass-card overflow-hidden border-l-4 sm:border-l-8 transition-all duration-500 ${
        isEntireOrderReady 
          ? 'border-l-green-500 shadow-lg shadow-green-500/10 ring-1 ring-green-500/20' 
          : (elapsed > 15 ? 'border-l-red-500' : 'border-l-primary-500')
      }`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h3 className="text-lg sm:text-2xl font-bold tracking-tight dark:text-white text-slate-900">Stol #{order.tableNumber || '?'}</h3>
               {order.priority && order.priority !== 'normal' && (
                 <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase shadow-sm border ${getPriorityColor(order.priority)}`}>
                   <Star className="w-3 h-3" /> {order.priority}
                 </div>
               )}
               {elapsed > 15 && order.status !== ORDER_STATUS.READY && (
                 <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-red-500/20">
                   <Flame className="w-3 h-3" /> Kechikish
                 </div>
               )}
            </div>
            <div className="flex flex-col gap-1 mt-2 text-xs dark:text-slate-400 text-slate-500 font-bold">
              <span>#{order.id} • {order.items?.length || 0} ta taom</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.waiterName || 'Ofitsiant'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 sm:gap-1.5 text-primary-500 font-black text-sm sm:text-base">
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{elapsed} m</span>
             </div>
             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">O'tgan vaqt</p>
          </div>
        </div>

        {order.notes && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{order.notes}</span>
            </p>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          {order.items?.map((item, idx) => {
            const isCancelled = item.status === ITEM_STATUS.CANCELLED;
            const itemKey = item.id || `kitchen-${order.id}-${idx}-${item.name}`;
            return (
              <div key={itemKey} className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-[24px] transition-all group shadow-sm border ${
                isCancelled 
                  ? 'bg-red-500/5 border-red-500/10 grayscale opacity-60' 
                  : 'dark:bg-white/[0.03] bg-white border-slate-100 dark:border-white/5 hover:border-primary-500/30'
              }`}>
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-sm sm:text-lg font-bold truncate mb-1 tracking-tight ${isCancelled ? 'text-red-500/70 line-through' : 'dark:text-white text-slate-900'}`}>
                      {item.name}
                    </span>
                    <div className={`text-[8px] sm:text-[9px] font-black uppercase w-fit px-1.5 sm:px-2 py-0.5 rounded-full ${ITEM_STATUS_COLORS[item.status || ITEM_STATUS.PENDING]}`}>
                      {getItemStatusLabel(item.status || ITEM_STATUS.PENDING)}
                    </div>
                  </div>
                  
                  <div className={`shrink-0 flex items-center justify-center min-w-[32px] sm:min-w-[40px] px-2 py-1 rounded-lg border font-black text-sm sm:text-lg tracking-tighter ${
                    isCancelled 
                      ? 'bg-red-500/10 text-red-500/50 border-red-500/10' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white dark:border-white/10 border-slate-200'
                  }`}>
                    ×{item.quantity}
                  </div>
                </div>
                {!isCancelled && (
                  <button 
                    onClick={async () => {
                      const statuses = [ITEM_STATUS.PENDING, ITEM_STATUS.PREPARING, ITEM_STATUS.READY];
                      const currentIndex = statuses.indexOf(item.status || ITEM_STATUS.PENDING);
                      if (currentIndex === -1 || currentIndex === statuses.length - 1) return;
                      
                      const nextStatus = statuses[currentIndex + 1];
                      updateItemStatus(order.id, item.id, nextStatus);
                    }}
                    className={`p-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100 ${item.status === ITEM_STATUS.READY ? 'hidden' : ''}`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 sm:gap-4">
          {order.status === ORDER_STATUS.PENDING && (
            <button 
              onClick={handleStart}
              className="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-[24px] bg-amber-500 text-white font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/40 transition-all active:scale-95 shadow-lg sm:shadow-xl shadow-amber-500/20 uppercase tracking-wider text-xs sm:text-sm"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              Boshlash
            </button>
          )}
          {order.status === ORDER_STATUS.PREPARING && (
            <div className="flex-1">
              {!isEntireOrderReady ? (
                <div className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-[20px] bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 sm:gap-3">
                  <div className="flex-1 text-center">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Tayyorlanmoqda</p>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-500">Barcha taomlar tayyor emas</p>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleReady}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-[24px] premium-gradient text-white font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/40 transition-all active:scale-95 shadow-lg sm:shadow-xl shadow-primary-500/20 uppercase tracking-wider text-xs sm:text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Tayyor
                </button>
              )}
            </div>
          )}
          {order.status === ORDER_STATUS.READY && (
            <div className="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-[24px] bg-green-500/10 text-green-500 border border-green-500/20 font-black flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm uppercase tracking-wider cursor-default">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Ofitsiant kutilmoqda
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Kitchen = () => {
  const t = TRANSLATIONS?.kitchen;
  const getKitchenQueue = useOrderStore(state => state.getKitchenQueue);
  const orders = useOrderStore(state => state.orders);
  const startPolling = useOrderStore(state => state.startPolling);
  const stopPolling = useOrderStore(state => state.stopPolling);
  const { loading, refresh } = useFetch(orderService.fetchAll, [], []);

  // All hooks MUST be called before any conditional returns (Rules of Hooks)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    startPolling('kitchen', 5000); // Poll every 5s on kitchen screen for high-responsiveness
    return () => stopPolling('kitchen');
  }, [startPolling, stopPolling]);

  useEffect(() => {
    // Sound notification logic when new order arrives
    // const audio = new Audio('/sounds/notification.mp3');
    // if (orders.length > previousCount) audio.play();
  }, [orders.length]);

  const rawActiveOrders = useMemo(() => getKitchenQueue(), [orders, getKitchenQueue]);

  const activeOrders = useMemo(() => {
    return rawActiveOrders.filter(order => {
      const searchLower = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        (order.id || '').toLowerCase().includes(searchLower) ||
        (order.tableNumber?.toString() || '').includes(searchLower) ||
        (order.waiterName || '').toLowerCase().includes(searchLower) ||
        order.items?.some(item => (item.name || '').toLowerCase().includes(searchLower));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || (order.priority || 'normal') === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [rawActiveOrders, searchQuery, statusFilter, priorityFilter]);

  if (!t) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-500/10 rounded-xl sm:rounded-[20px] shrink-0">
               <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500" />
             </div>
             <div>
               <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 leading-tight">
                 {t.title}
               </h1>
               <p className="dark:text-slate-400 text-slate-500 mt-0.5 sm:mt-1 text-[10px] sm:text-sm">{t.subtitle}</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-2.5 sm:py-3 glass-card rounded-2xl sm:rounded-[24px] self-start md:self-center">
          <div className="text-center">
            <p className="text-xl sm:text-3xl font-extrabold tracking-tight text-primary-500">{activeOrders.length}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-tighter">Faol</p>
          </div>
          <div className="w-px h-6 sm:h-8 dark:bg-white/10 bg-slate-200" />
          <div className="text-center">
            <p className="text-xl sm:text-3xl font-extrabold tracking-tight text-accent-500">12m</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-tighter">{t.avgCookTime}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl sm:rounded-[32px] border dark:border-white/[0.08] border-slate-200/80 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-2xl shadow-md">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-primary-500 transition-all duration-300" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buyurtma ID, Stol, Ofitsiant, Taom nomi..." 
            className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-slate-100/80 dark:bg-white/[0.03] border border-transparent focus:border-primary-500/30 focus:bg-white dark:focus:bg-[#161616] rounded-xl sm:rounded-[24px] text-xs sm:text-sm font-bold outline-none transition-all duration-300 dark:text-white placeholder:font-bold placeholder:text-slate-400 shadow-inner"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-[180px] sm:min-w-[180px] group">
            <Filter className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-3 sm:py-4 bg-slate-100/80 dark:bg-white/[0.03] border border-transparent focus:border-primary-500/30 focus:bg-white dark:focus:bg-[#161616] rounded-xl sm:rounded-[24px] text-[10px] sm:text-sm font-black outline-none transition-all dark:text-white appearance-none cursor-pointer shadow-inner uppercase tracking-wider text-ellipsis overflow-hidden"
            >
              <option value="all">Barcha holatlar</option>
              <option value={ORDER_STATUS.PENDING}>Yangi (Kutilmoqda)</option>
              <option value={ORDER_STATUS.PREPARING}>Tayyorlanmoqda</option>
              <option value={ORDER_STATUS.READY}>Tayyor</option>
            </select>
          </div>

          <div className="relative w-full sm:w-[180px] sm:min-w-[180px] group">
            <Star className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-3 sm:py-4 bg-slate-100/80 dark:bg-white/[0.03] border border-transparent focus:border-primary-500/30 focus:bg-white dark:focus:bg-[#161616] rounded-xl sm:rounded-[24px] text-[10px] sm:text-sm font-black outline-none transition-all dark:text-white appearance-none cursor-pointer shadow-inner uppercase tracking-wider text-ellipsis overflow-hidden"
            >
              <option value="all">Barcha prioritetlar</option>
              <option value="vip">VIP</option>
              <option value="urgent">Shoshilinch</option>
              <option value="normal">Oddiy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence>
          {activeOrders.map((order, idx) => (
            <KitchenOrder key={order.id || `kitchen-order-${idx}`} order={order} />
          ))}
          {activeOrders.length === 0 && (
            <div className="col-span-full">
              <EmptyState 
                icon={ChefHat}
                title="Hozircha buyurtmalar yo'q"
                description={rawActiveOrders.length === 0 ? "Oshxonaga hali yangi buyurtmalar kelib tushmadi. Biroz dam olish vaqti!" : "Siz qidirgan mezonlarga mos keladigan buyurtma topilmadi."}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Kitchen;
