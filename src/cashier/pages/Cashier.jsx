import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WalletCards,
  Search,
  CreditCard,
  Banknote,
  QrCode,
  PieChart,
  Receipt,
  History,
  RotateCcw,
  User,
  Clock,
  Printer,
  Share2,
  CheckCircle2,
  Split,
  X
} from 'lucide-react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import useOrderStore from '@/store/orders/orderStore';
import { orderService } from '@/shared/services/orderService';
import { posService } from '@/shared/services/posService';
import { tableService } from '@/shared/services/tableService';
import { ORDER_STATUS, TABLE_STATUS, STATUS_COLORS } from '@/shared/constants/statuses';
import { financeUtils } from '@/shared/utils/finances';
import { useFetch } from '@/shared/hooks/useFetch';
import useCashierStore from '@/store/orders/cashierStore';
import SplitBillModal from '../components/SplitBillModal';

const Cashier = () => {
  const t = TRANSLATIONS?.cashier;
  const common = TRANSLATIONS?.common;

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'paid'
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Discount & Fee State
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'fixed'
  const [useServiceFee, setUseServiceFee] = useState(true);

  // Advanced Filters
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'today', 'yesterday'

  // Mixed Payment State
  const [splitAmounts, setSplitAmounts] = useState({ card: 0, cash: 0, qr: 0 });
  const receiptTimeoutRef = useRef(null);

  const orders = useOrderStore(state => state.orders);
  const splitOrder = useOrderStore(state => state.splitOrder);
  const startPolling = useOrderStore(state => state.startPolling);
  const stopPolling = useOrderStore(state => state.stopPolling);
  const logTransaction = useCashierStore(state => state.logTransaction);
  
  // Requirement: Instant Synchronization
  // Use a combination of Zustand reactivity and background polling
  const refresh = async () => {
    try {
      await orderService.fetchAll();
    } catch (err) {
      console.error('[Cashier] Data refresh failed:', err);
    }
  };

  useEffect(() => {
    startPolling('cashier', 5000);
    return () => {
      stopPolling('cashier');
      if (receiptTimeoutRef.current) {
        clearTimeout(receiptTimeoutRef.current);
      }
    };
  }, [startPolling, stopPolling]);



  if (!t) return null;

  // Filters
  const pendingBills = useMemo(() => orders.filter(o =>
    [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED].includes(o.status) &&
    ((o.id || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || String(o.tableNumber ?? '').toLowerCase().includes((searchQuery || '').toLowerCase()))
  ).sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0);
    const dateB = new Date(b.updatedAt || 0);
    return dateB - dateA;
  }), [orders, searchQuery]);

  const paidBills = useMemo(() => orders.filter(o =>
    [ORDER_STATUS.PAID, ORDER_STATUS.COMPLETED, ORDER_STATUS.REFUNDED, ORDER_STATUS.CANCELLED].includes(o.status) &&
    ((o.id || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
     String(o.tableNumber ?? '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
     (o.customerName || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
  ).sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0);
    const dateB = new Date(b.updatedAt || 0);
    return dateB - dateA;
  }), [orders, searchQuery]);

  const applyAdvancedFilters = useCallback((list) => {
    return list.filter(bill => {
      // Payment Method Filter
      if (filterMethod !== 'all' && bill.paymentMethod !== filterMethod) return false;

      // Date Filter
      if (filterDate !== 'all') {
        const billDate = new Date(bill.updatedAt);
        const today = new Date();
        if (filterDate === 'today' && billDate.toDateString() !== today.toDateString()) return false;
        if (filterDate === 'yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (billDate.toDateString() !== yesterday.toDateString()) return false;
        }
      }
      return true;
    });
  }, [filterMethod, filterDate]);

  // Professional Session Merging Logic
  const activeSessions = useMemo(() => {
    if (activeTab !== 'pending') return [];
    
    const sessions = {};
    pendingBills.forEach(order => {
      const key = order.tableId || `table-${order.tableNumber}`;
      if (!sessions[key]) {
        sessions[key] = {
          id: `SESSION-${key}-${order.createdAt}`,
          isSession: true,
          tableId: order.tableId,
          tableNumber: order.tableNumber,
          customerName: order.customerName,
          waiterName: order.waiterName,
          items: [],
          orderIds: [],
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          status: order.status,
        };
      }
      
      // Accumulate session items
      sessions[key].items = [...sessions[key].items, ...(order.items || [])];
      sessions[key].orderIds.push(order.id);
      
      // Update session timestamp for "Move to Top" requirement
      if (new Date(order.updatedAt) > new Date(sessions[key].updatedAt)) {
        sessions[key].updatedAt = order.updatedAt;
        sessions[key].status = order.status; // Pick most recent batch status
      }
    });

    // Final sorting: Newest activity first
    return Object.values(sessions).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [pendingBills, activeTab]);

  const displayedBills = activeTab === 'pending' ? activeSessions : applyAdvancedFilters(paidBills);

  // Grouping logic: Synchronized Table View
  const groupedBills = useMemo(() => {
    const groups = [];
    const seenTables = new Set();

    displayedBills.forEach(bill => {
      const tableKey = bill.tableNumber || 'Generic';
      if (!seenTables.has(tableKey)) {
        seenTables.add(tableKey);
        // Find all bills for this table within the current displayed list
        const tableBills = displayedBills.filter(b => (b.tableNumber || 'Generic') === tableKey);
        groups.push({
          tableNumber: tableKey,
          bills: tableBills
        });
      }
    });

    return groups;
  }, [displayedBills]);

  // Keep selectedBill in sync with session data
  const liveBill = useMemo(() => {
    if (!selectedBill) return null;
    if (selectedBill.isSession) {
      return activeSessions.find(s => s.tableId === selectedBill.tableId) || selectedBill;
    }
    return orders.find(o => o.id === selectedBill.id) || selectedBill;
  }, [orders, activeSessions, selectedBill]);

  const financialTotals = useMemo(() => {
    if (!liveBill) return { subtotal: 0, discountAmount: 0, serviceFee: 0, tax: 0, total: 0 };
    const items = liveBill.items || [];
    const dv = Number(discountValue) || 0;
    
    return financeUtils.calculateOrderTotals(
      items, 
      discountType === 'percent' ? dv / 100 : dv,
      0.12, // tax
      useServiceFee ? 0.10 : 0
    );
  }, [liveBill, discountValue, discountType, useServiceFee]);

  const handleProcessPayment = async () => {
    if (!liveBill) {
      console.warn('[Cashier] Attempted payment without active bill selection');
      return;
    }

    const finalTotal = financialTotals.total;

    // PROFESSIONAL VALIDATION GATE
    if (finalTotal <= 0 && liveBill.items?.length > 0) {
      console.error('[Cashier] Invalid payment total:', finalTotal);
      alert(t.invalidAmount || "To'lov summasi noto'g'ri");
      return;
    }

    if (paymentMethod === 'mixed') {
      const splitTotal = Number(splitAmounts.card) + Number(splitAmounts.cash) + Number(splitAmounts.qr);
      // Allow a tiny margin for float math if necessary, but here we use ints usually
      if (Math.abs(splitTotal - finalTotal) > 1) { 
        alert(`To'lov summasi mos kelmadi. Kiritilgan: ${financeUtils.formatCurrency(splitTotal)}, Kerak: ${financeUtils.formatCurrency(finalTotal)}`);
        return;
      }
    }

    setIsProcessing(true);
    try {
      const orderIds = liveBill.isSession ? liveBill.orderIds : [liveBill.id];

      // Multi-order atomic payment processing
      let remainingCard = Number(splitAmounts.card) || 0;
      let remainingCash = Number(splitAmounts.cash) || 0;
      let remainingQr = Number(splitAmounts.qr) || 0;

      for (let i = 0; i < orderIds.length; i++) {
        const orderId = orderIds[i];
        const isLast = i === orderIds.length - 1;
        
        if (paymentMethod === 'mixed') {
          const order = useOrderStore.getState().orders.find(o => o.id === orderId);
          let orderTotal = order ? order.total : 0;
          const splits = [];
          
          if (remainingCard > 0) {
            const amount = Math.min(orderTotal, remainingCard);
            splits.push({ method: 'card', amount });
            remainingCard -= amount;
            orderTotal -= amount;
          }
          if (orderTotal > 0 && remainingCash > 0) {
            const amount = Math.min(orderTotal, remainingCash);
            splits.push({ method: 'cash', amount });
            remainingCash -= amount;
            orderTotal -= amount;
          }
          if (orderTotal > 0 && remainingQr > 0) {
            const amount = Math.min(orderTotal, remainingQr);
            splits.push({ method: 'qr', amount });
            remainingQr -= amount;
            orderTotal -= amount;
          }
          
          // Only process split if there's actually an amount allocated
          if (splits.length > 0) {
            await posService.processSplitPayment(orderId, splits);
            // After split payment, transition status with skipTableSideEffects
            await orderService.transitionStatus(orderId, ORDER_STATUS.PAID, '', !isLast);
          } else {
            // Fallback just in case orderTotal was 0
            await orderService.transitionStatus(orderId, ORDER_STATUS.PAID, '', !isLast);
          }
        } else {
          // Single payment method processing
          await orderService.transitionStatus(orderId, ORDER_STATUS.PAID, '', !isLast);
        }
      }

      logTransaction({
        orderId: liveBill.id,
        amount: finalTotal,
        method: paymentMethod,
        tableNumber: liveBill.tableNumber,
        discount: financialTotals.discountAmount,
        serviceFee: financialTotals.serviceFee
      });

      // Table state transition to CLEANING is already handled atomically inside orderService.transitionStatus
      setSelectedBill(null);
      await refresh();
    } catch (error) {
      console.error('[Cashier] Payment Workflow Critical Failure:', {
        error,
        session: liveBill.id,
        method: paymentMethod,
        total: financialTotals.total
      });
      alert(t.paymentError || "To'lov jarayonida texnik xatolik yuz berdi");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    if (!liveBill) return;
    const reason = window.prompt(t.refundReason);
    if (!reason) return;

    setIsProcessing(true);
    try {
      await posService.processRefund(liveBill.id, reason);
      setSelectedBill(null);
      refresh();
    } catch (err) {
      alert(common.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    if (!liveBill) return;
    setReceiptOrder({
      ...liveBill,
      ...financialTotals,
      cashierName: 'Admin', // In a real app, get from auth store
      timestamp: new Date().toISOString()
    });
  };

  const handleShare = () => {
    if (navigator.share && liveBill) {
      navigator.share({
        title: `Hisob #${liveBill.id}`,
        text: `Restoran hisobi: ${financeUtils.formatCurrency(liveBill.total)}`,
      }).catch(console.error);
    } else {
      alert("Qurilmangiz ulashishni qo'llab-quvvatlamaydi.");
    }
  };

  return (
    <div className="h-full w-full flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 overflow-hidden">
      {/* Left Column: Bills & Filters (Grouped correctly) */}
      <div className={`lg:col-span-7 xl:col-span-8 flex flex-col gap-4 sm:gap-6 overflow-hidden h-full min-h-0 ${selectedBill ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 tracking-tight">{t.title}</h1>
            <p className="dark:text-slate-400 text-slate-500 mt-0.5 sm:mt-1 text-[10px] sm:text-sm">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const stats = await posService.getShiftReport();
                alert(`${t.shiftReport}:\n${common.revenue}: ${financeUtils.formatCurrency(stats.sales)}\n${common.orders}: ${stats.orders}`);
              }}
              className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 border dark:border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <History className="w-3.5 h-3.5" /> {t.shiftReport}
            </button>
            <button
              onClick={() => {
                if (window.confirm(t.confirmCloseShift)) {
                  alert(t.shiftClosed);
                }
              }}
              className="px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t.closeShift}
            </button>
          </div>
        </div>

        {/* Tabs & Search Row */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex gap-2 p-1 bg-slate-100/50 dark:bg-white/5 rounded-[18px] w-fit">
            <button
              onClick={() => { setActiveTab('pending'); setSelectedBill(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'pending' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
            >
              {t.activeBills} ({pendingBills.length})
            </button>
            <button
              onClick={() => { setActiveTab('paid'); setSelectedBill(null); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'paid' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
            >
              <History className="w-3.5 h-3.5" /> {t.orderHistory}
            </button>
          </div>

          <div className="relative group flex-[2] w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder={common.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl pl-11 pr-5 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-bold dark:text-white text-slate-900 placeholder:text-slate-400 backdrop-blur-xl"
            />
          </div>

          <div className="flex gap-2 flex-1 w-full md:w-auto">
            <select 
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="flex-1 bg-white/60 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none dark:text-white cursor-pointer hover:border-primary-500/30 transition-colors"
            >
              <option value="all">{t.methods.all}</option>
              <option value="card">{t.methods.card}</option>
              <option value="cash">{t.methods.cash}</option>
              <option value="qr">{t.methods.qr}</option>
            </select>
            <select 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="flex-1 bg-white/60 dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none dark:text-white cursor-pointer hover:border-primary-500/30 transition-colors"
            >
              <option value="all">{t.filterDate.all}</option>
              <option value="today">{t.filterDate.today}</option>
              <option value="yesterday">{t.filterDate.yesterday}</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-8 no-scrollbar">
          {groupedBills.map(({ tableNumber, bills }) => (
            <div key={tableNumber} className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Stol #{tableNumber}</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
              </div>
              
              <div className="space-y-3">
                {bills.map((bill) => (
                  <motion.div
                    key={bill.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedBill(bill)}
                    className={`glass-card p-4 sm:p-6 cursor-pointer border-l-4 transition-all relative overflow-hidden ${selectedBill?.id === bill.id ? 'border-l-primary-500 bg-primary-500/5' : 'border-l-transparent'
                      }`}
                  >
                    {bill.status === ORDER_STATUS.REFUNDED && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase px-2 sm:px-3 py-1 rounded-bl-xl">Qaytarilgan</div>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 sm:gap-5">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-lg shrink-0 ${bill.status === ORDER_STATUS.PAID ? 'bg-green-500/10 text-green-500' : 'bg-primary-500/10 text-primary-500'}`}>
                          {bill.tableNumber || '??'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold dark:text-white text-slate-900">
                              {bill.isSession ? `Sessiya: #${bill.orderIds[0].split('-')[1]}` : `Buyurtma: #${bill.id}`}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${STATUS_COLORS[bill.status] || 'bg-slate-500'} text-white`}>
                              {(TRANSLATIONS?.orders?.statuses || {})[bill.status] || bill.status}
                            </span>
                            {bill.isSession && bill.orderIds.length > 1 && (
                              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-primary-500/10 text-primary-500 border border-primary-500/20">
                                {bill.orderIds.length} Partiya
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] dark:text-slate-400 text-slate-500 mt-1.5 font-bold">
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3 opacity-50" /> {bill.customerName || 'Mehmon'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                              <Clock className="w-3 h-3 opacity-50" />
                              {new Date(bill.updatedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {bill.isSession && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                                <span className="text-[10px] text-primary-500 uppercase tracking-widest">Aktiv Sessiya</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base sm:text-lg font-black text-primary-500 tracking-tight">{financeUtils.formatCurrency(bill.total)}</p>
                        <p className="text-[9px] sm:text-[10px] dark:text-slate-500 text-slate-400 uppercase font-black tracking-widest mt-0.5">{bill.items?.length || 0} {common.items}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {displayedBills.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
              <WalletCards className="w-16 h-16 mb-4" />
              <p className="text-xl font-black uppercase tracking-widest">Hozircha hisoblar yo'q</p>
            </div>
          )}
        </div>
      </div>
      {/* Payment Terminal */}
      <AnimatePresence>
        {(selectedBill || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`w-full lg:col-span-5 xl:col-span-4 flex flex-col lg:h-full min-h-0 ${!selectedBill ? 'hidden lg:flex' : 'fixed inset-0 z-50 bg-slate-50 dark:bg-[#050505] lg:relative lg:bg-transparent lg:z-0 p-4 sm:p-6 lg:p-0'}`}
          >
            {selectedBill && (
              <button
                onClick={() => setSelectedBill(null)}
                className="lg:hidden absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-[20px] bg-slate-200/50 dark:bg-white/5 z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}

            <div className="glass-card flex-1 flex flex-col overflow-hidden shadow-xl border-l dark:border-white/5 border-slate-200/50">
              {/* Header: Clean & Compact */}
              <div className="px-6 py-5 border-b dark:border-white/5 border-slate-100 flex justify-between items-center bg-white/50 dark:bg-white/[0.01]">
                <div>
                  <h3 className="text-lg font-black tracking-tight dark:text-white text-slate-900 leading-none mb-1.5">{t.payment}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-[10px] dark:text-slate-500 text-slate-400 font-black uppercase tracking-wider">
                      {liveBill ? `${common.table} #${liveBill.tableNumber || '??'}` : t.chooseMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === 'paid' && liveBill?.status !== ORDER_STATUS.REFUNDED && (
                    <button
                      onClick={handleRefund}
                      disabled={isProcessing}
                      className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center group border border-red-500/10"
                      title={t.refund}
                    >
                      <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
                    </button>
                  )}
                  {activeTab === 'pending' && selectedBill && (
                    <button
                      onClick={() => setIsSplitModalOpen(true)}
                      className="px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-primary-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 border dark:border-white/10 border-slate-200"
                    >
                      <Split className="w-3 h-3" /> {t.split}
                    </button>
                  )}
                </div>
              </div>

              {liveBill ? (
                <>
                  <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 no-scrollbar">
                    {/* Order Content Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.orderContent}</p>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{liveBill.items?.length || 0} items</span>
                      </div>
                      <div className="space-y-1.5">
                        {liveBill.items?.map((item, idx) => (
                          <div key={item.id || `bill-item-${idx}-${item.name}`} className="flex justify-between items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-white/[0.02] border dark:border-white/5 border-slate-100 group transition-all">
                            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
                              <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-black text-[9px] sm:text-[10px] shrink-0">
                                {item.quantity}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold dark:text-white text-slate-800 truncate">{item.name}</p>
                                {item.notes && <p className="text-[9px] text-amber-500/80 font-medium truncate italic mt-0.5">{item.notes}</p>}
                              </div>
                            </div>
                            <span className="text-xs font-black dark:text-slate-300 text-slate-700 tabular-nums">
                              {financeUtils.formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className="space-y-4 pt-6 border-t dark:border-white/5 border-slate-100">
                      <div className="space-y-2.5 px-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                          <span>{t.subtotal}</span>
                          <span className="tabular-nums dark:text-white text-slate-700">{financeUtils.formatCurrency(financialTotals.subtotal)}</span>
                        </div>
                        
                        {/* Discount Row */}
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">{t.discount}</span>
                            <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg p-0.5 border dark:border-white/10 scale-90">
                              <button onClick={() => setDiscountType('percent')} className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all ${discountType === 'percent' ? 'bg-white dark:bg-white/10 shadow-sm text-primary-500' : 'text-slate-400'}`}>%</button>
                              <button onClick={() => setDiscountType('fixed')} className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all ${discountType === 'fixed' ? 'bg-white dark:bg-white/10 shadow-sm text-primary-500' : 'text-slate-400'}`}>Sum</button>
                            </div>
                          </div>
                          <input 
                            type="number" value={discountValue} 
                            onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                            className="w-16 bg-transparent border-b border-dashed border-slate-300 dark:border-white/20 text-right outline-none text-red-500 font-black tabular-nums"
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>{t.serviceCharge} (10%)</span>
                            <button onClick={() => setUseServiceFee(!useServiceFee)} className={`w-7 h-4 rounded-full transition-all relative ${useServiceFee ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useServiceFee ? 'left-3.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                          <span className="tabular-nums dark:text-white text-slate-700">{financeUtils.formatCurrency(financialTotals.serviceFee)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                          <span>{t.tax} (12%)</span>
                          <span className="tabular-nums dark:text-white text-slate-700">{financeUtils.formatCurrency(financialTotals.tax)}</span>
                        </div>
                      </div>

                      {/* Total: Prominent but Elegant */}
                      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900 dark:bg-white/5 border dark:border-white/10 shadow-lg flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{common.total}</span>
                        <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tighter leading-none">
                          {financeUtils.formatCurrency(financialTotals.total)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    {activeTab === 'pending' && (
                      <div className="space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{t.chooseMethod}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'card', icon: CreditCard, label: t.methods.card },
                            { id: 'cash', icon: Banknote, label: t.methods.cash },
                            { id: 'qr', icon: QrCode, label: t.methods.qr },
                            { id: 'mixed', icon: PieChart, label: t.methods.mixed }
                          ].map((m) => (
                            <button
                              key={m.id} onClick={() => setPaymentMethod(m.id)}
                              className={`py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center gap-1 sm:gap-1.5 ${paymentMethod === m.id ? 'border-primary-500 bg-primary-500/5 shadow-md' : 'dark:border-white/5 border-slate-100 dark:bg-white/[0.02]'}`}
                            >
                              <m.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${paymentMethod === m.id ? 'text-primary-500' : 'text-slate-400'}`} />
                              <span className={`text-[8px] font-black uppercase tracking-tight ${paymentMethod === m.id ? 'dark:text-white text-slate-900' : 'text-slate-500'}`}>{m.label}</span>
                            </button>
                          ))}
                        </div>

                        {paymentMethod === 'mixed' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3 p-4 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border dark:border-white/5 border-slate-100"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border dark:border-white/10 border-slate-100">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                              </div>
                              <input type="number" value={splitAmounts.card} onChange={(e) => setSplitAmounts({ ...splitAmounts, card: e.target.value })} className="flex-1 bg-transparent border-none outline-none font-black text-sm dark:text-white" placeholder={t.methods.card} />
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border dark:border-white/10 border-slate-100">
                                <Banknote className="w-4 h-4 text-slate-400" />
                              </div>
                              <input type="number" value={splitAmounts.cash} onChange={(e) => setSplitAmounts({ ...splitAmounts, cash: e.target.value })} className="flex-1 bg-transparent border-none outline-none font-black text-sm dark:text-white" placeholder={t.methods.cash} />
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border dark:border-white/10 border-slate-100">
                                <QrCode className="w-4 h-4 text-slate-400" />
                              </div>
                              <input type="number" value={splitAmounts.qr} onChange={(e) => setSplitAmounts({ ...splitAmounts, qr: e.target.value })} className="flex-1 bg-transparent border-none outline-none font-black text-sm dark:text-white" placeholder={t.methods.qr} />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="px-4 sm:px-8 py-4 sm:py-8 border-t dark:border-white/5 border-slate-100 space-y-4 bg-white/50 dark:bg-white/[0.01]">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button onClick={handlePrint} className="flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-3 sm:py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all group active:scale-95 border dark:border-white/10 border-slate-200">
                        <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 group-hover:text-primary-500 transition-colors shrink-0" />
                        <span className="truncate">{t.printBill}</span>
                      </button>
                      <button onClick={handleShare} className="flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-3 sm:py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all group active:scale-95 border dark:border-white/10 border-slate-200">
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 group-hover:text-primary-500 transition-colors shrink-0" />
                        <span className="truncate">{common?.export}</span>
                      </button>
                    </div>
                    {activeTab === 'pending' && (
                      <button
                        onClick={handleProcessPayment}
                        disabled={isProcessing}
                        className="w-full py-5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 dark:disabled:bg-white/10 text-white rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98] group"
                      >
                        {isProcessing ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-white" />
                            <span className="text-sm font-black uppercase tracking-wider">{t.processPayment}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 rounded-[40px] bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-6">
                    <Receipt className="w-10 h-10 text-slate-500" />
                  </div>
                  <h4 className="text-lg font-bold dark:text-white text-slate-900 mb-2">{t.chooseMethod}</h4>
                  <p className="text-sm dark:text-slate-500 text-slate-500">{t.subtitle || 'To\'lovni amalga oshirish uchun chap tarafdan hisobni tanlang.'}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SplitBillModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        order={liveBill}
        onSplitComplete={async (splitItems, rawSplitTotal) => {
          if (liveBill) {
            const newOrderId = splitOrder(liveBill.id, splitItems);
            if (newOrderId) {
              // Retrieve the newly created split order to get accurate financial totals (tax, service fee)
              const newOrder = useOrderStore.getState().orders.find(o => o.id === newOrderId);
              const finalAmount = newOrder ? newOrder.total : rawSplitTotal;
              
              await posService.processSinglePayment(newOrderId, paymentMethod, finalAmount);
              
              // CRITICAL: Log this split transaction to the Cashier Shift Report
              logTransaction({
                orderId: newOrderId,
                amount: finalAmount,
                method: paymentMethod,
                tableNumber: liveBill.tableNumber,
                discount: newOrder?.discountAmount || 0,
                serviceFee: newOrder?.serviceFee || 0
              });

              alert(`Qisman to'lov (${financeUtils.formatCurrency(finalAmount)}) qayta ishlangan.`);
            }
          }
          setIsSplitModalOpen(false);
          refresh();
        }}
      />

      {/* Receipt Preview Modal */}
      <AnimatePresence>
        {receiptOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-scrollbar"
            onClick={() => setReceiptOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-900 w-full max-w-[380px] p-8 rounded-[24px] font-mono shadow-2xl relative my-auto print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button - hidden on print */}
              <button 
                onClick={() => setReceiptOrder(null)}
                className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all print:hidden"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
              
              <div id="thermal-receipt" className="print:block">
                <div className="text-center space-y-1 mb-6 border-b border-dashed border-slate-200 pb-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">{TRANSLATIONS.sidebar.appTitle}</h2>
                  <p className="text-[10px] font-bold text-slate-500">Toshkent sh., Yunusobod tumani</p>
                  <p className="text-[10px] font-bold text-slate-500">+998 90 123 45 67</p>
                </div>

                <div className="space-y-1.5 text-[10px] mb-6 font-bold uppercase text-slate-600">
                  <div className="flex justify-between"><span>{t.receipt.order}:</span> <span className="text-slate-900">#{receiptOrder.id}</span></div>
                  <div className="flex justify-between"><span>{t.receipt.table}:</span> <span className="text-slate-900">#{receiptOrder.tableNumber}</span></div>
                  <div className="flex justify-between"><span>{t.receipt.cashier}:</span> <span className="text-slate-900">{receiptOrder.cashierName}</span></div>
                  <div className="flex justify-between"><span>{t.receipt.date}:</span> <span className="text-slate-900">{new Date(receiptOrder.timestamp).toLocaleString('uz-UZ')}</span></div>
                </div>

                <div className="border-b border-dashed border-slate-200 pb-4 mb-4">
                  <div className="grid grid-cols-12 text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest">
                    <span className="col-span-7">{t.receipt.name}</span>
                    <span className="col-span-2 text-center">{t.receipt.qty}</span>
                    <span className="col-span-3 text-right">{t.receipt.price}</span>
                  </div>
                  <div className="space-y-2">
                    {receiptOrder.items?.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-[11px] font-bold text-slate-800 leading-tight">
                        <span className="col-span-7 break-words">{item.name}</span>
                        <span className="col-span-2 text-center">x{item.quantity}</span>
                        <span className="col-span-3 text-right">{financeUtils.formatCurrency(item.price * item.quantity).replace('UZS', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-[11px] border-b border-dashed border-slate-200 pb-4 mb-4 font-bold text-slate-600">
                  <div className="flex justify-between"><span>{t.subtotal}:</span> <span className="text-slate-900">{financeUtils.formatCurrency(receiptOrder.subtotal)}</span></div>
                  {receiptOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600"><span>{t.discount}:</span> <span>-{financeUtils.formatCurrency(receiptOrder.discountAmount)}</span></div>
                  )}
                  {receiptOrder.serviceFee > 0 && (
                    <div className="flex justify-between"><span>{t.serviceCharge} (10%):</span> <span className="text-slate-900">{financeUtils.formatCurrency(receiptOrder.serviceFee)}</span></div>
                  )}
                  <div className="flex justify-between"><span>{t.tax} (12%):</span> <span className="text-slate-900">{financeUtils.formatCurrency(receiptOrder.tax)}</span></div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-base font-black uppercase text-slate-900">{common.total}:</span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">{financeUtils.formatCurrency(receiptOrder.total)}</span>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-[3px] text-slate-400">{t.receipt.thanks}</p>
                  <div className="flex justify-center pt-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <QrCode className="w-10 h-10 text-slate-900 opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button - hidden on print */}
              <div className="mt-8 flex gap-3 print:hidden">
                <button 
                  onClick={() => {
                    const printStyles = `
                      @media print {
                        body * { visibility: hidden; }
                        #thermal-receipt, #thermal-receipt * { visibility: visible; }
                        #thermal-receipt {
                          position: absolute;
                          left: 0;
                          top: 0;
                          width: 80mm; /* Standard receipt width */
                          margin: 0;
                          padding: 10mm;
                          background: white;
                        }
                      }
                    `;
                    const styleSheet = document.createElement("style");
                    styleSheet.innerText = printStyles;
                    document.head.appendChild(styleSheet);
                    
                    window.print();
                    
                    document.head.removeChild(styleSheet);
                    // Automatically close after print dialog opens
                    // setTimeout ensures the dialog is handled before closing the UI
                    if (receiptTimeoutRef.current) {
                      clearTimeout(receiptTimeoutRef.current);
                    }
                    receiptTimeoutRef.current = setTimeout(() => {
                      setReceiptOrder(null);
                      receiptTimeoutRef.current = null;
                    }, 500);
                  }}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  <Printer className="w-4 h-4" /> {t.receipt.print}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cashier;
