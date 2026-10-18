import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types';
import { GeofenceMap } from '../GeofenceMap';
import {
  Compass,
  Search,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  RotateCcw,
  History
} from 'lucide-react';

interface PassengerScreenProps {
  vehicles: Vehicle[];
  allowPassengerCallDriver?: boolean;
}

export const PassengerScreen: React.FC<PassengerScreenProps> = ({
  vehicles,
  allowPassengerCallDriver = false,
}) => {
  const [searchPlate, setSearchPlate] = useState<string>('26 S 2244');
  const [selectedPlate, setSelectedPlate] = useState<string>('26 S 2244');
  const [simulatedProgress, setSimulatedProgress] = useState<number>(78);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Requirement 13: Passenger's own history of saved plates (no other public plates shown)
  const [savedPlates, setSavedPlates] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('servis_takip_passenger_plates');
      return stored ? JSON.parse(stored) : ['26 S 2244'];
    } catch {
      return ['26 S 2244'];
    }
  });

  const activeVehicle =
    vehicles.find((v) => v.plate.replace(/\s+/g, '').toUpperCase() === selectedPlate.replace(/\s+/g, '').toUpperCase()) ||
    vehicles[0];

  // Live motion progression
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 98) {
          setIsCompleted(true);
          return 100;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isCompleted, selectedPlate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchPlate.trim().toUpperCase();
    if (!clean) return;

    setSelectedPlate(clean);
    setIsCompleted(false);
    setSimulatedProgress(60);

    // Save to user's personal history
    if (!savedPlates.includes(clean)) {
      const updated = [clean, ...savedPlates].slice(0, 4);
      setSavedPlates(updated);
      try {
        localStorage.setItem('servis_takip_passenger_plates', JSON.stringify(updated));
      } catch {
        // Ignored
      }
    }
  };

  const handleSelectSavedPlate = (plate: string) => {
    setSearchPlate(plate);
    setSelectedPlate(plate);
    setIsCompleted(false);
    setSimulatedProgress(68);
  };

  const handleResetTrip = () => {
    setIsCompleted(false);
    setSimulatedProgress(50);
  };

  const remainingMinutes = Math.max(1, Math.round((100 - simulatedProgress) * 0.25));

  return (
    <div className="flex-1 flex flex-col bg-slate-950 pb-20">
      {/* Top Passenger Header (Requirement 13: Only search input & user's own saved plates) */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white">Canlı Servis Takibi</h1>
              <p className="text-[11px] text-slate-400">Üyeliksiz Sade Yolcu Ekranı</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            Canlı Takip
          </span>
        </div>

        {/* Plate Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
            placeholder="Servis Plakası Girin (Örn: 26 S 2244)"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-20 py-2.5 text-xs text-white uppercase font-mono font-bold tracking-wider placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
          >
            Sorgula
          </button>
        </form>

        {/* User's own previously saved plates ONLY (Requirement 13) */}
        {savedPlates.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
            <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
              <History className="w-3 h-3" />
              <span>Kayıtlı Plakam:</span>
            </span>
            {savedPlates.map((plate) => (
              <button
                key={plate}
                onClick={() => handleSelectSavedPlate(plate)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  selectedPlate === plate
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {plate}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Passenger Body */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
        {/* Requirement 17: "Servis vardı, takip sona erdi" AND vehicle disappears from map */}
        {isCompleted ? (
          <div className="space-y-3.5">
            {/* Map without vehicle marker */}
            <GeofenceMap
              factory={{
                id: 'f1',
                name: activeVehicle.destination || 'Arçelik Fabrikası',
                shortName: activeVehicle.destination || 'Arçelik',
                code: 'ARC',
                address: 'Nizamiye',
                geofenceRadiusMeters: 150,
                coordinates: { lat: 39.7745, lng: 30.5890 },
                currentSinglePrice: 0,
                currentDoublePrice: 0,
                color: '#0284c7',
                activeShifts: [],
              }}
              busPositionPercent={100}
              isCompleted={true}
              showBus={false}
              isPassengerView={true}
              heightClass="h-56"
            />

            {/* Requirement 17 Notice Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>

              {/* Exact user string: "Servis vardı, takip sona erdi" */}
              <h3 className="text-base font-extrabold text-white">
                Servis vardı, takip sona erdi
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                <strong className="text-white">{activeVehicle.plate}</strong> plakalı servis aracı hedef noktaya ulaştı.
                Güvenlik gereği canlı konum yayını tamamlanmıştır.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleResetTrip}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tekrar Takip Başlat</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE LIVE TRACKING VIEW (Requirements 14, 15, 16) */
          <div className="space-y-3.5">
            {/* Live Map (No technical geofence badges, pure clean vehicle position and destination) */}
            <div className="relative">
              <GeofenceMap
                factory={{
                  id: 'f1',
                  name: activeVehicle.destination || 'Arçelik Fabrikası',
                  shortName: activeVehicle.destination || 'Fabrika',
                  code: 'ARC',
                  address: 'Nizamiye',
                  geofenceRadiusMeters: 150,
                  coordinates: { lat: 39.7745, lng: 30.5890 },
                  currentSinglePrice: 0,
                  currentDoublePrice: 0,
                  color: '#0284c7',
                  activeShifts: [],
                }}
                busPositionPercent={simulatedProgress}
                plate={activeVehicle.plate}
                showBus={true}
                isCompleted={false}
                isPassengerView={true}
                heightClass="h-64"
              />
            </div>

            {/* Vehicle & ETA Card (Requirement 14: Only destination & ETA, Requirement 15: NO SPEED) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Hedef Nokta</span>
                  <h3 className="text-base font-extrabold text-white">
                    {activeVehicle.destination || 'Arçelik Fabrikası'}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">
                    {activeVehicle.plate} · {activeVehicle.driverName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono block">
                    {remainingMinutes} <span className="text-xs font-normal text-slate-400">dk</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold block">Tahmini Varış Süresi</span>
                </div>
              </div>

              {/* Requirement 16: "Şoförü Ara" is HIDDEN BY DEFAULT, only shown if company enabled it */}
              {allowPassengerCallDriver && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">İletişim İzni Aktif</span>
                  <a
                    href={`tel:${activeVehicle.driverPhone}`}
                    className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Şoförü Ara ({activeVehicle.driverName})</span>
                  </a>
                </div>
              )}
            </div>

            {/* Simulation trigger to immediately test arrival behavior */}
            <button
              onClick={() => {
                setSimulatedProgress(100);
                setIsCompleted(true);
              }}
              className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simülasyon: Fabrikaya Varışı Tamamla</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
