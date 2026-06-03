import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  Clock, 
  User, 
  Users,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import useOrderStore from '@/store/orders/orderStore';
import useMenuStore from '@/store/menu/menuStore';
import { tableService } from '@/shared/services/tableService';
import { orderService } from '@/shared/services/orderService';
import { ITEM_STATUS, ITEM_STATUS_COLORS, TABLE_STATUS, ORDER_STATUS } from '@/shared/constants/statuses';
import { financeUtils } from '@/shared/utils/finances';

const TableManagementPanel = ({ table, isOpen, onClose }) => {
  const { items: menuItems } = useMenuStore();
  const { 
    addItemToDraft,
    updateDraftItemQuantity,
    removeDraftItem,
    submitDraftToKitchen,
    updateItemStatus,
    removeItemFromOrder
  } = useOrderStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...new Set(menuItems.map(i => i.category))];

  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory && item.isAvailable;
    });
  }, [menuItems, searchQuery, activeCategory]);

  const order = table?.order;

  if (!table) return null;

  const handleAddItem = (item) => {
    if (!order) return;
    addItemToDraft(order.id, item);
  };

  const handleSubmitToKitchen = async () => {
    if (!order || !order.draftItems?.length) return;
    if (window.confirm('Buyurtmani oshxonaga yuborasizmi?')) {
      await submitDraftToKitchen(order.id);
    }
  };

  const handleStatusTransition = async () => {
    if (table.status === TABLE_STATUS.OCCUPIED) {
      if (window.confirm('Stolni tozalashga o\'tkazasizmi?')) {
        await tableService.startCleaning(table.id);
        onClose();
      }
    } else if (table.status === TABLE_STATUS.CLEANING) {
      await tableService.clear(table.id);
      onClose();
    } else if (table.status === TABLE_STATUS.RESERVED) {
      if (window.confirm('Mijoz keldimi? Stolni band (Occupied) holatiga o\'tkazasizmi?')) {
        await orderService.occupyTable(table.id, table.number);
        onClose();
      }
    }
  };

  const getItemStatusLabel = (status) => {
    switch(status) {
      case ITEM_STATUS.PENDING: return 'Kutilmoqda';
      case ITEM_STATUS.PREPARING: return 'Tayyorlanmoqda';
      case ITEM_STATUS.READY: return 'Tayyor';
      case ITEM_STATUS.SERVED: return 'Yetkazilgan';
      case ITEM_STATUS.CANCELLED: return 'Bekor qilingan';
      default: return status;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-[#0c0c0c] shadow-2xl z-[201] flex flex-col border-l dark:border-white/5"
          >
            {/* Header */}
            <div className="p-6 border-b dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                  <span className="text-xl font-black text-primary-500">#{table.number}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black dark:text-white text-slate-900 uppercase tracking-tight">Stol Boshqaruvi</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{table.zone}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{table.status === TABLE_STATUS.OCCUPIED ? 'Band' : 'Tozalanmoqda'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Side: Order Management */}
              <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r dark:border-white/5 min-h-[50%] md:min-h-0">
                <div className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6 sm:space-y-8">
                  {/* Order or Reservation Stats */}
                  {order ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border dark:border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Jami summa</p>
                        <p className="text-xl font-black text-primary-500">{(order.total || 0).toLocaleString()} <span className="text-xs">so'm</span></p>
                      </div>
                      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border dark:border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Buyurtma vaqti</p>
                        <p className="text-xl font-black dark:text-white text-slate-900">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ) : table.reservation ? (
                    <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Faol Bron</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                           <Clock className="w-3 h-3" />
                           <span className="text-[10px] font-black">{table.reservation.time}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black dark:text-white text-slate-900">{table.reservation.customerName}</h4>
                        <p className="text-xs font-bold text-slate-500">{table.reservation.phone}</p>
                      </div>
                      <div className="pt-3 border-t dark:border-white/5 border-amber-500/10 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold">{table.reservation.partySize} kishi</span>
                        </div>
                        {table.reservation.notes && (
                          <div className="flex items-center gap-2 text-slate-500 italic">
                            <FileText className="w-4 h-4" />
                            <span className="text-[10px] truncate max-w-[150px]">{table.reservation.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Draft Items (New Selection) */}
                  {order?.draftItems?.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <h4 className="text-xs font-black text-amber-500 uppercase tracking-[2px]">Yangi tanlanganlar</h4>
                        </div>
                        <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2 py-0.5 rounded-full">{order.draftItems.length}</span>
                      </div>
                      
                      <div className="space-y-3">
                        {order.draftItems.map((item) => (
                          <div key={item.id} className="p-4 rounded-3xl bg-amber-500/[0.03] border border-amber-500/10 group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden grayscale">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold dark:text-white text-slate-900">{item.name}</h5>
                                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Tasdiqlanmagan</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => updateDraftItemQuantity(order.id, item.id, -1)}
                                  className="p-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 transition-all border dark:border-white/5"
                                >
                                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateDraftItemQuantity(order.id, item.id, 1)}
                                  className="p-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 transition-all border dark:border-white/5"
                                >
                                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                                </button>
                                <button 
                                  onClick={() => removeDraftItem(order.id, item.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all ml-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleSubmitToKitchen}
                        className="w-full py-4 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" /> Oshxonaga yuborish
                      </button>
                    </div>
                  )}

                  {/* Confirmed Order Items List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[2px]">Oshxonadagi buyurtmalar</h4>
                      <span className="bg-primary-500/10 text-primary-500 text-[10px] font-black px-2 py-0.5 rounded-full">{order?.items?.length || 0}</span>
                    </div>

                    {!order || !order.items || order.items.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400 opacity-50 border-2 border-dashed dark:border-white/5 rounded-3xl">
                        <Clock className="w-10 h-10 mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest">Faol buyurtmalar yo'q</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className={`p-4 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border dark:border-white/5 group transition-all ${item.status === ITEM_STATUS.SERVED ? 'opacity-60' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl overflow-hidden transition-all ${item.status === ITEM_STATUS.SERVED ? 'grayscale' : ''}`}>
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold dark:text-white text-slate-900">{item.name}</h5>
                                  {item.status === ITEM_STATUS.READY ? (
                                    <button 
                                      onClick={() => updateItemStatus(order.id, item.id, ITEM_STATUS.SERVED)}
                                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full transition-all hover:scale-105 active:scale-95 border ${ITEM_STATUS_COLORS[item.status]} flex items-center gap-1 shadow-sm`}
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Yetkazildi deb belgilash
                                    </button>
                                  ) : (
                                    <div className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${ITEM_STATUS_COLORS[item.status || ITEM_STATUS.PENDING]} w-fit`}>
                                      {getItemStatusLabel(item.status || ITEM_STATUS.PENDING)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-black dark:text-white text-slate-900">x{item.quantity}</span>
                                {item.status === ITEM_STATUS.PENDING && (
                                   <button 
                                      onClick={() => removeItemFromOrder(order.id, item.id)}
                                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t dark:border-white/5 border-slate-200/50">
                                <span className="text-[10px] font-bold text-slate-400">{(item.price || 0).toLocaleString()} so'm</span>
                                <span className="text-sm font-black text-primary-500">{((item.price || 0) * (item.quantity || 1)).toLocaleString()} so'm</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                  <button
                    onClick={handleStatusTransition}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${
                      table.status === TABLE_STATUS.OCCUPIED
                        ? 'bg-purple-500 text-white shadow-purple-500/20 hover:bg-purple-600'
                        : table.status === TABLE_STATUS.RESERVED
                        ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600'
                        : 'bg-green-500 text-white shadow-green-500/20 hover:bg-green-600'
                    }`}
                  >
                    {table.status === TABLE_STATUS.OCCUPIED ? (
                      <>Tozalashga o'tkazish <ChevronRight className="w-4 h-4" /></>
                    ) : table.status === TABLE_STATUS.RESERVED ? (
                      <>Mijoz keldi (Band qilish) <CheckCircle2 className="w-4 h-4" /></>
                    ) : (
                      <>Tozalandi / Bo'shatish <CheckCircle2 className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Side: Menu Selection (Mini POS) */}
              <div className="w-full md:w-80 flex flex-col bg-slate-50/30 dark:bg-transparent overflow-hidden min-h-[50%] md:min-h-0 border-t md:border-t-0 dark:border-white/5 border-slate-100">
                <div className="p-4 border-b dark:border-white/5 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Taom qidirish..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.04] border dark:border-white/5 border-slate-200 rounded-xl outline-none focus:border-primary-500 text-xs font-bold"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-white dark:bg-white/5 text-slate-500 border dark:border-white/5'}`}
                      >
                        {cat === 'all' ? 'Hammasi' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar grid grid-cols-1 gap-3">
                  {filteredMenu.map(item => (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddItem(item)}
                      className="p-3 rounded-2xl bg-white dark:bg-white/[0.02] border dark:border-white/5 hover:border-primary-500/50 transition-all cursor-pointer flex gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-[13px] font-bold dark:text-white text-slate-900 truncate group-hover:text-primary-500 transition-colors">{item.name}</h5>
                        <p className="text-[11px] font-black text-primary-500 mt-0.5">{item.price.toLocaleString()} so'm</p>
                      </div>
                      <div className="flex items-center pr-2">
                        <div className="w-6 h-6 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TableManagementPanel;
