import { supabase } from '@/lib/supabase';
import useTableStore from '@/store/tables/tableStore';
import useOrderStore from '@/store/orders/orderStore';
import { TABLE_STATUS, ORDER_STATUS } from '../constants/statuses';
import { toFrontend, toDatabase } from '../utils/caseTransform';

/**
* Enterprise Supabase-Driven Table Service
*/
class TableService {
  constructor() {
    this.getAll = this.getAll.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.createTable = this.createTable.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.deleteTable = this.deleteTable.bind(this);
    this.merge = this.merge.bind(this);
    this.split = this.split.bind(this);
    this.transferOrder = this.transferOrder.bind(this);
  }

  /**
  * Fetches all tables from Supabase and populates the Zustand store
  */
  async getAll() {
    useTableStore.getState().setLoading(true);
    useTableStore.getState().setError(null);
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) throw error;

      const mapped = toFrontend(data || []);
      useTableStore.getState().setTables(mapped);
      return mapped;
    } catch (error) {
      useTableStore.getState().setError(error.message);
      throw error;
    } finally {
      useTableStore.getState().setLoading(false);
    }
  }

  /**
  * Updates table status and/or active order session
  */
  async updateStatus(id, status, currentOrderId = null) {
    useTableStore.getState().setLoading(true);
    useTableStore.getState().setError(null);
    try {
      const updatePayload = toDatabase({
        status,
        currentOrderId,
        lastStatusChange: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('tables')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toFrontend(data);
    } catch (error) {
      useTableStore.getState().setError(error.message);
      throw error;
    } finally {
      useTableStore.getState().setLoading(false);
    }
  }

  /**
  * Creates a new table on the database
  */
  async createTable(tableData) {
    useTableStore.getState().setLoading(true);
    useTableStore.getState().setError(null);
    try {
      const insertPayload = toDatabase({
        ...tableData,
        status: tableData.status || TABLE_STATUS.EMPTY,
        capacity: tableData.capacity || 4,
        zone: tableData.zone || 'Asosiy zal',
        lastStatusChange: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('tables')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw error;
      return toFrontend(data);
    } catch (error) {
      useTableStore.getState().setError(error.message);
      throw error;
    } finally {
      useTableStore.getState().setLoading(false);
    }
  }

  /**
  * Updates general table details on the database
  */
  async updateTable(id, tableData) {
    useTableStore.getState().setLoading(true);
    useTableStore.getState().setError(null);
    try {
      const { data, error } = await supabase
        .from('tables')
        .update(toDatabase(tableData))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toFrontend(data);
    } catch (error) {
      useTableStore.getState().setError(error.message);
      throw error;
    } finally {
      useTableStore.getState().setLoading(false);
    }
  }

  /**
  * Deletes a table from the database
  */
  async deleteTable(id) {
    useTableStore.getState().setLoading(true);
    useTableStore.getState().setError(null);
    try {
      const activeOrders = useOrderStore.getState().orders.filter(o => o.tableId === id && ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(o.status));
      if (activeOrders.length > 0) {
        throw new Error('Jarayondagi buyurtmalari bor stolni o\'chirib bo\'lmaydi (Cannot delete table with active orders)');
      }

      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      useTableStore.getState().setError(error.message);
      throw error;
    } finally {
      useTableStore.getState().setLoading(false);
    }
  }

  /**
  * Merges two tables dynamically
  */
  async merge(primaryId, secondaryId) {
    useTableStore.getState().setLoading(true);
    useTableStore.getState().setError(null);
    try {
      const primaryTable = useTableStore.getState().tables.find(t => t.id === primaryId);
      const secondaryTable = useTableStore.getState().tables.find(t => t.id === secondaryId);

      if (!primaryTable || !secondaryTable) {
        throw new Error('Table not found');
      }

      // Transfer any active orders from secondary table to primary table before merging
      const activeSecondaryOrders = useOrderStore.getState().orders.filter(o => o.tableId === secondaryId && ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(o.status));
      for (const order of activeSecondaryOrders) {
        await this.transferOrder(order.id, primaryId);
      }

      const mergedWith = [...(primaryTable.mergedWith || []), secondaryId];
      const newCapacity = primaryTable.capacity + secondaryTable.capacity;

      const { error: primaryError } = await supabase
        .from('tables')
        .update(toDatabase({
          mergedWith,
          capacity: newCapacity
        }))
        .eq('id', primaryId);

      if (primaryError) throw primaryError;

      const { error: secondaryError } = await supabase
        .from('tables')
        .update(toDatabase({
          status: TABLE_STATUS.INACTIVE,
          mergedInto: primaryId
        }))
        .eq('id', secondaryId);

      if (secondaryError) throw secondaryError;
    } catch (error) {
      useTableStore.getState().setError(error.message);
      throw error;
    } finally {
      useTableStore.getState().setLoading(false);
    }
  }

  /**
  * Splits a merged table session
  */
  async split(id) {
    useTableStore.getState().setLoading(true);
    useTableStore.getState().setError(null);
    try {
      const table = useTableStore.getState().tables.find(t => t.id === id);
      if (!table || !table.mergedWith || table.mergedWith.length === 0) {
        throw new Error('Table not found or not merged');
      }

      const secondaryIds = table.mergedWith;

      const { error: primaryError } = await supabase
        .from('tables')
        .update(toDatabase({
          mergedWith: [],
          capacity: table.baseCapacity || table.capacity
        }))
        .eq('id', id);

      if (primaryError) throw primaryError;

      const { error: secondaryError } = await supabase
        .from('tables')
        .update(toDatabase({
          status: TABLE_STATUS.EMPTY,
          mergedInto: null
        }))
        .in('id', secondaryIds);

      if (secondaryError) throw secondaryError;
    } catch (error) {
      useTableStore.getState().setError(error.message);
      throw error;
    } finally {
      useTableStore.getState().setLoading(false);
    }
  }

  // Semantic Helpers
  async occupy(id, orderId) {
    return this.updateStatus(id, TABLE_STATUS.OCCUPIED, orderId);
  }

  async startCleaning(id) {
    return this.updateStatus(id, TABLE_STATUS.CLEANING);
  }

  async clear(id) {
    useOrderStore.getState().clearTableSession(id);
    return this.updateStatus(id, TABLE_STATUS.EMPTY, null);
  }

  async reserve(id) {
    return this.updateStatus(id, TABLE_STATUS.RESERVED);
  }

  async cancelReservation(id) {
    return this.updateStatus(id, TABLE_STATUS.EMPTY);
  }

  async transferOrder(orderId, targetTableId) {
    useTableStore.getState().setLoading(true);
    useTableStore.getState().setError(null);
    try {
      const activeOrder = useOrderStore.getState().orders.find(o => o.id === orderId);

      if (!activeOrder) {
        throw new Error('Order not found');
      }

      const sourceTableId = activeOrder.tableId;
      const targetTable = useTableStore.getState().tables.find(t => t.id === targetTableId);
      if (!targetTable) {
        throw new Error('Target table not found');
      }

      const allSourceOrders = useOrderStore.getState().orders.filter(o => o.tableId === sourceTableId && o.id !== orderId);
      const activeSourceOrders = allSourceOrders.filter(o => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(o.status));

      // Update Database
      if (activeSourceOrders.length === 0) {
        const { error: sourceError } = await supabase
          .from('tables')
          .update(toDatabase({
            status: TABLE_STATUS.EMPTY,
            currentOrderId: null,
            lastStatusChange: new Date().toISOString()
          }))
          .eq('id', sourceTableId);

        if (sourceError) throw sourceError;
      }

      const { error: targetError } = await supabase
        .from('tables')
        .update(toDatabase({
          status: TABLE_STATUS.OCCUPIED,
          currentOrderId: orderId,
          lastStatusChange: new Date().toISOString()
        }))
        .eq('id', targetTableId);

      if (targetError) throw targetError;

      const { error: orderError } = await supabase
        .from('orders')
        .update(toDatabase({ tableId: targetTableId }))
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Update Local Zustand State
      useOrderStore.setState({
        orders: useOrderStore.getState().orders.map(o =>
          o.id === orderId
            ? { ...o, tableId: targetTableId, tableNumber: targetTable.tableNumber || targetTable.number }
            : o
        )
      });

      if (activeSourceOrders.length === 0) {
        useTableStore.getState().updateTableStatus(sourceTableId, TABLE_STATUS.EMPTY, null);
      }
      useTableStore.getState().updateTableStatus(targetTableId, TABLE_STATUS.OCCUPIED, orderId);

    } catch (error) {
      useTableStore.getState().setError(error.message);
      throw error;
    } finally {
      useTableStore.getState().setLoading(false);
    }
  }
}

export const tableService = new TableService();

