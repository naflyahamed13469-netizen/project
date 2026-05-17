const colorMap = {
  amber: 'bg-[#f59e0b]/15 text-[#f59e0b]',
  green: 'bg-emerald-500/15 text-emerald-400',
  red: 'bg-red-500/15 text-red-400',
  blue: 'bg-sky-500/15 text-sky-400',
};

export default function StatCard({ title, value, icon: Icon, color = 'amber' }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/40">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[color] || colorMap.amber}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="text-2xl font-syne font-extrabold text-white">{value}</p>
    </div>
  );
}
