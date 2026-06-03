import React from 'react';

/* ─── Labelled Input ───────────────────────────────────── */
export const SettingsInput = ({ label, type = 'text', value, onChange, placeholder, suffix }) => (
  <div>
    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
        placeholder={placeholder}
        className="input-field w-full text-sm font-bold"
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{suffix}</span>}
    </div>
  </div>
);

/* ─── Toggle Switch ────────────────────────────────────── */
export const SettingsToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all -mx-2">
    <div className="min-w-0">
      <p className="text-sm font-bold dark:text-white text-slate-900 leading-tight">{label}</p>
      {description && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full p-1 transition-all duration-300 shrink-0 ${checked ? 'bg-primary-500 shadow-[0_0_12px_rgb(14,165,233,0.4)]' : 'bg-slate-200 dark:bg-white/10'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

/* ─── Select ───────────────────────────────────────────── */
export const SettingsSelect = ({ label, value, onChange, options = [] }) => (
  <div>
    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">{label}</label>
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="input-field w-full text-sm font-bold appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
          {typeof opt === 'string' ? opt : opt.label}
        </option>
      ))}
    </select>
  </div>
);

/* ─── Color Picker ─────────────────────────────────────── */
export const SettingsColorPicker = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-xs font-bold dark:text-slate-300 text-slate-600">{label}</span>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-white/10 cursor-pointer appearance-none bg-transparent"
        style={{ padding: 2 }}
      />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">{value}</span>
    </div>
  </div>
);

/* ─── Tag / Chip List ──────────────────────────────────── */
export const SettingsChipList = ({ items = [], onRemove, addLabel, onAdd }) => {
  const [input, setInput] = React.useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && onAdd) {
      onAdd(trimmed);
      setInput('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-xs font-bold dark:text-white text-slate-700 border border-slate-200/80 dark:border-white/10 group">
            {item}
            {onRemove && (
              <button
                onClick={() => onRemove(idx)}
                className="text-slate-400 hover:text-red-500 transition-colors ml-1 opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {onAdd && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            placeholder={addLabel || "Yangi qo'shish..."}
            className="input-field flex-1 text-xs font-bold"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 rounded-2xl bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all border border-primary-500/20"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Section Divider ──────────────────────────────────── */
export const SettingsDivider = ({ label }) => (
  <div className="flex items-center gap-4 py-2">
    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
    {label && <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</span>}
    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5" />
  </div>
);
