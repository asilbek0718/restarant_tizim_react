import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, CheckCircle, MapPin, Phone, User, Move, Plus, Minus, Trash2, Send, CreditCard } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ORDER_STATUS, TABLE_STATUS, VALID_TRANSITIONS, ITEM_STATUS } from '@/shared/constants/statuses';
import useTableStore from '@/store/tables/tableStore';
import useOrderStore from '@/store/orders/orderStore';
import { tableService } from '@/shared/services/tableService';
import { financeUtils } from '@/shared/utils/finances';
import { TRANSLATIONS } from '@/shared/constants/translations';

const OrderDetailsModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  const { isAdmin, can } = usePermissions();
  const { tables } = useTableStore();
  const [isTransferring, setIsTransferring] = React.useState(false);

  const { 
    updateItemQuantity, 
    removeItemFromOrder, 
    submitDraftToKitchen, 
    updateOrderStatus 
  } = useOrderStore();

  if (!order) return null;

  const isEditable = ![ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED, ORDER_STATUS.PAID, ORDER_STATUS.COMPLETED].includes(order.status);
  const nextStatus = VALID_TRANSITIONS[order.status]?.[0];

  const handleTransfer = async (targetTableId) => {
    if (window.confirm(`Buyurtmani #${tables.find(t => t.id === targetTableId)?.number} stolga o'tkazmoqchimisiz?`)) {
      await tableService.transferOrder(order.id, targetTableId);
      setIsTransferring(false);
      onClose();
    }
  };

  const handleNextStatus = () => {
    if (nextStatus) {
      onUpdateStatus(order.id, nextStatus);
    }
  };

  const handleSendToKitchen = () => {
    if (order.draftItems?.length > 0) {
      submitDraftToKitchen(order.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div className="bg-white/90 dark:bg-[#121212]/90 backdrop-blur-2xl w-full max-w-3xl max-h-[90vh] rounded-[32px] shadow-2xl border dark:border-white/[0.08] border-slate-200/80 flex flex-col pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-8 border-b dark:border-white/[0.08] border-slate-100 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.04] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900">Buyurtma #{order.id}</h2>
                  <p className="text-xs sm:text-sm font-bold dark:text-slate-400 text-slate-500 mt-1">{order.date} • {order.time}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                  <OrderStatusBadge status={order.status} />
                  <button onClick={onClose} className="p-2 sm:p-3 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors bg-white dark:bg-black/20 shadow-md">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 dark:text-slate-400 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-100/50 dark:bg-white/[0.04] border dark:border-white/5 border-slate-200/80/50">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary-500" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mijoz</p>
                    </div>
                    <p className="font-black text-lg dark:text-white text-slate-900">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-sm font-bold dark:text-slate-400 text-slate-500 flex items-center gap-2 mt-2">
                        <Phone className="w-3 h-3" /> {order.customerPhone}
                      </p>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-100/50 dark:bg-white/[0.04] border dark:border-white/5 border-slate-200/80/50">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Buyurtma tafsilotlari</p>
                    </div>
                    <p className="font-black text-lg dark:text-white text-slate-900">{order.type || 'Zalda'} • {order.tableNumber}-stol</p>
                    <p className="text-sm font-bold dark:text-slate-400 text-slate-500 mt-2">Ofitsiant: {order.waiterName || order.serverName || 'Staff'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CreditCard className="w-3 h-3 text-emerald-500" />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {order.paymentStatus === 'paid' ? "To'langan" : "To'lanmagan"}
                      </span>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-8 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Buyurtma izohi</p>
                    <p className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400">{order.notes}</p>
                  </div>
                )}

                <div className="bg-slate-50/50 dark:bg-white/[0.04] rounded-2xl sm:rounded-3xl border dark:border-white/5 border-slate-100 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Buyurtma tarkibi</h3>
                    {!isEditable && <span className="text-[10px] font-bold text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded">Tahrirlash bloklangan</span>}
                  </div>
                  <div className="space-y-4">
                    {/* Confirmed Items */}
                    {order.items?.map((item, idx) => (
                      <div key={item.id || `confirmed-${idx}-${item.name}`} className="flex justify-between items-center py-3 border-b dark:border-white/5 border-slate-200/80/50 last:border-0 last:pb-0">
                        <div className="flex gap-5 items-center">
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-2xl p-1">
                            {isEditable && (
                              <button 
                                onClick={() => updateItemQuantity(order.id, item.id, -1)}
                                className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            )}
                            <div className="w-8 h-8 flex items-center justify-center font-black text-sm dark:text-white">
                              {item.quantity}x
                            </div>
                            {isEditable && (
                              <button 
                                onClick={() => updateItemQuantity(order.id, item.id, 1)}
                                className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div>
                            <p className="font-black dark:text-white text-slate-900 text-base">{item.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{financeUtils.formatCurrency(item.price)}</span>
                               {item?.status && (
                                 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                   item.status === ITEM_STATUS.READY ? 'bg-green-500/10 text-green-500' :
                                   item.status === ITEM_STATUS.PREPARING ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                                   item.status === ITEM_STATUS.CANCELLED ? 'bg-red-500/10 text-red-500 line-through' :
                                   'bg-slate-500/10 text-slate-500'
                                 }`}>
                                   {item.status === ITEM_STATUS.READY ? 'Tayyor' : 
                                    item.status === ITEM_STATUS.PREPARING ? 'Tayyorlanmoqda' : 
                                    item.status === ITEM_STATUS.CANCELLED ? 'Bekor qilingan' : 
                                    item.status === ITEM_STATUS.SERVED ? 'Yetkazilgan' : 'Kutilmoqda'}
                                 </span>
                               )}
                               {item.notes && <p className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Izoh: {item.notes}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="font-black text-lg dark:text-white text-slate-900">
                            {financeUtils.formatCurrency((item.price || 0) * (item.quantity || 0))}
                          </div>
                          {item?.status && ![ITEM_STATUS.READY, ITEM_STATUS.SERVED, ITEM_STATUS.CANCELLED].includes(item.status) && (
                            <button 
                              onClick={() => {
                                if (window.confirm(`${item.name}ni bekor qilmoqchimisiz?`)) {
                                  useOrderStore.getState().cancelItem(order.id, item.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-xl"
                              title="Mahsulotni bekor qilish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Draft Items Section */}
                    {order.draftItems?.length > 0 && (
                      <div className="mt-8 pt-6 border-t dark:border-white/10 border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                             <Send className="w-3 h-3" /> Oshxonaga yuborilmagan
                           </h4>
                           <button 
                            onClick={handleSendToKitchen}
                            className="text-[10px] font-black bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600 transition-all uppercase tracking-wider"
                           >
                             Hozir yuborish
                           </button>
                        </div>
                        {order.draftItems.map((item, idx) => (
                          <div key={item.id || `draft-${idx}-${item.name}`} className="flex justify-between items-center py-3 border-b border-dashed dark:border-white/5 border-slate-200/80 last:border-0">
                            <div className="flex gap-5 items-center">
                              <div className="flex items-center gap-2 bg-amber-500/10 rounded-2xl p-1">
                                <button 
                                  onClick={() => updateItemQuantity(order.id, item.id, -1)}
                                  className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <div className="w-8 h-8 flex items-center justify-center font-black text-sm text-amber-600">
                                  {item.quantity}x
                                </div>
                                <button 
                                  onClick={() => updateItemQuantity(order.id, item.id, 1)}
                                  className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <div>
                                <p className="font-black dark:text-white text-slate-900 text-base italic">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{financeUtils.formatCurrency(item.price)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="font-black text-lg text-amber-600/60">
                                {financeUtils.formatCurrency(item.price * item.quantity)}
                              </div>
                              <button 
                                onClick={() => removeItemFromOrder(order.id, item.id)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t dark:border-white/[0.08] border-slate-200/80/80">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Oraliq jami</span>
                      <span className="font-black text-lg dark:text-white text-slate-900">{financeUtils.formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between items-center mb-3 text-red-500">
                        <span className="text-sm font-bold uppercase tracking-wider">Chegirma</span>
                        <span className="font-black text-lg">-{financeUtils.formatCurrency(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t-2 border-dashed dark:border-white/20 border-slate-300">
                      <span className="text-2xl font-bold tracking-tight dark:text-white text-slate-900 uppercase tracking-widest">Jami</span>
                      <span className="text-4xl font-black text-primary-500 tracking-tight">{financeUtils.formatCurrency(order.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-8 border-t dark:border-white/[0.08] border-slate-100 bg-slate-50/80 dark:bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 backdrop-blur-2xl">
                <button 
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-[24px] border-2 dark:border-white/[0.08] border-slate-200/80 font-black text-xs sm:text-sm dark:text-white text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-wider"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" /> Chek chiqarish
                </button>
                <div className="flex w-full sm:w-auto gap-2 sm:gap-4">
                  {can('actions:cancel_order') && (
                    <button 
                      onClick={() => onUpdateStatus && onUpdateStatus(order.id, ORDER_STATUS.CANCELLED)}
                      className="w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-[24px] bg-red-500/10 text-red-500 font-black text-xs sm:text-sm hover:bg-red-500/20 transition-all uppercase tracking-wider"
                    >
                      Bekor qilish
                    </button>
                  )}
                  {can('manage:tables') && ![ORDER_STATUS.PAID, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.status) && (
                    <button 
                      onClick={() => setIsTransferring(true)}
                      className="w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-[24px] bg-amber-500/10 text-amber-500 font-black text-xs sm:text-sm hover:bg-amber-500/20 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <Move className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Ko'chirish
                    </button>
                  )}
                  {nextStatus && (
                    <button 
                      onClick={handleNextStatus}
                      className="w-full sm:w-auto px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-[24px] bg-primary-500 hover:bg-primary-600 text-white font-black text-xs sm:text-sm transition-all shadow-[0_8px_30px_rgb(14,165,233,0.3)] hover:shadow-primary-500/50 hover:-translate-y-1 flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-wider"
                    >
                      {nextStatus === ORDER_STATUS.PREPARING && <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {nextStatus === ORDER_STATUS.READY && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {nextStatus === ORDER_STATUS.DELIVERED && <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {nextStatus === ORDER_STATUS.PAID && <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {nextStatus === ORDER_STATUS.COMPLETED && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {TRANSLATIONS?.orders?.statusActions?.[nextStatus] || nextStatus}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Transfer Table Modal Overlay */}
      <AnimatePresence>
        {isTransferring && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-white dark:bg-[#111111] rounded-[32px] p-8 pointer-events-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black dark:text-white text-slate-900">Stolni tanlang</h3>
                <button onClick={() => setIsTransferring(false)} className="p-2 rounded-full bg-slate-100 dark:bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto no-scrollbar pr-2">
                {tables.filter(t => t.status === TABLE_STATUS.EMPTY && t.id !== order.tableId).map(t => (
                  <button 
                    key={t.id}
                    onClick={() => handleTransfer(t.id)}
                    className="aspect-square rounded-2xl border-2 dark:border-white/10 border-slate-100 flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-500/5 transition-all group"
                  >
                    <span className="text-xl font-black dark:text-white text-slate-900 group-hover:text-primary-500">#{t.number}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{t.zone}</span>
                  </button>
                ))}
              </div>
              {tables.filter(t => t.status === TABLE_STATUS.EMPTY && t.id !== order.tableId).length === 0 && (
                <p className="text-center text-slate-500 font-bold py-10">Bo'sh stol topilmadi</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;

// Missing Icons
const ChefHat = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6.5 5.11 5.11 0 0 1 12.5 2a5.11 5.11 0 0 1 5.09 4.5 4 4 0 0 1 1.41 7.37 8.15 8.15 0 0 1 3 6.37 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2 8.15 8.15 0 0 1 3-6.37Z" />
    <path d="M6 18h12" />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
