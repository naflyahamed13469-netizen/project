export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-[3px] border-white/10 border-t-[#f59e0b] rounded-full animate-spin" />
    </div>
  );
}
