import { Edit2, Trash2, Plus } from 'lucide-react';

const FoodCategoryTabs = ({ 
  categories = [], 
  activeCategory, 
  onCategoryChange, 
  canManage, 
  onEdit, 
  onDelete, 
  onAdd 
}) => {
  return (
    <div className="flex overflow-x-auto custom-scrollbar pb-4 gap-3 items-center">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const isSystem = category.id === 'all';
        
        return (
          <div key={category.id} className="relative group/tab">
            <button
              onClick={() => onCategoryChange && onCategoryChange(category.id)}
              className={`relative px-6 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                isActive 
                  ? 'text-white border-transparent bg-primary-500 shadow-xl shadow-primary-500/30' 
                  : 'bg-white/40 dark:bg-white/[0.02] dark:border-white/10 border-slate-200 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-primary-500'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2.5">
                {category.icon && <span className="text-base">{category.icon}</span>}
                {category.name}
              </span>
            </button>
 
            {canManage && !isSystem && (
              <div className="absolute -top-2 -right-2 flex gap-1 lg:opacity-0 lg:group-hover/tab:opacity-100 transition-all scale-75 group-hover/tab:scale-100 z-30">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-white/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-white/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
 
      {canManage && (
        <button
          onClick={onAdd}
          className="p-4 rounded-[20px] border-2 border-dashed dark:border-white/10 border-slate-200 text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center justify-center shrink-0"
          title="Yangi kategoriya"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default FoodCategoryTabs;
