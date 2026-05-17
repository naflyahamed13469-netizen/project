export default function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <Icon size={44} className="text-white/15 mb-4" />}
      <p className="text-sm text-white/30">{message}</p>
    </div>
  );
}
