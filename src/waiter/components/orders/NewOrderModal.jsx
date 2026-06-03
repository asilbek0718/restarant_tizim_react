import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Minus, ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react';
import useMenuStore from '@/store/menu/menuStore';
import useTableStore from '@/store/tables/tableStore';
import { orderService } from '@/shared/services/orderService';
import { financeUtils } from '@/shared/utils/finances';
import { TABLE_STATUS, ORDER_STATUS } from '@/shared/constants/statuses';
import useAuthStore from '@/store/auth/authStore';

const NewOrderModal = ({ isOpen, onClose, initialTableId }) => {
  const { items: menuItems } = useMenuStore();
  const { tables } = useTableStore();
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (initialTableId) {
      setSelectedTable(initialTableId);
    }
  }, [initialTableId]);

  const categories = ['all', ...new Set(menuItems.map(i => i.category))];

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory && item.isAvailable;
    });
  }, [menuItems, searchQuery, activeCategory]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const { subtotal, tax, serviceFee, total } = financeUtils.calculateOrderTotals(cart);

  const handleSubmit = async () => {
    if (cart.length === 0 || !selectedTable || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const targetTable = tables.find(t => t.id === selectedTable);
      const orderData = {
        id: `ORD-${Date.now()}`,
        customerName: customerName || `Mehmon (${targetTable?.number}-stol)`,
        tableId: selectedTable,
        tableNumber: targetTable?.number,
        zone: targetTable?.zone,
        items: cart.map(item => ({
          ...item,
          status: 'pending',
          addedAt: new Date().toISOString()
        })),
        status: ORDER_STATUS.PENDING,
        waiterId: user?.id,
        waiterName: user?.name || user?.username || 'Ofitsiant',
        notes: notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: 'unpaid'
      };

      await orderService.create(orderData);
      onClose();
      // Reset state
      setCart([]);
      setSelectedTable(null);
      setCustomerName('');
      setNotes('');
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Buyurtma yaratishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#0a0a0a] w-full max-w-7xl h-full sm:h-[90vh] rounded-none sm:rounded-[32px] shadow-2xl border-0 sm:border dark:border-white/[0.08] border-slate-200/80 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b dark:border-white/[0.08] border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-black dark:text-white text-slate-900 uppercase tracking-tight">Yangi Buyurtma</h2>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Stol va taomlarni tanlang</p>
            </div>
            <button onClick={onClose} className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
            {/* Left: Menu Selection */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r dark:border-white/[0.08] border-slate-100 bg-slate-50/30 dark:bg-transparent">
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Taom qidirish..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 sm:py-3 bg-white dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200 rounded-xl sm:rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-xs sm:text-sm"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-primary-500 text-white shadow-lg' : 'bg-white dark:bg-white/5 text-slate-500'}`}
                    >
                      {cat === 'all' ? 'Barchasi' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0 custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-h-[40vh] lg:max-h-none">
                {filteredItems.map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4 }}
                    onClick={() => addToCart(item)}
                    className="glass-card p-2 sm:p-3 rounded-2xl sm:rounded-3xl cursor-pointer hover:border-primary-500/50 transition-all group"
                  >
                    <div className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-black text-xs sm:text-sm dark:text-white text-slate-900 group-hover:text-primary-500 transition-colors line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] sm:text-xs font-bold text-primary-500 mt-0.5 sm:mt-1">{item.price.toLocaleString()} so'm</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Cart & Table Selection */}
            <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-[#0c0c0c] border-t lg:border-t-0 lg:border-l dark:border-white/[0.08] border-slate-100">
              <div className="p-4 sm:p-6 border-b dark:border-white/[0.08] border-slate-100">
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-widest text-slate-500 mb-3 sm:mb-4">Stol tanlash</h3>
                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-1.5 sm:gap-2">
                  {tables.map(table => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      disabled={table.status === TABLE_STATUS.OCCUPIED || table.status === TABLE_STATUS.INACTIVE}
                      className={`py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all border-2 ${
                        selectedTable === table.id 
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500' 
                          : table.status === TABLE_STATUS.EMPTY
                            ? 'border-slate-100 dark:border-white/5 text-slate-500 hover:border-primary-500/30'
                            : 'border-transparent bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {table.number}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-widest text-slate-500 mb-1.5 sm:mb-2">Buyurtma izohi</h3>
                  <textarea 
                    placeholder="Masalan: Achchiq bo'lmasin..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border dark:border-white/[0.08] border-slate-200 rounded-xl sm:rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-xs sm:text-sm min-h-[60px] sm:min-h-[80px] resize-none"
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-3 sm:space-y-4 max-h-[30vh] lg:max-h-none">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-widest text-slate-500">Savat</h3>
                  <span className="bg-primary-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full">{cart.length}</span>
                </div>
                
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-2 py-10 lg:py-0">
                    <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Savat bo'sh</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-white/[0.02] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border dark:border-white/5 border-slate-100">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-[10px] sm:text-xs dark:text-white text-slate-900 truncate">{item.name}</h4>
                        <p className="text-[9px] sm:text-[10px] font-bold text-primary-500 mt-0.5">{item.price.toLocaleString()} so'm</p>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 sm:p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                        <span className="text-[10px] sm:text-xs font-black w-3.5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 sm:p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors ml-0.5">
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Total */}
              <div className="p-4 sm:p-6 border-t dark:border-white/[0.08] border-slate-100 bg-slate-50/50 dark:bg-white/[0.02] space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-[10px] sm:text-xs font-bold text-slate-500">
                    <span>Oraliq summa:</span>
                    <span>{subtotal.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs font-bold text-slate-500">
                    <span>QQS (12%):</span>
                    <span>{tax.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs font-bold text-slate-500">
                    <span>Xizmat haqi (10%):</span>
                    <span>{serviceFee.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-lg font-black dark:text-white text-slate-900 pt-1.5 sm:pt-2 border-t dark:border-white/[0.08] border-slate-200">
                    <span>Jami:</span>
                    <span className="text-primary-500">{total.toLocaleString()} so'm</span>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={cart.length === 0 || !selectedTable || isSubmitting}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary-500/30 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> Buyurtmani tasdiqlash
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewOrderModal;
