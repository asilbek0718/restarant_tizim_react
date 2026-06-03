import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ORDER_STATUS, VALID_TRANSITIONS, ITEM_STATUS } from '../../shared/constants/statuses';
import { financeUtils } from '../../shared/utils/finances';

/**
 * Enterprise Order Engine
 * Backend-ready: starts empty, supports async state and financial rules.
 */
const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      activeOrderId: null,
      loading: false,
      error: null,
      
      // Sync Actions
      setOrders: (orders) => set({ orders }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setActiveOrder: (id) => set({ activeOrderId: id }),

      /**
       * Adds a new order to the state
       * Used after backend success or for optimistic updates
       */
      addOrder: (orderData) => {
        const id = orderData.id;
        
        const financialBreakdown = financeUtils.calculateOrderTotals(
          orderData.items || [], 
          orderData.discount || 0
        );

        const newOrder = {
          ...orderData,
          id,
          status: orderData.status || ORDER_STATUS.PENDING,
          paymentStatus: orderData.paymentStatus || 'unpaid',
          customerCount: orderData.customerCount || 1,
          waiterId: orderData.waiterId || null,
          waiterName: orderData.waiterName || 'Staff',
          notes: orderData.notes || '',
          items: orderData.items || [],
          draftItems: orderData.draftItems || [],
          ...financialBreakdown,
          createdAt: orderData.createdAt || new Date().toISOString(),
          updatedAt: orderData.updatedAt || new Date().toISOString(),
          preparationStartTime: orderData.preparationStartTime || null,
          preparationEndTime: orderData.preparationEndTime || null,
          history: orderData.history || [
            { 
              status: ORDER_STATUS.PENDING, 
              time: new Date().toISOString(), 
              note: 'Buyurtma yaratildi' 
            }
          ]
        };

        set((state) => ({ 
          orders: [newOrder, ...state.orders],
          activeOrderId: id
        }));
        
        return newOrder;
      },

      /**
       * Updates order status in state
       */
      updateOrderStatus: (orderId, newStatus, note = '', metadata = {}) => {
        const { orders } = get();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) return false;

        set((state) => ({
          orders: state.orders.map(o => {
            if (o.id === orderId) {
              const now = new Date().toISOString();
              let updates = {
                status: newStatus,
                updatedAt: now,
                history: [...(o.history || []), { status: newStatus, time: now, note }]
              };

              if (newStatus === ORDER_STATUS.PREPARING) updates.preparationStartTime = now;
              if (newStatus === ORDER_STATUS.READY) updates.preparationEndTime = now;
              if (newStatus === ORDER_STATUS.PAID) {
                updates.paymentStatus = 'paid';
                if (metadata.payment) updates.payment = metadata.payment;
              }

              // When whole order becomes DELIVERED/COMPLETED, update all non-cancelled items
              if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED].includes(newStatus)) {
                updates.items = (o.items || []).map(item => ({
                  ...item,
                  status: item.status === ITEM_STATUS.CANCELLED ? ITEM_STATUS.CANCELLED : (newStatus === ORDER_STATUS.DELIVERED ? ITEM_STATUS.SERVED : item.status)
                }));
              }

              return { ...o, ...updates };
            }
            return o;
          })
        }));
        
        return true;
      },

      updateOrderItems: (orderId, items, isDraft = false) => set((state) => ({
        orders: state.orders.map(o => {
          if (o.id === orderId) {
            const sanitizedItems = items.map(item => ({
              ...item,
              id: item.id || `ITM-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              status: item.status || (isDraft ? 'draft' : ITEM_STATUS.PENDING),
              addedAt: item.addedAt || new Date().toISOString()
            }));

            // Recalculate totals including both confirmed and draft items
            const allItems = isDraft ? [...(o.items || []), ...sanitizedItems] : [...sanitizedItems, ...(o.draftItems || [])];
            const financialBreakdown = financeUtils.calculateOrderTotals(allItems, o.discountAmount);

            return {
              ...o,
              [isDraft ? 'draftItems' : 'items']: sanitizedItems,
              ...financialBreakdown,
              updatedAt: new Date().toISOString()
            };
          }
          return o;
        })
      })),

      addItemToDraft: (orderId, newItem) => {
        const { orders } = get();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const draftItems = [...(order.draftItems || [])];
        const existingIndex = draftItems.findIndex(i => i.id === newItem.id || i.name === newItem.name);

        if (existingIndex > -1 && !newItem.forceNewInstance) {
          draftItems[existingIndex] = { 
            ...draftItems[existingIndex], 
            quantity: draftItems[existingIndex].quantity + (newItem.quantity || 1) 
          };
        } else {
          draftItems.push({
            ...newItem,
            id: `ITM-D-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            status: 'draft',
            addedAt: new Date().toISOString(),
            quantity: newItem.quantity || 1
          });
        }

        get().updateOrderItems(orderId, draftItems, true);
      },

      updateDraftItemQuantity: (orderId, itemId, delta) => {
        const { orders } = get();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const draftItems = (order.draftItems || []).map(i => {
          if (i.id === itemId) {
            return { ...i, quantity: Math.max(1, i.quantity + delta) };
          }
          return i;
        });

        get().updateOrderItems(orderId, draftItems, true);
      },

      removeDraftItem: (orderId, itemId) => {
        const { orders } = get();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const draftItems = (order.draftItems || []).filter(i => i.id !== itemId);
        get().updateOrderItems(orderId, draftItems, true);
      },

      clearTableSession: (tableId) => {
        const { orders } = get();
        const now = new Date().toISOString();
        
        set((state) => ({
          orders: state.orders.map(o => {
            if (o.tableId === tableId && ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(o.status)) {
              return {
                ...o,
                status: ORDER_STATUS.COMPLETED,
                draftItems: [],
                items: o.items || [],
                updatedAt: now,
                history: [...(o.history || []), { 
                  status: ORDER_STATUS.COMPLETED, 
                  time: now, 
                  note: 'Stol bo\'shatildi, sessiya yakunlandi' 
                }]
              };
            }
            return o;
          })
        }));
      },

      submitDraftToKitchen: (orderId) => {
        const { orders, addOrder } = get();
        const sourceOrder = orders.find(o => o.id === orderId);
        if (!sourceOrder || !sourceOrder.draftItems || sourceOrder.draftItems.length === 0) return;

        const now = new Date().toISOString();
        const draftItems = [...sourceOrder.draftItems];

        // 1. Create a NEW unique order batch for the kitchen
        const kitchenOrderBatch = {
          id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          tableId: sourceOrder.tableId,
          tableNumber: sourceOrder.tableNumber,
          waiterId: sourceOrder.waiterId,
          waiterName: sourceOrder.waiterName,
          customerName: sourceOrder.customerName,
          items: draftItems.map(item => ({
            ...item,
            status: ITEM_STATUS.PENDING,
            submittedAt: now
          })),
          status: ORDER_STATUS.PENDING,
          paymentStatus: 'unpaid',
          createdAt: now,
          updatedAt: now,
          history: [{ 
            status: ORDER_STATUS.PENDING, 
            time: now, 
            note: 'Oshxonaga yuborildi' 
          }]
        };

        // 2. Add the new kitchen batch
        addOrder(kitchenOrderBatch);

        // 3. Clear draft from source order
        set((state) => ({
          orders: state.orders.map(o => {
            if (o.id === orderId) {
              // Recalculate totals for the anchor order (will now only have its confirmed items if any)
              const financialBreakdown = financeUtils.calculateOrderTotals(o.items || [], o.discountAmount);
              return {
                ...o,
                draftItems: [],
                updatedAt: now,
                ...financialBreakdown
              };
            }
            return o;
          })
        }));
      },

      splitOrder: (originalOrderId, splitItems) => {
        const { orders, addOrder, updateOrderItems } = get();
        const originalOrder = orders.find(o => o.id === originalOrderId);
        if (!originalOrder || !splitItems || splitItems.length === 0) return null;

        const now = new Date().toISOString();
        
        // Create new split order
        const newOrderId = `ORD-${Date.now()}-SPLIT`;
        const newOrder = {
          ...originalOrder,
          id: newOrderId,
          items: splitItems,
          draftItems: [],
          status: originalOrder.status === ORDER_STATUS.PAID ? ORDER_STATUS.COMPLETED : originalOrder.status,
          createdAt: now,
          updatedAt: now,
          history: [{ status: ORDER_STATUS.PENDING, time: now, note: 'Hisob bo\'lindi' }]
        };
        
        addOrder(newOrder);

        // Update original order items
        const remainingItems = [...originalOrder.items];
        splitItems.forEach(splitItem => {
          const index = remainingItems.findIndex(i => i.id === splitItem.id);
          if (index > -1) {
            if (remainingItems[index].quantity > splitItem.quantity) {
              remainingItems[index] = { ...remainingItems[index], quantity: remainingItems[index].quantity - splitItem.quantity };
            } else {
              remainingItems.splice(index, 1);
            }
          }
        });

        updateOrderItems(originalOrderId, remainingItems);
        return newOrderId;
      },

      addItemToOrder: (orderId, newItem) => {
        // Fallback or direct add (for managers)
        get().addItemToDraft(orderId, newItem);
      },

      updateItemQuantity: (orderId, itemId, delta) => {
        const { orders } = get();
        // First try to find in the specified order
        let order = orders.find(o => o.id === orderId);
        
        // If order is already being prepared, block editing
        if (order && [ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED].includes(order.status)) {
          console.warn('Cannot edit quantity after kitchen starts preparing');
          return;
        }

        // If item is in draftItems of this order, it might be in items of this or another order
        if (order && order.draftItems?.find(i => i.id === itemId)) {
          get().updateDraftItemQuantity(orderId, itemId, delta);
          return;
        }

        // Search for the item in ALL active orders for this table
        const targetOrder = orders.find(o => o.items?.find(i => i.id === itemId));
        if (targetOrder) {
          // Block if target order is already in preparation
          if ([ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED].includes(targetOrder.status)) {
            return;
          }
          const items = targetOrder.items.map(i => {
            if (i.id === itemId) return { ...i, quantity: Math.max(1, i.quantity + delta) };
            return i;
          });
          get().updateOrderItems(targetOrder.id, items);
        }
      },

      removeItemFromOrder: (orderId, itemId) => {
        const { orders } = get();
        let order = orders.find(o => o.id === orderId);

        if (order && [ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED].includes(order.status)) {
          return;
        }

        if (order && order.draftItems?.find(i => i.id === itemId)) {
          get().removeDraftItem(orderId, itemId);
          return;
        }

        const targetOrder = orders.find(o => o.items?.find(i => i.id === itemId));
        if (targetOrder) {
          if ([ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.DELIVERED].includes(targetOrder.status)) {
            return;
          }
          const items = targetOrder.items.filter(i => i.id !== itemId);
          get().updateOrderItems(targetOrder.id, items);
        }
      },

      updateItemStatus: (orderId, itemId, status) => {
        const { orders } = get();
        const targetOrder = orders.find(o => o.items?.some(i => i.id === itemId));
        
        if (targetOrder) {
          const updatedItems = targetOrder.items.map(i => {
            if (i.id === itemId) return { ...i, status };
            return i;
          });

          // Enterprise Logic: Auto-calculate order status based on item statuses
          const activeItems = updatedItems.filter(i => i.status !== ITEM_STATUS.CANCELLED);
          const allServed = activeItems.length > 0 && activeItems.every(i => i.status === ITEM_STATUS.SERVED);
          const allReady = activeItems.length > 0 && activeItems.every(i => i.status === ITEM_STATUS.READY || i.status === ITEM_STATUS.SERVED);
          const anyPreparing = activeItems.some(i => i.status === ITEM_STATUS.PREPARING);
          
          let newOrderStatus = targetOrder.status;
          if (activeItems.length === 0) newOrderStatus = ORDER_STATUS.CANCELLED;
          else if (allServed) newOrderStatus = ORDER_STATUS.DELIVERED;
          else if (allReady) newOrderStatus = ORDER_STATUS.READY;
          else if (anyPreparing && targetOrder.status === ORDER_STATUS.PENDING) newOrderStatus = ORDER_STATUS.PREPARING;

          set((state) => ({
            orders: state.orders.map(o => {
              if (o.id === targetOrder.id) {
                return { 
                  ...o, 
                  items: updatedItems, 
                  status: newOrderStatus,
                  updatedAt: new Date().toISOString() 
                };
              }
              return o;
            })
          }));
        }
      },

      cancelItem: (orderId, itemId) => {
        const { orders } = get();
        const targetOrder = orders.find(o => o.items?.some(i => i.id === itemId));
        
        if (targetOrder) {
          const item = targetOrder.items.find(i => i.id === itemId);
          // ENTERPRISE RULE: Only cancel if NOT ready/served
          if ([ITEM_STATUS.READY, ITEM_STATUS.SERVED].includes(item?.status)) {
            console.error("Cannot cancel item that is already ready or served");
            return false;
          }

          const updatedItems = targetOrder.items.map(i => {
            if (i.id === itemId) return { ...i, status: ITEM_STATUS.CANCELLED };
            return i;
          });

          // Recalculate totals after cancellation
          const financialBreakdown = financeUtils.calculateOrderTotals(
            updatedItems.filter(i => i.status !== ITEM_STATUS.CANCELLED), 
            targetOrder.discountAmount
          );

          // Calculate new order status if all items are cancelled
          const activeItems = updatedItems.filter(i => i.status !== ITEM_STATUS.CANCELLED);
          const allServed = activeItems.length > 0 && activeItems.every(i => i.status === ITEM_STATUS.SERVED);
          const allReady = activeItems.length > 0 && activeItems.every(i => i.status === ITEM_STATUS.READY || i.status === ITEM_STATUS.SERVED);
          
          let newOrderStatus = targetOrder.status;
          if (activeItems.length === 0) newOrderStatus = ORDER_STATUS.CANCELLED;
          else if (allServed) newOrderStatus = ORDER_STATUS.DELIVERED;
          else if (allReady) newOrderStatus = ORDER_STATUS.READY;

          set((state) => ({
            orders: state.orders.map(o => {
              if (o.id === targetOrder.id) {
                return { 
                  ...o, 
                  items: updatedItems,
                  status: newOrderStatus,
                  ...financialBreakdown,
                  updatedAt: new Date().toISOString()
                };
              }
              return o;
            })
          }));
          return true;
        }
        return false;
      },

      deleteOrder: (orderId) => set((state) => ({
        orders: state.orders.filter(o => o.id !== orderId)
      })),

      // Updated Stats to handle multiple orders per table
      getStats: () => {
        const orders = get().orders;
        const today = new Date().toISOString().split('T')[0];
        const todaysOrders = orders.filter(o => o.createdAt?.startsWith(today));
        const successOrders = todaysOrders.filter(o => [ORDER_STATUS.PAID, ORDER_STATUS.COMPLETED].includes(o.status));

        const waiterPerformance = {};
        todaysOrders.forEach(o => {
          if (o.waiterId) {
            waiterPerformance[o.waiterId] = (waiterPerformance[o.waiterId] || 0) + (o.total || 0);
          }
        });

        const completedPrep = todaysOrders.filter(o => o.preparationStartTime && o.preparationEndTime);
        const avgPrepTime = completedPrep.length 
          ? completedPrep.reduce((acc, o) => acc + (new Date(o.preparationEndTime) - new Date(o.preparationStartTime)), 0) / completedPrep.length / 60000
          : 0;

        return {
          totalRevenue: successOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          activeOrdersCount: orders.filter(o => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED, ORDER_STATUS.PAID, ORDER_STATUS.DRAFT].includes(o.status)).length,
          pendingOrdersCount: orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
          kitchenQueueCount: orders.filter(o => [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING].includes(o.status)).length,
          completedTodayCount: successOrders.length,
          avgOrderValue: successOrders.length ? Math.round(successOrders.reduce((sum, o) => sum + (o.total || 0), 0) / successOrders.length) : 0,
          cancellationRate: todaysOrders.length ? (todaysOrders.filter(o => o.status === ORDER_STATUS.CANCELLED).length / todaysOrders.length) * 100 : 0,
          avgPrepTime: Math.round(avgPrepTime),
          waiterPerformance
        };
      },

      getKitchenQueue: () => {
        const priorityWeight = {
          'vip': 3,
          'urgent': 2,
          'normal': 1,
          undefined: 1
        };

        return get().orders
          .filter(o => {
            // Must be in active preparation status
            if (![ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.READY].includes(o.status)) {
              return false;
            }
            // Must have items
            if (!o.items || o.items.length === 0) {
              return false;
            }
            // Must have at least one active item (not served and not cancelled)
            const hasActiveItems = o.items.some(item => 
              ![ITEM_STATUS.SERVED, ITEM_STATUS.CANCELLED].includes(item.status)
            );
            return hasActiveItems;
          })
          .sort((a, b) => {
            // 1. Sort by Priority
            const pA = priorityWeight[a.priority?.toLowerCase()] || 1;
            const pB = priorityWeight[b.priority?.toLowerCase()] || 1;
            if (pA !== pB) return pB - pA; // Higher priority first

            // 2. Sort by creation time (oldest first = longest waiting)
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
      },

      // Polling & Realtime Preparation
      syncTimer: null,
      pollingSubscribers: {},
      currentIntervalDuration: null,

      startPolling: (subscriberId, interval = 30000) => {
        if (!subscriberId) {
          console.warn('[orderStore] startPolling called without subscriberId');
          return;
        }

        const currentSubs = { ...get().pollingSubscribers };
        currentSubs[subscriberId] = interval;

        // Calculate the fastest active interval requested
        const intervals = Object.values(currentSubs);
        const fastestInterval = Math.min(...intervals);

        // Immediate fetch before starting the interval
        import('@/shared/services/orderService').then(({ orderService }) => {
          orderService.fetchAll().catch(() => {});
        });

        const activeTimer = get().syncTimer;
        const currentDuration = get().currentIntervalDuration;

        // Create/Update the interval only if:
        // - no timer exists OR the requested fastest interval is faster than the current duration
        if (!activeTimer || fastestInterval < currentDuration) {
          if (activeTimer) {
            clearInterval(activeTimer);
          }

          const timer = setInterval(async () => {
            try {
              const { orderService } = await import('@/shared/services/orderService');
              await orderService.fetchAll();
            } catch (e) {
              set((state) => ({ orders: [...state.orders] }));
            }
          }, fastestInterval);

          set({
            syncTimer: timer,
            currentIntervalDuration: fastestInterval,
            pollingSubscribers: currentSubs
          });
        } else {
          // Just update the subscriber map
          set({ pollingSubscribers: currentSubs });
        }
      },

      stopPolling: (subscriberId) => {
        if (!subscriberId) {
          console.warn('[orderStore] stopPolling called without subscriberId');
          return;
        }

        const currentSubs = { ...get().pollingSubscribers };
        delete currentSubs[subscriberId];

        const activeTimer = get().syncTimer;

        if (Object.keys(currentSubs).length === 0) {
          // No subscribers left, stop everything
          if (activeTimer) {
            clearInterval(activeTimer);
          }
          set({
            syncTimer: null,
            currentIntervalDuration: null,
            pollingSubscribers: {}
          });
        } else {
          // Recalculate fastest interval of remaining subscribers
          const intervals = Object.values(currentSubs);
          const fastestInterval = Math.min(...intervals);
          const currentDuration = get().currentIntervalDuration;

          // Recreate timer if the fastest interval changed (e.g. slowed down)
          if (fastestInterval !== currentDuration) {
            if (activeTimer) {
              clearInterval(activeTimer);
            }

            const timer = setInterval(async () => {
              try {
                const { orderService } = await import('@/shared/services/orderService');
                await orderService.fetchAll();
              } catch (e) {
                set((state) => ({ orders: [...state.orders] }));
              }
            }, fastestInterval);

            set({
              syncTimer: timer,
              currentIntervalDuration: fastestInterval,
              pollingSubscribers: currentSubs
            });
          } else {
            // Just update subscriber map
            set({ pollingSubscribers: currentSubs });
          }
        }
      }
    }),
    {
      name: 'enterprise-order-storage-v2',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState, version) => {
        // Wipe corrupt or old-schema persisted state
        if (!persistedState || version < 2) {
          return { orders: [], activeOrderId: null, loading: false, error: null };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // --- Step 3 Task C: LocalStorage Garbage Collection ---
        // Terminal statuses that are safe to prune from local persistence.
        // Active, kitchen, and cashier orders are NEVER pruned.
        const TERMINAL_STATUSES = [
          ORDER_STATUS.COMPLETED,
          ORDER_STATUS.CANCELLED,
          ORDER_STATUS.REFUNDED,
        ];
        // Retention window: keep terminal orders for 24 h so same-day
        // analytics and history views still work correctly.
        const RETENTION_MS = 24 * 60 * 60 * 1000;
        const cutoff = Date.now() - RETENTION_MS;

        // Sanitize: strip orders missing a valid id
        const safe = (state.orders || []).filter(
          (o) => o && typeof o.id === 'string' && o.id.length > 0
        );

        // Deduplicate by id (keep last occurrence) + prune stale terminal orders
        const seen = new Set();
        state.orders = safe.filter((o) => {
          if (seen.has(o.id)) return false;
          seen.add(o.id);

          // Only prune if in a terminal status AND older than retention window
          if (TERMINAL_STATUSES.includes(o.status)) {
            const updatedAt = o.updatedAt ? new Date(o.updatedAt).getTime() : 0;
            if (updatedAt < cutoff) return false; // prune
          }

          return true;
        });

        // Always reset transient flags on boot
        state.loading = false;
        state.error = null;
      },
      partialize: (state) => ({
        orders: state.orders,
        activeOrderId: state.activeOrderId,
      }),
    }
  )
);

export default useOrderStore;
