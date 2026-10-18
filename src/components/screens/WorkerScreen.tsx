import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types';
import { GeofenceMap } from '../GeofenceMap';
import {
  Briefcase,
  KeyRound,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Layers,
  ArrowRight,
  Settings,
  X,
  AlertCircle,
  Truck,
  Sparkles,
  Repeat
} from 'lucide-react';

interface WorkerScreenProps {
  vehicles: Vehicle[];
  isTodayHoliday?: boolean;
  holidayName?: string;
  backupIncidentPlate?: string;
  backupDriverName?: string;
}

export const WorkerScreen: React.FC<WorkerScreenProps> = ({
  vehicles,
  isTodayHoliday = false,
  holidayName = '29 Ekim Cumhuriyet Bayramı',
  backupIncidentPlate,
  backupDriverName,
}) => {
  // Authentication & Passcode Setup State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [inputPlate, setInputPlate] = useState<string>('26 S 2244');
  const [inputPasscode, setInputPasscode] = useState<string>('4819');
  const [authError, setAuthError] = useState<string | null>(null);

  // Worker Setup Info (One-time config)
  const [boardingStop, setBoardingStop] = useState<string>('Vişnelik Migros Önü');
  const [simulatedProgress, setSimulatedProgress] = useState<number>(75);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Requirement 2: Automatic Shift Rotation
  // 1. hafta Gündüz 07:00, 2. hafta Akşam 15:00, 3. hafta Gece 23:00, sonra başa döner; tatil günü Salı
  const [shiftCycle, setShiftCycle] = useState<{
    week1: { label: string; hour: string; shiftKey: 'day' | 'evening' | 'night' };
    week2: { label: string; hour: string; shiftKey: 'day' | 'evening' | 'night' };
    week3: { label: string; hour: string; shiftKey: 'day' | 'evening' | 'night' };
    offDay: string; // e.g. "Salı"
  }>({
    week1: { label: 'Gündüz', hour: '07:00', shiftKey: 'day' },
    week2: { label: 'Akşam', hour: '15:00', shiftKey: 'evening' },
    week3: { label: 'Gece', hour: '23:00', shiftKey: 'night' },
    offDay: 'Salı',
  });

  // Current calculated week (Default 2. Hafta - Akşam 15:00 for realistic October demo)
  const [currentWeekIndex, setCurrentWeekIndex] = useState<1 | 2 | 3>(2);

  // Requirement 2: "İşçi isterse sadece o gün için elle değiştirebilsin ('Bugün farklı saatteyim')"
  const [todayOverride, setTodayOverride] = useState<{
    active: boolean;
    label: string;
    hour: string;
  } | null>(null);

  // Shift Settings Modal
  const [showShiftConfigModal, setShowShiftConfigModal] = useState<boolean>(false);
  const [showTodayOverrideModal, setShowTodayOverrideModal] = useState<boolean>(false);
  const [customOverrideHour, setCustomOverrideHour] = useState<string>('08:30');

  // Today's day name in Turkish (Demo default is 'Cumartesi' or testable with off-day)
  const [simulatedDay, setSimulatedDay] = useState<string>('Cumartesi');

  // Calculate active shift & hour
  const defaultWeekShift =
    currentWeekIndex === 1
      ? shiftCycle.week1
      : currentWeekIndex === 2
      ? shiftCycle.week2
      : shiftCycle.week3;

  const activeShiftLabel = todayOverride?.active ? todayOverride.label : defaultWeekShift.label;
  const activeServiceHour = todayOverride?.active ? todayOverride.hour : defaultWeekShift.hour;
  const isOffDay = simulatedDay === shiftCycle.offDay && !todayOverride?.active;

  // Active vehicle & backup vehicle check (Requirement 3)
  const baseVehicle =
    vehicles.find((v) => v.plate.replace(/\s+/g, '').toUpperCase() === inputPlate.replace(/\s+/g, '').toUpperCase()) ||
    vehicles[0];

  // If backup vehicle was assigned by patron (Requirement 3)
  const activeBackupPlate = backupIncidentPlate || baseVehicle.backupPlate;
  const activeBackupDriver = backupDriverName || baseVehicle.backupDriverName;
  const displayedPlate = activeBackupPlate || baseVehicle.plate;

  // Validate 4-digit passcode
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = inputPlate.trim().toUpperCase();
    const cleanCode = inputPasscode.trim();

    const matched = vehicles.find((v) => v.plate === cleanPlate);
    if (!matched) {
      setAuthError('Bu plakaya ait servis aracı bulunamadı.');
      return;
    }
    if (matched.passengerPasscode !== cleanCode) {
      setAuthError('Girilen 4 haneli takip kodu hatalı. Lütfen servis sorumlunuzdan kodu isteyiniz.');
      return;
    }

    setAuthError(null);
    setIsAuthenticated(true);
    setIsCompleted(false);
    setSimulatedProgress(60);
  };

  // Live motion progression
  useEffect(() => {
    if (isCompleted || !isAuthenticated || isTodayHoliday || isOffDay) return;
    const timer = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 98) {
          setIsCompleted(true);
          return 100;
        }
        return prev + 1;
      });
    }, 2200);

    return () => clearInterval(timer);
  }, [isCompleted, isAuthenticated, isTodayHoliday, isOffDay]);

  const remainingMinutes = Math.max(1, Math.round((100 - simulatedProgress) * 0.25));

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-5 bg-slate-950 text-slate-100">
        <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-base font-extrabold text-white">İşçi Servis Doğrulama</h2>
            <p className="text-xs text-slate-400">
              Servis takibi için firma tarafından verilen 4 haneli takip kodunu giriniz.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Servis Plakası</label>
              <input
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
                placeholder="26 S 2244"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase text-center"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">4 Haneli Takip Kodu</label>
              <input
                type="password"
                maxLength={4}
                value={inputPasscode}
                onChange={(e) => setInputPasscode(e.target.value)}
                placeholder="••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-mono font-black text-amber-400 text-center tracking-widest"
              />
            </div>

            {authError && (
              <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer transition-transform active:scale-95"
            >
              Servisi Doğrula & Takip Et
            </button>
          </form>

          <p className="text-[10px] text-slate-500 text-center">
            Demo Kodu: <strong>4819</strong> (Plaka: 26 S 2244)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 pb-20">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white">İşçi Personel Takip</h1>
              <p className="text-[11px] text-slate-400">
                Arçelik Tesisleri · {currentWeekIndex}. Hafta ({defaultWeekShift.label})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg border ${
                activeBackupPlate
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              }`}
            >
              {displayedPlate}
            </span>
          </div>
        </div>

        {/* Requirement 2: Otomatik Vardiya Düzeni Bilgi Çubuğu & "Bugün Farklı Saatteyim" */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-300 font-bold block">
                  Otomatik Vardiya: {currentWeekIndex}. Hafta · {defaultWeekShift.label} ({defaultWeekShift.hour})
                </span>
                <span className="text-[10px] text-slate-400">
                  Haftalık İzin: <strong>{shiftCycle.offDay}</strong> · 3 haftalık döngüde
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowShiftConfigModal(true)}
              title="Vardiya Düzenini Ayarla"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Row: Override Button + Active Banner */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
            {todayOverride?.active ? (
              <div className="flex-1 flex items-center justify-between p-2 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs text-amber-300">
                <span>
                  ⚡ Bugüne Özel: <strong>{todayOverride.hour} ({todayOverride.label})</strong>
                </span>
                <button
                  onClick={() => setTodayOverride(null)}
                  className="text-[10px] font-bold text-amber-200 underline cursor-pointer hover:text-white"
                >
                  Varsayılana Dön
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTodayOverrideModal(true)}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Bugün farklı saatteyim</span>
              </button>
            )}
          </div>
        </div>

        {/* Requirement 3: Broadcast notification when backup vehicle is assigned */}
        {activeBackupPlate && (
          <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-2xl flex items-center gap-2.5 text-xs text-amber-200 shadow-lg animate-in slide-in-from-top">
            <Truck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-extrabold text-amber-300">
                Servisiniz değişti: {activeBackupPlate}
              </p>
              <p className="text-[11px] text-slate-300">
                26 S 2244 arızalandığı için yedek araç olarak <strong>{activeBackupPlate}</strong> ({activeBackupDriver}) görevlendirildi.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
        {/* Requirement 4: Tatil günlerinde işçi takibi "Bugün servis yok" gösterir */}
        {isTodayHoliday ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3.5 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Resmi Tatil Bildirimi
              </span>
              <h3 className="text-lg font-black text-white">Bugün servis yok</h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                <strong>{holidayName}</strong> resmi tatili sebebiyle bugün personel servisi seferleri bulunmamaktadır.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-left space-y-1">
              <p className="text-slate-300 font-semibold">ℹ️ Tatil Bilgilendirmesi:</p>
              <p>Bir sonraki vardiya başlangıcında servisleriniz normal çalışma saatinde duraklarınızda olacaktır.</p>
            </div>
          </div>
        ) : isOffDay ? (
          /* Weekly Off-Day (Salı) */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3.5 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-sky-500/20 border-2 border-sky-500/40 flex items-center justify-center text-sky-400 mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Haftalık Tatil Günü ({shiftCycle.offDay})
              </span>
              <h3 className="text-lg font-black text-white">Bugün servis yok</h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                Haftalık tatil gününüz ({shiftCycle.offDay}) olduğu için adınıza servis planlanmamıştır.
              </p>
            </div>
            <button
              onClick={() => setShowTodayOverrideModal(true)}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Bugün Fazla Mesaiye Gideceğim</span>
            </button>
          </div>
        ) : isCompleted ? (
          /* COMPLETED STATE */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white">Servis vardı, takip sona erdi</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              <strong className="text-white">{displayedPlate}</strong> plakalı servis aracı Arçelik fabrikasına ulaştı. Araç haritadan kaldırılmıştır.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setSimulatedProgress(60);
                }}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yeniden Takip Başlat</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE SERVICE TRACKING STATE */
          <div className="space-y-3.5">
            {/* Live Map with active plate */}
            <GeofenceMap
              factory={{
                id: 'f1',
                name: 'Arçelik Fabrikası',
                shortName: 'Arçelik Nizamiye',
                code: 'ARC',
                address: 'OSB 1. Cadde',
                geofenceRadiusMeters: 140,
                coordinates: { lat: 39.7745, lng: 30.5890 },
                currentSinglePrice: 0,
                currentDoublePrice: 0,
                color: '#0284c7',
                activeShifts: [],
              }}
              busPositionPercent={simulatedProgress}
              plate={displayedPlate}
              showBus={true}
              isCompleted={false}
              isPassengerView={true}
              heightClass="h-64"
            />

            {/* Approaching Alert Notification */}
            {remainingMinutes <= 5 && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center gap-2.5 text-xs text-amber-300 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Servisin 5 dakika uzakta!</strong> Biniş durağınıza ({boardingStop}) geçiniz.
                </span>
              </div>
            )}

            {/* Card Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Biniş Noktanız</span>
                  <h3 className="text-base font-extrabold text-white">{boardingStop}</h3>
                  <p className="text-xs text-sky-400 font-medium mt-0.5">
                    Servis Saati: {activeServiceHour} · {activeBackupPlate ? activeBackupDriver : baseVehicle.driverName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono block">
                    {remainingMinutes} <span className="text-xs font-normal text-slate-400">dk</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold block">Tahmini Varış</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Dönüşümlü 3'lü Vardiya Düzeni</span>
                <span className="text-slate-200 font-semibold font-mono">{displayedPlate}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: "Bugün farklı saatteyim" (Requirement 2) */}
      {showTodayOverrideModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Bugün Farklı Saatteyim</h3>
              </div>
              <button
                onClick={() => setShowTodayOverrideModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Bu değişiklik <strong>yalnızca bugünkü seferiniz</strong> için geçerlidir. Yarın otomatik vardiya düzeninize geri dönülecektir.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setTodayOverride({ active: true, label: 'Gündüz Vardiyası', hour: '07:00' });
                  setShowTodayOverrideModal(false);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-bold text-white text-xs block">Gündüz Vardiyası (07:00)</span>
                  <span className="text-[10px] text-slate-400">Sabah seferine katıl</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setTodayOverride({ active: true, label: 'Akşam Vardiyası', hour: '15:00' });
                  setShowTodayOverrideModal(false);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-bold text-white text-xs block">Akşam Vardiyası (15:00)</span>
                  <span className="text-[10px] text-slate-400">Öğleden sonra seferine katıl</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setTodayOverride({ active: true, label: 'Gece Vardiyası', hour: '23:00' });
                  setShowTodayOverrideModal(false);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-bold text-white text-xs block">Gece Vardiyası (23:00)</span>
                  <span className="text-[10px] text-slate-400">Gece seferine katıl</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Custom Hour */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">Özel Saat Girin (Ek Mesai vb.)</span>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={customOverrideHour}
                    onChange={(e) => setCustomOverrideHour(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
                  />
                  <button
                    onClick={() => {
                      setTodayOverride({ active: true, label: 'Özel Mesai', hour: customOverrideHour });
                      setShowTodayOverrideModal(false);
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: "Otomatik Vardiya Düzeni Kurulumu (Bir Kez Gir)" (Requirement 2) */}
      {showShiftConfigModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Vardiya Düzenini Ayarla</h3>
              </div>
              <button
                onClick={() => setShowShiftConfigModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Vardiya düzeninizi bir kez girin. Uygulama her hafta hangi vardiyada olduğunuzu otomatik bilir ve döngü 3 haftada bir başa döner.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  1. Hafta Vardiyası & Saati
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={shiftCycle.week1.label}
                    onChange={(e) =>
                      setShiftCycle({
                        ...shiftCycle,
                        week1: { ...shiftCycle.week1, label: e.target.value },
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="time"
                    value={shiftCycle.week1.hour}
                    onChange={(e) =>
                      setShiftCycle({
                        ...shiftCycle,
                        week1: { ...shiftCycle.week1, hour: e.target.value },
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  2. Hafta Vardiyası & Saati
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={shiftCycle.week2.label}
                    onChange={(e) =>
                      setShiftCycle({
                        ...shiftCycle,
                        week2: { ...shiftCycle.week2, label: e.target.value },
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="time"
                    value={shiftCycle.week2.hour}
                    onChange={(e) =>
                      setShiftCycle({
                        ...shiftCycle,
                        week2: { ...shiftCycle.week2, hour: e.target.value },
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  3. Hafta Vardiyası & Saati (Başa Döner)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={shiftCycle.week3.label}
                    onChange={(e) =>
                      setShiftCycle({
                        ...shiftCycle,
                        week3: { ...shiftCycle.week3, label: e.target.value },
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="time"
                    value={shiftCycle.week3.hour}
                    onChange={(e) =>
                      setShiftCycle({
                        ...shiftCycle,
                        week3: { ...shiftCycle.week3, hour: e.target.value },
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Haftalık Tatil Günü
                </label>
                <select
                  value={shiftCycle.offDay}
                  onChange={(e) => setShiftCycle({ ...shiftCycle, offDay: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Pazartesi">Pazartesi</option>
                  <option value="Salı">Salı (Varsayılan Fabrika Tatili)</option>
                  <option value="Çarşamba">Çarşamba</option>
                  <option value="Perşembe">Perşembe</option>
                  <option value="Cuma">Cuma</option>
                  <option value="Cumartesi">Cumartesi</option>
                  <option value="Pazar">Pazar</option>
                </select>
              </div>

              {/* Demo test helper */}
              <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 block font-semibold">Demo Döngü Testi:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setCurrentWeekIndex(w as 1 | 2 | 3)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        currentWeekIndex === w ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {w}. Hafta
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowShiftConfigModal(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Kaydet & Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
