import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TRANSLATIONS } from '@/shared/constants/translations';
import { PageContainer, SectionHeader } from '@/shared/ui';
import useSettingsStore from '@/store/settings/settingsStore';
import useUIStore from '@/store/ui/uiStore';
import SettingsTabs from '../components/settings/SettingsTabs';
import SettingsCard from '../components/settings/SettingsCard';
import { SettingsInput, SettingsToggle, SettingsSelect, SettingsColorPicker, SettingsChipList, SettingsDivider } from '../components/settings/SettingsFields';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, GitBranch, LayoutGrid, ShoppingCart, ChefHat, Wallet,
  Shield, Settings2, Save, Trash2, Moon, Sun, Check
} from 'lucide-react';

const Settings = () => {
  const t = TRANSLATIONS.settings;
  const store = useSettingsStore();
  const { theme, toggleTheme } = useUIStore();
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const tabs = [
    { id: 'general', label: t.tabs.general, icon: Store },
    { id: 'branches', label: t.tabs.branches, icon: GitBranch },
    { id: 'tables', label: t.tabs.tables, icon: LayoutGrid },
    { id: 'orders', label: t.tabs.orders, icon: ShoppingCart },
    { id: 'kitchen', label: t.tabs.kitchen, icon: ChefHat },
    { id: 'cashier', label: t.tabs.cashier, icon: Wallet },
    { id: 'permissions', label: t.tabs.permissions, icon: Shield },
    { id: 'system', label: t.tabs.system, icon: Settings2 },
  ];

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 2500);
  }, []);

  const handleSave = () => showToast(t.saved);

  const handleReset = () => {
    if (window.confirm(t.danger.confirmReset)) {
      store.resetToDefaults();
      localStorage.clear();
      window.location.reload();
    }
  };

  /* helper to update nested restaurant fields */
  const setR = (key, val) => store.updateRestaurant({ [key]: val });
  const setT = (key, val) => store.updateTables({ [key]: val });
  const setO = (key, val) => store.updateOrders({ [key]: val });
  const setK = (key, val) => store.updateKitchen({ [key]: val });
  const setC = (key, val) => store.updateCashier({ [key]: val });
  const setS = (key, val) => store.updateSystem({ [key]: val });

  const r = store.restaurant || {};
  const tb = store.tables || {};
  const o = store.orders || {};
  const k = store.kitchen || {};
  const c = store.cashier || {};
  const sys = store.system || {};
  const perms = store.permissions || {};

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto pb-20">
        <SectionHeader
          title={t.title}
          description={t.subtitle}
          actionElement={
            <button onClick={handleSave} className="btn-primary shadow-2xl shadow-primary-500/30">
              <Save className="w-5 h-5" />
              <span className="hidden sm:inline">{t.saveConfig}</span>
            </button>
          }
        />

        <SettingsTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-8">

            {/* ═══ 1. UMUMIY ═══ */}
            {activeTab === 'general' && (
              <SettingsCard title={t.general.title} description={t.general.desc} icon={Store}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SettingsInput label={t.general.name} value={r.name} onChange={(v) => setR('name', v)} placeholder="Luxe Resto" />
                  <SettingsInput label={t.general.phone} value={r.phone} onChange={(v) => setR('phone', v)} placeholder="+998 71 200 00 00" />
                  <SettingsInput label={t.general.email} value={r.email} onChange={(v) => setR('email', v)} placeholder="info@restoran.uz" />
                  <SettingsInput label={t.general.address} value={r.address} onChange={(v) => setR('address', v)} placeholder="Toshkent, Amir Temur 1" />
                </div>
                <SettingsDivider label="Konfiguratsiya" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <SettingsSelect label={t.general.currency} value={r.currency} onChange={(v) => setR('currency', v)} options={[{ value: 'UZS', label: "So'm (UZS)" }, { value: 'USD', label: 'Dollar (USD)' }]} />
                  <SettingsSelect label={t.general.timezone} value={r.timezone} onChange={(v) => setR('timezone', v)} options={['Asia/Tashkent', 'Europe/Moscow', 'UTC']} />
                  <div className="grid grid-cols-2 gap-3">
                    <SettingsInput label={t.general.openTime} type="time" value={r.workingHours?.open} onChange={(v) => setR('workingHours', { ...r.workingHours, open: v })} />
                    <SettingsInput label={t.general.closeTime} type="time" value={r.workingHours?.close} onChange={(v) => setR('workingHours', { ...r.workingHours, close: v })} />
                  </div>
                </div>
                <SettingsDivider label="Prefiks" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <SettingsInput label={t.general.tablePrefix} value={r.tablePrefix} onChange={(v) => setR('tablePrefix', v)} placeholder="S" />
                  <SettingsInput label={t.general.orderPrefix} value={r.orderPrefix} onChange={(v) => setR('orderPrefix', v)} placeholder="B" />
                  <div className="pt-1">
                    <SettingsToggle label={t.general.qrEnabled} checked={!!r.qrEnabled} onChange={(v) => setR('qrEnabled', v)} />
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* ═══ 2. FILIALLAR ═══ */}
            {activeTab === 'branches' && (
              <SettingsCard title={t.branches.title} description={t.branches.desc} icon={GitBranch}>
                <BranchManager store={store} t={t.branches} />
              </SettingsCard>
            )}

            {/* ═══ 3. STOLLAR ═══ */}
            {activeTab === 'tables' && (
              <SettingsCard title={t.tableConfig.title} description={t.tableConfig.desc} icon={LayoutGrid}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SettingsInput label={t.tableConfig.reservationTimeout} type="number" value={tb.reservationTimeout} onChange={(v) => setT('reservationTimeout', v)} suffix="daq" />
                  <SettingsInput label={t.tableConfig.cleaningTimeout} type="number" value={tb.cleaningTimeout} onChange={(v) => setT('cleaningTimeout', v)} suffix="daq" />
                  <SettingsInput label={t.tableConfig.maxSeats} type="number" value={tb.maxSeats} onChange={(v) => setT('maxSeats', v)} />
                </div>
                <SettingsToggle label={t.tableConfig.autoNumbering} checked={!!tb.autoNumbering} onChange={(v) => setT('autoNumbering', v)} />
                <SettingsToggle label={t.tableConfig.vipEnabled} checked={!!tb.vipEnabled} onChange={(v) => setT('vipEnabled', v)} />
                <SettingsDivider label={t.tableConfig.statusColors} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['available', 'occupied', 'reserved', 'cleaning'].map((s) => (
                    <SettingsColorPicker key={s} label={t.tableConfig[s]} value={tb.statusColors?.[s]} onChange={(v) => setT('statusColors', { ...tb.statusColors, [s]: v })} />
                  ))}
                </div>
              </SettingsCard>
            )}

            {/* ═══ 4. BUYURTMALAR ═══ */}
            {activeTab === 'orders' && (
              <SettingsCard title={t.orderConfig.title} description={t.orderConfig.desc} icon={ShoppingCart}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <SettingsInput label={t.orderConfig.taxRate} type="number" value={o.taxRate} onChange={(v) => setO('taxRate', v)} suffix="%" />
                  <SettingsInput label={t.orderConfig.serviceFee} type="number" value={o.serviceFee} onChange={(v) => setO('serviceFee', v)} suffix="%" />
                  <SettingsInput label={t.orderConfig.minOrderAmount} type="number" value={o.minOrderAmount} onChange={(v) => setO('minOrderAmount', v)} suffix="sum" />
                </div>
                <SettingsToggle label={t.orderConfig.splitPayment} checked={!!o.splitPayment} onChange={(v) => setO('splitPayment', v)} />
                <SettingsToggle label={t.orderConfig.autoSendKitchen} checked={!!o.autoSendKitchen} onChange={(v) => setO('autoSendKitchen', v)} />
                <SettingsDivider label={t.orderConfig.cancelReasons} />
                <SettingsChipList items={o.cancelReasons || []} onRemove={(i) => store.removeCancelReason(i)} onAdd={(v) => store.addCancelReason(v)} addLabel={t.orderConfig.addReason} />
              </SettingsCard>
            )}

            {/* ═══ 5. OSHXONA ═══ */}
            {activeTab === 'kitchen' && (
              <SettingsCard title={t.kitchenConfig.title} description={t.kitchenConfig.desc} icon={ChefHat}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <SettingsInput label={t.kitchenConfig.refreshInterval} type="number" value={k.refreshInterval} onChange={(v) => setK('refreshInterval', v)} suffix="son" />
                  <SettingsInput label={t.kitchenConfig.readyTimeout} type="number" value={k.readyTimeout} onChange={(v) => setK('readyTimeout', v)} suffix="daq" />
                  <SettingsInput label={t.kitchenConfig.prepTimeLimit} type="number" value={k.prepTimeLimit} onChange={(v) => setK('prepTimeLimit', v)} suffix="daq" />
                </div>
                <SettingsToggle label={t.kitchenConfig.autoRefresh} checked={!!k.autoRefresh} onChange={(v) => setK('autoRefresh', v)} />
                <SettingsDivider label={t.kitchenConfig.sections} />
                <SettingsChipList items={k.sections || []} onRemove={(i) => store.removeKitchenSection(i)} onAdd={(v) => store.addKitchenSection(v)} addLabel={t.kitchenConfig.addSection} />
                <SettingsDivider label={t.kitchenConfig.priorityColors} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['normal', 'high', 'urgent'].map((p) => (
                    <SettingsColorPicker key={p} label={t.kitchenConfig[p]} value={k.priorityColors?.[p]} onChange={(v) => setK('priorityColors', { ...k.priorityColors, [p]: v })} />
                  ))}
                </div>
              </SettingsCard>
            )}

            {/* ═══ 6. KASSA ═══ */}
            {activeTab === 'cashier' && (
              <SettingsCard title={t.cashierConfig.title} description={t.cashierConfig.desc} icon={Wallet}>
                <SettingsDivider label={t.cashierConfig.paymentMethods} />
                <div className="space-y-1">
                  {(c.paymentMethods || []).map((m) => (
                    <SettingsToggle key={m.id} label={m.name} checked={m.enabled} onChange={() => store.togglePaymentMethod(m.id)} />
                  ))}
                </div>
                <SettingsDivider />
                <SettingsToggle label={t.cashierConfig.printReceipt} checked={!!c.printReceipt} onChange={(v) => setC('printReceipt', v)} />
                <SettingsToggle label={t.cashierConfig.refundEnabled} checked={!!c.refundEnabled} onChange={(v) => setC('refundEnabled', v)} />
                <SettingsInput label={t.cashierConfig.refundTimeLimit} type="number" value={c.refundTimeLimit} onChange={(v) => setC('refundTimeLimit', v)} suffix="soat" />
                <SettingsDivider label="Smena qoidalari" />
                <SettingsToggle label={t.cashierConfig.requireReport} checked={!!c.shiftCloseRules?.requireReport} onChange={(v) => setC('shiftCloseRules', { ...c.shiftCloseRules, requireReport: v })} />
                <SettingsToggle label={t.cashierConfig.requireCashCount} checked={!!c.shiftCloseRules?.requireCashCount} onChange={(v) => setC('shiftCloseRules', { ...c.shiftCloseRules, requireCashCount: v })} />
              </SettingsCard>
            )}

            {/* ═══ 7. RUXSATLAR ═══ */}
            {activeTab === 'permissions' && (
              <SettingsCard title={t.permissionsConfig.title} description={t.permissionsConfig.desc} icon={Shield}>
                <PermissionsMatrix perms={perms} onUpdate={store.updatePermissions} t={t.permissionsConfig} />
              </SettingsCard>
            )}

            {/* ═══ 8. TIZIM ═══ */}
            {activeTab === 'system' && (
              <SettingsCard title={t.systemConfig.title} description={t.systemConfig.desc} icon={Settings2}>
                <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all -mx-2">
                  <div>
                    <p className="text-sm font-bold dark:text-white text-slate-900">{t.systemConfig.darkMode}</p>
                  </div>
                  <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-2xl dark:bg-white/[0.04] bg-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-primary-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    <span className="text-[10px] font-black dark:text-white text-slate-900 uppercase tracking-widest">{theme === 'dark' ? 'Tungi' : 'Kunduzgi'}</span>
                  </button>
                </div>
                <SettingsToggle label={t.systemConfig.notifications} checked={!!sys.notifications} onChange={(v) => setS('notifications', v)} />
                <SettingsToggle label={t.systemConfig.soundEnabled} checked={!!sys.soundEnabled} onChange={(v) => setS('soundEnabled', v)} />
                <SettingsToggle label={t.systemConfig.autoBackup} checked={!!sys.autoBackup} onChange={(v) => setS('autoBackup', v)} />
                <SettingsDivider />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SettingsInput label={t.systemConfig.sessionTimeout} type="number" value={sys.sessionTimeout} onChange={(v) => setS('sessionTimeout', v)} suffix="daq" />
                  <SettingsInput label={t.systemConfig.lowStockThreshold} type="number" value={sys.lowStockThreshold} onChange={(v) => setS('lowStockThreshold', v)} suffix="ta" />
                </div>
              </SettingsCard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ═══ DANGER ZONE ═══ */}
        <div className="mt-12">
          <SettingsCard title={t.danger.title} icon={Trash2}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 -mx-2">
              <div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{t.danger.resetData}</p>
                <p className="text-[10px] font-bold text-red-400/80 mt-0.5">{t.danger.resetDataDesc}</p>
              </div>
              <button onClick={handleReset} className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shrink-0 shadow-lg shadow-red-500/20">
                {t.danger.resetButton}
              </button>
            </div>
          </SettingsCard>
        </div>

        {/* ═══ BOTTOM BAR ═══ */}
        <div className="flex justify-end gap-4 pt-10 border-t dark:border-white/5 border-slate-100 mt-10">
          <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-[24px] text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest">
            {t.discard}
          </button>
          <button onClick={handleSave} className="btn-primary px-12 py-4 shadow-2xl shadow-primary-500/30">
            <Save className="w-5 h-5" /> {t.saveConfig}
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-[24px] bg-green-500 text-white text-sm font-black flex items-center gap-3 shadow-2xl shadow-green-500/30">
            <Check className="w-5 h-5" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

/* ─── Branch Manager Sub-Component ─── */
const BranchManager = ({ store, t }) => {
  const [newBranch, setNewBranch] = useState({ name: '', address: '' });
  const [newHall, setNewHall] = useState({ name: '', capacity: '', branchId: '' });
  const branches = store.branches || [];
  const halls = store.halls || [];

  return (
    <div className="space-y-6">
      <SettingsDivider label={t.addBranch} />
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={newBranch.name} onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })} placeholder={t.branchName} className="input-field flex-1 text-xs font-bold" />
        <input value={newBranch.address} onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })} placeholder={t.branchAddress} className="input-field flex-1 text-xs font-bold" />
        <button onClick={() => { if (newBranch.name.trim()) { store.addBranch(newBranch); setNewBranch({ name: '', address: '' }); } }} className="px-5 py-2.5 sm:py-2 rounded-2xl bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shrink-0">+</button>
      </div>
      {branches.length === 0 ? (
        <p className="text-center text-xs font-bold text-slate-400 py-8">{t.noBranches}</p>
      ) : (
        <div className="space-y-3">
          {branches.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <div>
                <p className="text-sm font-bold dark:text-white text-slate-900">{b.name}</p>
                <p className="text-[10px] font-bold text-slate-400">{b.address}</p>
              </div>
              <button onClick={() => store.removeBranch(b.id)} className="text-red-400 hover:text-red-500 text-xs font-black transition-colors">×</button>
            </div>
          ))}
        </div>
      )}
      <SettingsDivider label={t.addHall} />
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={newHall.name} onChange={(e) => setNewHall({ ...newHall, name: e.target.value })} placeholder={t.hallName} className="input-field flex-1 text-xs font-bold" />
        <input value={newHall.capacity} onChange={(e) => setNewHall({ ...newHall, capacity: e.target.value })} placeholder={t.hallCapacity} type="number" className="input-field w-full sm:w-24 text-xs font-bold" />
        <button onClick={() => { if (newHall.name.trim()) { store.addHall({ ...newHall, capacity: parseInt(newHall.capacity) || 0 }); setNewHall({ name: '', capacity: '', branchId: '' }); } }} className="px-5 py-2.5 sm:py-2 rounded-2xl bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shrink-0">+</button>
      </div>
      {halls.length === 0 ? (
        <p className="text-center text-xs font-bold text-slate-400 py-8">{t.noHalls}</p>
      ) : (
        <div className="space-y-3">
          {halls.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold dark:text-white text-slate-900">{h.name}</p>
                <span className="text-[10px] font-black text-primary-500 bg-primary-500/10 px-3 py-1 rounded-lg">{h.capacity || 0} stol</span>
              </div>
              <button onClick={() => store.removeHall(h.id)} className="text-red-400 hover:text-red-500 text-xs font-black transition-colors">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Permissions Matrix Sub-Component ─── */
const PermissionsMatrix = ({ perms, onUpdate, t }) => {
  const roles = Object.keys(perms || {});
  const modules = roles.length > 0 ? Object.keys(perms[roles[0]] || {}) : [];
  const roleLabels = { admin: 'Administrator', manager: 'Menejer', cashier: 'Kassir', waiter: 'Ofitsiant', kitchen: 'Oshpaz' };
  const moduleLabels = { dashboard: 'Boshqaruv', tables: 'Stollar', menu: 'Menyu', orders: 'Buyurtmalar', kitchen: 'Oshxona', cashier: 'Kassa', analytics: 'Tahlillar', staff: 'Xodimlar', settings: 'Sozlamalar' };

  if (roles.length === 0) return <p className="text-center text-xs font-bold text-slate-400 py-8">Ruxsatlar mavjud emas</p>;

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="border-b dark:border-white/5 border-slate-100">
            <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.role}</th>
            {modules.map((m) => (
              <th key={m} className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{moduleLabels[m] || m}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-white/5 divide-slate-50">
          {roles.map((role) => (
            <tr key={role} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all">
              <td className="p-3">
                <span className="text-xs font-black dark:text-white text-slate-900">{roleLabels[role] || role}</span>
              </td>
              {modules.map((mod) => (
                <td key={mod} className="p-3 text-center">
                  <button
                    onClick={() => role !== 'admin' && onUpdate(role, { [mod]: !perms[role]?.[mod] })}
                    disabled={role === 'admin'}
                    className={`w-8 h-8 rounded-xl transition-all mx-auto flex items-center justify-center ${
                      perms[role]?.[mod]
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 border border-transparent'
                    } ${role === 'admin' ? 'cursor-not-allowed opacity-60' : 'hover:scale-110 cursor-pointer'}`}
                  >
                    {perms[role]?.[mod] ? <Check className="w-4 h-4" /> : <span className="text-lg leading-none">·</span>}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Settings;
