const colorMap = {
  green: 'bg-emerald-500/15 text-emerald-400',
  red: 'bg-red-500/15 text-red-400',
  amber: 'bg-amber-500/15 text-amber-400',
  gray: 'bg-white/10 text-white/50',
};

export default function Badge({ text, color = 'gray' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-full ${
        colorMap[color] || colorMap.gray
      }`}
    >
      {text}
    </span>
  );
}
