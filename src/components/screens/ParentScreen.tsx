import React, { useState } from 'react';
import { ParentChild, Vehicle } from '../../types';
import { GeofenceMap } from '../GeofenceMap';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  XCircle,
  Plus,
  Phone,
  UserCheck,
  Home,
  School
} from 'lucide-react';

interface ParentScreenProps {
  childrenList: ParentChild[];
  vehicles: Vehicle[];
  onToggleChildBoarding: (childId: string) => void;
  onAddChild: (newChild: Omit<ParentChild, 'id'>) => void;
  isTodayHoliday?: boolean;
  holidayName?: string;
  backupIncidentPlate?: string;
  backupDriverName?: string;
}

export const ParentScreen: React.FC<ParentScreenProps> = ({
  childrenList,
  vehicles,
  onToggleChildBoarding,
  onAddChild,
  isTodayHoliday = false,
  holidayName = '29 Ekim Cumhuriyet Bayramı',
  backupIncidentPlate,
  backupDriverName,
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || 'c-1');
  const [direction, setDirection] = useState<'morning' | 'afternoon'>('morning');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Status Notification Simulator (Requirement I: "yaklaştı / okula ulaştı / eve bırakıldı")
  const [activeStage, setActiveStage] = useState<'approaching' | 'at_school' | 'at_home'>('approaching');

  // New child state with KVKK consent (Requirement I)
  const [newChildName, setNewChildName] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newPlate, setNewPlate] = useState('26 S 1085');
  const [newPasscode, setNewPasscode] = useState('7290');
  const [kvkkConsent, setKvkkConsent] = useState(true);

  const activeChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];
  const assignedVehicle = vehicles.find((v) => v.plate === activeChild?.plate);

  // Requirement 3: Backup vehicle assignment for student
  const activeBackupPlate = backupIncidentPlate || assignedVehicle?.backupPlate;
  const activeBackupDriver = backupDriverName || assignedVehicle?.backupDriverName;
  const displayedPlate = activeBackupPlate || activeChild?.plate;

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    if (!kvkkConsent) {
      alert('Lütfen KVKK veli onayını işaretleyiniz.');
      return;
    }

    onAddChild({
      childName: newChildName.trim(),
      schoolName: newSchool || 'Eskişehir Anadolu Lisesi',
      plate: newPlate,
      passcode: newPasscode,
      morningPickupTime: '07:40',
      afternoonDropoffTime: '15:30',
      isBoardingToday: true,
      status: 'home',
      parentAccessActive: true,
      driverName: assignedVehicle?.driverName || 'Ali Yıldız',
      driverPhone: assignedVehicle?.driverPhone || '0544 333 45 67',
    });

    setShowAddModal(false);
    setNewChildName('');
    setNewSchool('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white">Veli Bilgilendirme Portalı</h1>
              <p className="text-[11px] text-slate-400">Öğrenci Güvenli Servis Takibi</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Çocuk Ekle</span>
          </button>
        </div>

        {/* Children Multi-Card Selector (Requirement I: Birden fazla çocuk) */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-0.5">
          {childrenList.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChildId(c.id)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                selectedChildId === c.id
                  ? 'bg-rose-500 text-slate-950 font-bold shadow-md shadow-rose-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{c.childName}</span>
              {!c.isBoardingToday && (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Bugün binmeyecek" />
              )}
            </button>
          ))}
        </div>

        {/* Direction Switcher (Requirement: Sabah (Evden Okula) & Akşam (Okuldan Eve)) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
          <button
            onClick={() => setDirection('morning')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              direction === 'morning' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Sabah (Evden Okula)
          </button>
          <button
            onClick={() => setDirection('afternoon')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              direction === 'afternoon' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Akşam (Okuldan Eve)
          </button>
        </div>

        {/* Requirement 3: Broadcast notification when backup vehicle is assigned */}
        {activeBackupPlate && (
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/50 rounded-xl flex items-center gap-2 text-xs text-amber-200 animate-in slide-in-from-top">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Servisiniz değişti: {activeBackupPlate}</strong> ({activeBackupDriver})
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
        {/* Requirement 4: Tatil günlerinde öğrenci takibi "Bugün servis yok" gösterir */}
        {isTodayHoliday ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3.5 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Okul Tatili Bildirimi
              </span>
              <h3 className="text-lg font-black text-white">Bugün servis yok</h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                <strong>{holidayName}</strong> resmi tatili sebebiyle okullar kapalıdır ve bugün öğrenci servisi hizmet vermemektedir.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-left">
              <p className="text-slate-300 font-semibold mb-1">ℹ️ Servis Bilgilendirmesi:</p>
              <p>Tatil bitimini takip eden ilk ders gününde servis araçlarımız aynı saatte kapınızda olacaktır.</p>
            </div>
          </div>
        ) : (
          <>
        {/* Requirement I: "Bugün Binmeyecek" Toggle Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-medium">Öğrenci Servis Durumu</span>
              <h3 className="text-base font-extrabold text-white">{activeChild.childName}</h3>
              <p className="text-xs text-slate-400">{activeChild.schoolName}</p>
            </div>

            <button
              onClick={() => onToggleChildBoarding(activeChild.id)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                !activeChild.isBoardingToday
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {!activeChild.isBoardingToday ? '⚠️ Bugün Binmeyecek' : '✅ Bugün Biniyor'}
            </button>
          </div>

          {!activeChild.isBoardingToday ? (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300">
              * Şoförün ({activeChild.driverName}) tabletine{' '}
              <strong>"{activeChild.childName} bugün binmeyecek"</strong> olarak iletildi. Servis kapınıza uğramayacaktır.
            </div>
          ) : (
            <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
              <span>Bugün servis kullanılmayacaksa butona basıp şoföre bildirebilirsiniz.</span>
              <button
                onClick={() => onToggleChildBoarding(activeChild.id)}
                className="text-[11px] font-bold text-rose-400 underline cursor-pointer"
              >
                İptal Et
              </button>
            </div>
          )}
        </div>

        {/* Live Tracking Map for Child */}
        {activeChild.isBoardingToday && (
          <div className="space-y-3">
            {/* Requirement I: 3 Durum Bildirimi Simülatörü ("yaklaştı / okula ulaştı / eve bırakıldı") */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[10.5px] text-slate-400 font-semibold block">
                Canlı Bildirim Aşaması (Simülasyon):
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10.5px] font-bold">
                <button
                  onClick={() => setActiveStage('approaching')}
                  className={`py-1.5 px-1 rounded-xl cursor-pointer text-center transition-colors ${
                    activeStage === 'approaching'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  1. Yaklaştı (5 dk)
                </button>
                <button
                  onClick={() => setActiveStage('at_school')}
                  className={`py-1.5 px-1 rounded-xl cursor-pointer text-center transition-colors ${
                    activeStage === 'at_school'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  2. Okula Ulaştı
                </button>
                <button
                  onClick={() => setActiveStage('at_home')}
                  className={`py-1.5 px-1 rounded-xl cursor-pointer text-center transition-colors ${
                    activeStage === 'at_home'
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  3. Eve Bırakıldı
                </button>
              </div>
            </div>

            {/* Notification Banner depending on activeStage */}
            {activeStage === 'approaching' && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-200 flex items-center gap-2 animate-in fade-in">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  🔔 <strong>Servis 5 dakika uzakta!</strong> Lütfen {activeChild.childName}'i kapıya hazırlayınız.
                </span>
              </div>
            )}

            {activeStage === 'at_school' && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  🎓 <strong>Okula Ulaştı:</strong> {activeChild.childName} saat 08:12 itibarıyla okul bahçesine güvenle giriş yaptı.
                </span>
              </div>
            )}

            {activeStage === 'at_home' && (
              <div className="p-3 bg-sky-500/15 border border-sky-500/40 rounded-2xl text-xs text-sky-200 flex items-center gap-2 animate-in fade-in">
                <Home className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  🏠 <strong>Eve Bırakıldı:</strong> {activeChild.childName} saat 15:45 itibarıyla ev adresinize teslim edilmiştir.
                </span>
              </div>
            )}

            <GeofenceMap
              factory={{
                id: 'school',
                name: activeChild.schoolName,
                shortName: activeChild.schoolName.split(' ')[0],
                code: 'OKUL',
                address: 'Okul Önü Girişi',
                geofenceRadiusMeters: 100,
                coordinates: { lat: 39.77, lng: 30.58 },
                currentSinglePrice: 0,
                currentDoublePrice: 0,
                color: '#f43f5e',
                activeShifts: [],
              }}
              busPositionPercent={activeStage === 'at_school' ? 100 : activeStage === 'at_home' ? 100 : 70}
              plate={activeChild.plate}
              showBus={activeStage !== 'at_school' && activeStage !== 'at_home'}
              isCompleted={activeStage === 'at_school' || activeStage === 'at_home'}
              isPassengerView={true}
              heightClass="h-56"
            />

            {/* School Arrival / Departure Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Servis Plakası:</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                  {activeChild.plate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Şoför:</span>
                <span className="font-bold text-slate-200">{activeChild.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Servis Takip Kodu:</span>
                <span className="font-mono font-bold text-amber-400">{activeChild.passcode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Veli İletişim:</span>
                <a
                  href={`tel:${activeChild.driverPhone}`}
                  className="font-mono font-bold text-sky-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  {activeChild.driverPhone} (Şoförü Ara)
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Holiday Notice (Requirement I: Tatil Günleri) */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Resmi Tatil Takvimi:</span>
          </p>
          <p>
            29 Ekim Cumhuriyet Bayramı'nda tüm ilk ve ortaöğretim okullarında öğrenci servisi çalışmayacaktır.
          </p>
        </div>
        </>
        )}
      </div>

      {/* Add Child Modal (Requirement I: çocuk ekleme + takip kodu + KVKK veli onayı) */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleCreateChild}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl"
          >
            <h3 className="font-bold text-sm text-white">Yeni Öğrenci Tanımla</h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Çocuğun Adı Soyadı</label>
              <input
                type="text"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="Örn: Ayşe Kaya"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Okul Adı</label>
              <input
                type="text"
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                placeholder="Örn: Eskişehir Fatih Fen Lisesi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Servis Plakası</label>
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono uppercase font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Takip Kodu</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-mono font-bold"
                />
              </div>
            </div>

            {/* Requirement I: KVKK Veli Onayı */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={kvkkConsent}
                  onChange={(e) => setKvkkConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0 cursor-pointer"
                />
                <span>
                  6698 sayılı KVKK kapsamında çocuğumun konum ve servis verilerinin takibini ve bildirim almayı
                  onaylıyorum.
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!kvkkConsent}
                className={`flex-1 py-2 font-bold rounded-xl text-xs cursor-pointer shadow-md ${
                  kvkkConsent ? 'bg-rose-500 hover:bg-rose-400 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
