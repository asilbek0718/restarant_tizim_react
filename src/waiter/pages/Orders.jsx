import React, { useState } from 'react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import { PageContainer, SectionHeader } from '@/shared/ui';
import OrderTable from '../components/orders/OrderTable';
import OrderFilterBar from '../components/orders/OrderFilterBar';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import ActiveOrdersList from '../components/orders/ActiveOrdersList';
import { Plus, ClipboardList, ChefHat, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import useOrderStore from '@/store/orders/orderStore';
import { orderService } from '@/shared/services/orderService';
import NewOrderModal from '../components/orders/NewOrderModal';
import { ORDER_STATUS } from '@/shared/constants/statuses';
import { financeUtils } from '@/shared/utils/finances';
import { motion } from 'framer-motion';

const Orders = () => {
  const t = TRANSLATIONS?.orders;
  const common = TRANSLATIONS?.common;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const { orders } = useOrderStore();

  if (!t) return null;

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (selectedOrder?.isSession && selectedOrder.orders?.length > 0) {
        // Grouped session: transition all underlying orders
        await Promise.all(selectedOrder.orders.map(o => orderService.transitionStatus(o.id, newStatus)));
      } else {
        // Single order
        await orderService.transitionStatus(orderId, newStatus);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to transition status:', error);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Buyurtma #${order.id}ni bekor qilmoqchimisiz?`)) {
      await orderService.transitionStatus(order.id, ORDER_STATUS.CANCELLED);
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = (searchQuery || "").toLowerCase();
    
    const matchesSearch = 
      (order.id || "").toLowerCase().includes(searchLower) || 
      (order.customerName || "").toLowerCase().includes(searchLower) ||
      (order.waiterName || "").toLowerCase().includes(searchLower) ||
      (order.tableNumber?.toString() || "").includes(searchLower) ||
      order.items?.some(item => (item.name || "").toLowerCase().includes(searchLower)) ||
      order.draftItems?.some(item => (item.name || "").toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all' && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      
      if (dateFilter === 'today') {
        matchesDate = orderDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        matchesDate = orderDate >= monthAgo;
      } else if (dateFilter.includes('-')) { // Custom date YYYY-MM-DD
         matchesDate = order.createdAt.startsWith(dateFilter);
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const groupedSessions = React.useMemo(() => {
    const groups = {};
    
    filteredOrders.forEach(order => {
      // Group by table session (active orders for the same table)
      const tableKey = order.tableId || `table-${order.tableNumber}`;
      
      if (!groups[tableKey]) {
        groups[tableKey] = {
          ...order,
          id: tableKey, // Session ID represented by table key
          isSession: true,
          orders: [],
          total: 0,
          items: [],
          itemsCount: 0,
          notes: order.notes,
          createdAt: order.createdAt
        };
      }
      
      const group = groups[tableKey];
      group.orders.push(order);
      group.total += (order.total || 0);
      group.items.push(...(order.items || []));
      group.itemsCount += (order.items?.length || 0);
      
      // Inherit most urgent status for the session
      const statusPriority = {
        [ORDER_STATUS.PENDING]: 4,
        [ORDER_STATUS.PREPARING]: 3,
        [ORDER_STATUS.READY]: 2,
        [ORDER_STATUS.DELIVERED]: 1,
        [ORDER_STATUS.COMPLETED]: 0,
        [ORDER_STATUS.CANCELLED]: -1,
      };
      
      if (statusPriority[order.status] > statusPriority[group.status]) {
        group.status = order.status;
      }
      
      // Combine notes
      if (order.notes && !group.notes?.includes(order.notes)) {
        group.notes = group.notes ? `${group.notes} | ${order.notes}` : order.notes;
      }
    });
    
    return Object.values(groups);
  }, [filteredOrders]);

  const activeOrdersCount = orders.filter(o => [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED].includes(o.status)).length;

  const activeOrders = orders.filter(o => [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED].includes(o.status));

  // Pipeline stats
  const pipelineStats = [
    { label: 'Yangi', key: ORDER_STATUS.PENDING, color: 'blue', icon: ClipboardList },
    { label: 'Tayyorlanmoqda', key: ORDER_STATUS.PREPARING, color: 'amber', icon: ChefHat },
    { label: 'Tayyor', key: ORDER_STATUS.READY, color: 'green', icon: CheckCircle },
    { label: 'Yetkazilgan', key: ORDER_STATUS.DELIVERED, color: 'purple', icon: Clock },
  ];

  const todayRevenue = orders
    .filter(o => o.status === ORDER_STATUS.PAID && new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <PageContainer>
      <SectionHeader 
        title={t.title} 
        description={t.subtitle} 
        actionElement={
          <button 
            onClick={() => setIsNewOrderModalOpen(true)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-[20px] bg-primary-500 hover:bg-primary-600 text-white font-black text-xs sm:text-sm transition-all shadow-lg hover:shadow-primary-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-1.5 sm:gap-2 uppercase tracking-widest whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t.newOrder || common?.add}
          </button>
        }
      />

      {/* Live Pipeline Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {pipelineStats.map(({ label, key, color, icon: Icon }) => {
          const count = orders.filter(o => o.status === key).length;
          return (
            <motion.button
              key={key}
              whileHover={{ y: -2 }}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              className={`glass-card p-5 text-left border-l-4 transition-all duration-300 ${
                statusFilter === key 
                  ? `border-l-${color}-500 bg-${color}-500/5 ring-1 ring-${color}-500/20` 
                  : 'border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 text-${color}-500`} />
                </div>
                <span className={`text-2xl font-black text-${color}-500`}>{count}</span>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">{label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Today's Revenue Banner */}
      <div className="glass-card p-4 sm:p-5 mb-6 sm:mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 border border-primary-500/10 bg-primary-500/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-primary-500" />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Bugungi daromad</p>
            <p className="text-2xl font-black text-primary-500">{financeUtils.formatCurrency(todayRevenue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-8 px-2">
          <div className="text-center">
            <p className="font-black text-2xl dark:text-white text-slate-900">{groupedSessions.length}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stollar</p>
          </div>
          <div className="text-center">
            <p className="font-black text-2xl dark:text-white text-slate-900">{activeOrdersCount}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktiv buyurtmalar</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <OrderFilterBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
        />
      </div>

      <div className="mb-8">
        <OrderTable 
          orders={groupedSessions}
          onView={handleViewDetails}
          onDelete={handleDeleteOrder}
        />
      </div>

      {/* Active Orders — Full Width Below */}
      <ActiveOrdersList 
        orders={activeOrders}
        onOrderClick={handleViewDetails}
      />

      <OrderDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onUpdateStatus={handleStatusChange}
      />

      <NewOrderModal 
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
      />
    </PageContainer>
  );
};

export default Orders;
