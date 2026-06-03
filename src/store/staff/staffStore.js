import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Enterprise Staff Store
 * Backend-ready: handles staff management, attendance, and activity logs.
 */
const useStaffStore = create(
  persist(
    (set, get) => ({
      staff: [],
      attendance: [],
      activityLogs: [],
      shifts: [
        { id: 'morning', name: 'Ertalabki (09:00 - 18:00)', start: '09:00', end: '18:00' },
        { id: 'evening', name: 'Kechki (18:00 - 02:00)', start: '18:00', end: '02:00' },
        { id: 'night', name: 'Tungi (22:00 - 06:00)', start: '22:00', end: '06:00' },
      ],
      loading: false,
      error: null,

      // Setters
      setStaff: (staff) => set({ staff }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Employee CRUD (Soft Delete only)
      addEmployee: (employee) => {
        const newEmployee = {
          ...employee,
          id: employee.id || `EMP-${Date.now()}`,
          status: employee.status || 'offline',
          salary: Number(employee.salary) || 0,
          created_at: new Date().toISOString(),
          is_active: true, // For soft delete
        };
        set((state) => ({
          staff: [newEmployee, ...state.staff]
        }));
        get().logActivity(newEmployee.id, 'created', 'Xodim tizimga qo\'shildi');
      },

      updateEmployee: (id, updatedData) => {
        set((state) => ({
          staff: state.staff.map(s => s.id === id ? { ...s, ...updatedData } : s)
        }));
        get().logActivity(id, 'updated', 'Xodim ma\'lumotlari yangilandi');
      },

      deactivateEmployee: (id) => {
        set((state) => ({
          staff: state.staff.map(s => s.id === id ? { ...s, is_active: false, status: 'inactive' } : s)
        }));
        get().logActivity(id, 'deactivated', 'Xodim faoliyatsiz holatga o\'tkazildi');
      },

      restoreEmployee: (id) => {
        set((state) => ({
          staff: state.staff.map(s => s.id === id ? { ...s, is_active: true, status: 'offline' } : s)
        }));
        get().logActivity(id, 'restored', 'Xodim faoliyati tiklandi');
      },

      // Attendance Logic
      checkIn: (staffId) => {
        const now = new Date();
        const newRecord = {
          id: `ATT-${Date.now()}`,
          staffId,
          checkIn: now.toISOString(),
          checkOut: null,
          date: now.toISOString().split('T')[0],
          status: 'present'
        };
        set((state) => ({
          attendance: [newRecord, ...state.attendance],
          staff: state.staff.map(s => s.id === staffId ? { ...s, status: 'active' } : s)
        }));
        get().logActivity(staffId, 'check_in', 'Ishga keldi');
      },

      checkOut: (staffId) => {
        const now = new Date();
        set((state) => ({
          attendance: state.attendance.map(a => 
            (a.staffId === staffId && !a.checkOut) 
              ? { ...a, checkOut: now.toISOString() } 
              : a
          ),
          staff: state.staff.map(s => s.id === staffId ? { ...s, status: 'offline' } : s)
        }));
        get().logActivity(staffId, 'check_out', 'Ishdan ketdi');
      },

      // Activity Logging
      logActivity: (staffId, action, description) => set((state) => ({
        activityLogs: [{
          id: `LOG-${Date.now()}`,
          staffId,
          action,
          description,
          timestamp: new Date().toISOString()
        }, ...state.activityLogs].slice(0, 1000) // Keep last 1000 logs
      })),

      // Advanced Getters
      getStats: () => {
        const staff = get().staff || [];
        const activeStaff = staff.filter(s => s.is_active);
        if (activeStaff.length === 0) {
          return { total: 0, online: 0, avgPerformance: 0, roles: {} };
        }
        
        const roles = activeStaff.reduce((acc, s) => {
          acc[s.role] = (acc[s.role] || 0) + 1;
          return acc;
        }, {});

        return {
          total: activeStaff.length,
          online: activeStaff.filter(s => s.status === 'active').length,
          avgPerformance: Math.round(activeStaff.reduce((sum, s) => sum + (s.performance || 0), 0) / activeStaff.length) || 0,
          roles
        };
      },

      getEmployeeActivity: (staffId) => {
        return (get().activityLogs || []).filter(log => log.staffId === staffId);
      },

      getEmployeeAttendance: (staffId) => {
        return (get().attendance || []).filter(a => a.staffId === staffId);
      }
    }),
    {
      name: 'enterprise-staff-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStaffStore;
