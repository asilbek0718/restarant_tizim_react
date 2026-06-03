import React, { useState, useEffect, useMemo } from 'react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import { PageContainer, SectionHeader } from '@/shared/ui';
import TableGrid from '../components/tables/TableGrid';
import TableFilterBar from '../components/tables/TableFilterBar';
import NewOrderModal from '../components/orders/NewOrderModal';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import useTableStore from '@/store/tables/tableStore';
import useOrderStore from '@/store/orders/orderStore';
import useReservationStore from '@/store/tables/reservationStore';
import { useFetch } from '@/shared/hooks/useFetch';
import { tableService } from '@/shared/services/tableService';
import { TABLE_STATUS, ORDER_STATUS } from '@/shared/constants/statuses';
import TableFormModal from '../components/tables/TableFormModal';
import ReservationFormModal from '../components/tables/ReservationFormModal';
import { Plus, Users, LayoutGrid, Calendar, CheckCircle2, Clock, Search, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { orderService } from '@/shared/services/orderService';

import TableManagementPanel from '../components/tables/TableManagementPanel';

const Tables = () => {
  const t = TRANSLATIONS?.tables;
  const common = TRANSLATIONS?.common;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState(null);

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Management Panel State
  const [isManagementPanelOpen, setIsManagementPanelOpen] = useState(false);
  const [managementTableId, setManagementTableId] = useState(null);

  // Selection for Merging
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);

  const tables = useTableStore(state => state.tables);
  const getStats = useTableStore(state => state.getStats);
  const updateTableStatus = useTableStore(state => state.updateTableStatus);
  const startTablePolling = useTableStore(state => state.startPolling);
  const stopTablePolling = useTableStore(state => state.stopPolling);

  const reservations = useReservationStore(state => state.reservations);
  const updateReservation = useReservationStore(state => state.updateReservation);
  const deleteReservation = useReservationStore(state => state.deleteReservation);

  const orders = useOrderStore(state => state.orders);
  const startOrderPolling = useOrderStore(state => state.startPolling);
  const stopOrderPolling = useOrderStore(state => state.stopPolling);

  const { loading, error, refresh } = useFetch(tableService.getAll, [], []);

  // Management Table (Reactive)
  const managementTable = useMemo(() => {
    return tables.map(table => {
      const tableOrders = orders.filter(o =>
        o.tableId === table.id &&
        ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.PAID].includes(o.status)
      );

      let anchorOrder = tableOrders.find(o => o.status === ORDER_STATUS.DRAFT) || tableOrders[0];
      const allItems = tableOrders.reduce((acc, o) => [...acc, ...(o.items || [])], []);
      const allDraftItems = tableOrders.reduce((acc, o) => [...acc, ...(o.draftItems || [])], []);
      const totalSum = tableOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      const tableOrder = anchorOrder ? {
        ...anchorOrder,
        items: allItems,
        draftItems: allDraftItems,
        total: totalSum
      } : null;

      const tableRes = reservations.find(r => r.tableId === table.id && r.status === 'confirmed' && r.date === new Date().toISOString().split('T')[0]);
      return { ...table, order: tableOrder, reservation: tableRes };
    }).find(t => t.id === managementTableId);
  }, [tables, orders, reservations, managementTableId]);

  useEffect(() => {
    // INITIAL DATABASE FETCH
    tableService.getAll();
    orderService.fetchAll();

    // START REALTIME
    startTablePolling();
    startOrderPolling('tables', 30000);

    return () => {
      stopTablePolling();
      stopOrderPolling('tables');
    };
  }, [startTablePolling, startOrderPolling, stopTablePolling, stopOrderPolling]);

  if (!t) return null;

  // Professional Relational Enrichment & Filtering
  const getLocalDateString = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD in local time
  };

  const filteredTables = useMemo(() => {
    return tables.map(table => {
      // Find ALL active orders for this table session
      const tableOrders = orders.filter(o =>
        o.tableId === table.id &&
        ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED, ORDER_STATUS.PAID].includes(o.status)
      );

      // Find the "Anchor" order (the one that stays as DRAFT/PENDING for additions)
      // If no draft order exists, pick the most recent one or create a fallback
      let anchorOrder = tableOrders.find(o => o.status === ORDER_STATUS.DRAFT) || tableOrders[0];

      // Aggregate all items and totals for UI display
      const allItems = tableOrders.reduce((acc, o) => [...acc, ...(o.items || [])], []);
      const allDraftItems = tableOrders.reduce((acc, o) => [...acc, ...(o.draftItems || [])], []);
      const totalSum = tableOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      const tableOrder = anchorOrder ? {
        ...anchorOrder,
        items: allItems,
        draftItems: allDraftItems,
        total: totalSum,
        originalOrders: tableOrders // Keep reference to individual batches
      } : null;

      const tableRes = reservations.find(r => r.tableId === table.id && r.status === 'confirmed' && r.date === getLocalDateString());

      return {
        ...table,
        order: tableOrder,
        reservation: tableRes
      };
    }).filter(table => {
      const tableNum = String(table.number || '');
      const tableZone = String(table.zone || '');
      const matchesSearch = tableNum.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
      const matchesZone = zoneFilter === 'all' || tableZone.toLowerCase() === zoneFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [tables, orders, reservations, searchQuery, statusFilter, zoneFilter]);

  const stats = useMemo(() => getStats(), [tables, getStats]);

  const handleConfirmReservation = async (id) => {
    updateReservation(id, { status: 'confirmed' });
    const res = reservations.find(r => r.id === id);
    if (res && res.tableId && res.date === getLocalDateString()) {
      await useTableStore.getState().syncTableStatus(res.tableId, TABLE_STATUS.RESERVED);
    }
  };

  const handleArriveReservation = async (id) => {
    const res = reservations.find(r => r.id === id);
    if (!res) return;

    if (window.confirm(`${res.customerName} keldimi? Stolni band qilish holatiga o'tkazamizmi?`)) {
      // 1. Update reservation status to arrived
      updateReservation(id, { status: 'arrived' });

      // 2. Mark table as occupied and create active order session
      await orderService.occupyTable(res.tableId, res.tableNumber);
    }
  };

  const handleCancelReservation = async (id) => {
    if (window.confirm('Haqiqatan ham ushbu band qilishni bekor qilmoqchimisiz?')) {
      const res = reservations.find(r => r.id === id);
      if (res && res.tableId && (res.status === 'confirmed' || res.status === 'pending')) {
        const table = tables.find(t => t.id === res.tableId);
        if (table && table.status === TABLE_STATUS.RESERVED) {
          await useTableStore.getState().syncTableStatus(res.tableId, TABLE_STATUS.EMPTY);
        }
      }
      updateReservation(id, { status: 'cancelled' });
    }
  };

  const handleEditReservation = (res) => {
    setSelectedReservation(res);
    setIsReservationModalOpen(true);
  };

  const handleAddReservation = () => {
    setSelectedReservation(null);
    setIsReservationModalOpen(true);
  };

  const handleTableClick = async (table, action = null) => {
    if (isSelectionMode) {
      if (selectedTables.includes(table.id)) {
        setSelectedTables(selectedTables.filter(id => id !== table.id));
      } else {
        if (selectedTables.length < 2) {
          setSelectedTables([...selectedTables, table.id]);
        }
      }
      return;
    }

    if (table.mergedInto) {
      alert(`Bu stol #${tables.find(t => t.id === table.mergedInto)?.number} bilan birlashtirilgan.`);
      return;
    }

    // Handle explicit actions from TableCard
    if (action === 'reserve') {
      setSelectedReservation({ tableId: table.id, tableNumber: table.number });
      setIsReservationModalOpen(true);
      return;
    }

    if (action === 'occupy') {
      if (window.confirm(`${table.number}-stolni band qilmoqchimisiz?`)) {
        await orderService.occupyTable(table.id, table.number);
      }
      return;
    }

    if (action === 'occupy_reserved') {
      if (window.confirm('Mijoz keldimi? Stolni band (Occupied) holatiga o\'tkazasizmi?')) {
        await orderService.occupyTable(table.id, table.number);
      }
      return;
    }

    // Default interactions based on status
    if (table.status === TABLE_STATUS.EMPTY) {
      // Just select the table or show actions
      setManagementTableId(table.id);
      return;
    }

    if (table.status === TABLE_STATUS.OCCUPIED || table.status === TABLE_STATUS.CLEANING || table.status === TABLE_STATUS.WAITING_PAYMENT || table.status === TABLE_STATUS.RESERVED) {
      // Open all-in-one management panel
      setManagementTableId(table.id);
      setIsManagementPanelOpen(true);
      return;
    }
  };

  const handleMergeTables = async () => {
    if (selectedTables.length !== 2) return;
    if (window.confirm('Haqiqatan ham ushbu stollarni birlashtirmoqchimisiz?')) {
      await tableService.merge(selectedTables[0], selectedTables[1]);
      setIsSelectionMode(false);
      setSelectedTables([]);
    }
  };

  const handleSplitTable = async (tableId) => {
    if (window.confirm('Stollarni ajratmoqchimisiz?')) {
      await tableService.split(tableId);
    }
  };

  const handleTableSecondaryAction = (table) => {
    if (table.status === TABLE_STATUS.EMPTY) {
      setSelectedReservation({ tableId: table.id, tableNumber: table.number });
      setIsReservationModalOpen(true);
    } else {
      setSelectedTable(table);
      setIsTableModalOpen(true);
    }
  };

  const handleAddTable = () => {
    setSelectedTable(null);
    setIsTableModalOpen(true);
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    await orderService.transitionStatus(orderId, newStatus);
    setIsOrderDetailsOpen(false);
  };


  if (loading && !tables.length) {
    return (
      <PageContainer>
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Stollar yuklanmoqda...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
        <SectionHeader
          title={t.title}
          description={t.subtitle}
          className="mb-0"
        />

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {isSelectionMode ? (
            <div className="flex items-center gap-2 bg-primary-500/10 p-1.5 rounded-[24px] border border-primary-500/20">
              <button
                onClick={() => { setIsSelectionMode(false); setSelectedTables([]); }}
                className="px-6 py-3.5 bg-white dark:bg-white/5 dark:text-white text-slate-700 rounded-[18px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Bekor qilish
              </button>
              <button
                disabled={selectedTables.length !== 2}
                onClick={handleMergeTables}
                className="px-8 py-3.5 bg-primary-500 text-white rounded-[18px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 disabled:opacity-50 hover:bg-primary-600 transition-all"
              >
                Birlashtirish ({selectedTables.length}/2)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsSelectionMode(true)}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-white/5 border dark:border-white/10 rounded-xl sm:rounded-[20px] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="truncate">Birlashtirish</span>
              </button>
              <button
                onClick={handleAddTable}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3.5 bg-primary-500 text-white rounded-xl sm:rounded-[20px] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="truncate">Stol qo'shish</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
        <StatCard
          icon={CheckCircle2}
          label="Bo'sh stollar"
          value={stats.available}
          color="green"
          trend={`${stats.total} dan ${stats.available} ta`}
        />
        <StatCard
          icon={Users}
          label="Band stollar"
          value={stats.occupied}
          color="blue"
          trend={`${stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0}% bandlik`}
        />
        <StatCard
          icon={Calendar}
          label="Bron qilingan"
          value={stats.reserved}
          color="amber"
          trend="Bugun uchun"
        />
        <StatCard
          icon={Clock}
          label="Tozalashda"
          value={stats.cleaning}
          color="purple"
          trend="Tez orada bo'shash"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-8 sm:mb-12">
        <TableFilterBar
          onSearch={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          zoneFilter={zoneFilter}
          onZoneChange={setZoneFilter}
        />
      </div>

      {/* Main Tables Section */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
            <h3 className="text-xl font-black dark:text-white text-slate-900 tracking-tight">Zallar va Stollar</h3>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full">
            Jami: {filteredTables.length} stol
          </div>
        </div>

        <TableGrid
          tables={filteredTables}
          onTableClick={handleTableClick}
          onSecondaryAction={handleTableSecondaryAction}
          selectedIds={selectedTables}
          onSplit={handleSplitTable}
        />
      </section>

      {/* Reservations Section — Moved Below */}
      <section className="pt-8 sm:pt-12 border-t dark:border-white/5 border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-amber-500 rounded-full"></div>
            <h3 className="text-lg sm:text-xl font-black dark:text-white text-slate-900 tracking-tight">Bugungi band qilishlar</h3>
          </div>
          <button
            onClick={handleAddReservation}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl sm:rounded-[18px] font-black text-[10px] sm:text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 uppercase tracking-widest"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Yangi bron
          </button>
        </div>

        <div className="bg-white dark:bg-[#111111] rounded-[32px] border dark:border-white/5 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b dark:border-white/5">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Stol</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Zal</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mijoz</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Telefon</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Soat</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Holat</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-white/5">
                {reservations.filter(r => r.status !== 'cancelled').map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <span className="text-sm font-black text-amber-500">#{res.tableNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black dark:text-white text-slate-900 uppercase tracking-tight">{res.zone}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold dark:text-white text-slate-900">{res.customerName}</span>
                        {res.notes && <span className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-[200px]">{res.notes}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium text-slate-500">{res.phone}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${res.status === 'confirmed' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-xs font-black dark:text-white text-slate-900">{res.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {res.status === 'confirmed' ? (
                        <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Bron qilingan</span>
                      ) : res.status === 'arrived' ? (
                        <span className="px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">Mijoz keldi</span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest border dark:border-white/10">Kutilmoqda</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {res.status === 'pending' && (
                          <button
                            onClick={() => handleConfirmReservation(res.id)}
                            className="p-2 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                            title="Tasdiqlash"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => handleArriveReservation(res.id)}
                            className="px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                            title="Mijoz keldi"
                          >
                            <Users className="w-3.5 h-3.5" /> Keldi
                          </button>
                        )}
                        <button
                          onClick={() => handleEditReservation(res)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-primary-500 hover:text-white transition-all"
                          title="Tahrirlash"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelReservation(res.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Bekor qilish"
                        >
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reservations.filter(r => r.status !== 'cancelled').length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hozircha bronlar yo'q</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>


      <TableManagementPanel
        table={managementTable}
        isOpen={isManagementPanelOpen}
        onClose={() => setIsManagementPanelOpen(false)}
      />

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        initialTableId={selectedTableForOrder}
      />

      <TableFormModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        table={selectedTable}
      />

      <ReservationFormModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        reservation={selectedReservation}
      />

      <OrderDetailsModal
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        order={selectedOrder}
        onUpdateStatus={handleOrderStatusUpdate}
      />
    </PageContainer>
  );
};

/**
 * Professional Stat Card Component
 */
const StatCard = ({ icon: Icon, label, value, color, trend }) => {
  const colors = {
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className="glass-card p-4 sm:p-6 flex items-center gap-3 sm:gap-5 border dark:border-white/5 hover:border-primary-500/30 transition-all group rounded-2xl sm:rounded-3xl">
      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-[20px] shrink-0 flex items-center justify-center border ${colors[color]}`}>
        <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{label}</p>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <p className="text-xl sm:text-3xl font-black dark:text-white text-slate-900 truncate">{value}</p>
          {trend && <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 truncate max-w-[80px] sm:max-w-none">{trend}</span>}
        </div>
      </div>
    </div>
  );
};

export default Tables;
