import { Car } from 'lucide-react';
import Badge from './Badge';

export default function VehicleCard({ vehicle, onBook }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#f59e0b]/30 transition-all duration-300 group">
      <div className="h-40 bg-gradient-to-br from-white/[0.04] to-transparent flex items-center justify-center">
        <Car size={48} className="text-white/15 group-hover:text-[#f59e0b]/40 transition-colors duration-300" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-syne font-bold text-lg text-white/90">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-white/30 mt-0.5">{vehicle.year}</p>
          </div>
          <Badge text={vehicle.available ? 'Available' : 'Rented'} color={vehicle.available ? 'green' : 'red'} />
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
          <div>
            <span className="text-2xl font-syne font-extrabold text-[#f59e0b]">${vehicle.dailyRate}</span>
            <span className="text-sm text-white/25 ml-1">/day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/25 bg-white/[0.06] px-2 py-1 rounded">{vehicle.type}</span>
            <span className="text-xs text-white/25 bg-white/[0.06] px-2 py-1 rounded">{vehicle.vehicleNumber}</span>
          </div>
        </div>
        {onBook && vehicle.available && (
          <button
            onClick={() => onBook(vehicle)}
            className="mt-4 w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-sm rounded-lg transition-colors"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
}
