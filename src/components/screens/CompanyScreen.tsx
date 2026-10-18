import React, { useState } from 'react';
import {
  Announcement,
  CompanySettings,
  DriverProfile,
  Factory,
  Holiday,
  PriceHistoryEntry,
  Trip,
  TripCorrection,
  TypeCorrection,
  Vehicle
} from '../../types';
import { formatTL } from '../../utils/formatters';
import { GeofenceMap } from '../GeofenceMap';
import {
  Building2,
  FileSpreadsheet,
  MapPin,
  TrendingUp,
  Truck,
  Plus,
  CheckCircle,
  Download,
  PhoneCall,
  ShieldAlert,
  Check,
  X,
  Lock,
  Unlock,
  KeyRound,
  FileCheck,
  Megaphone,
  RefreshCw,
  Send,
  UserPlus,
  Calendar,
  Trash2
} from 'lucide-react';

interface CompanyScreenProps {
  factories: Factory[];
  vehicles: Vehicle[];
  drivers: DriverProfile[];
  trips: Trip[];
  priceHistory: PriceHistoryEntry[];
  corrections: TripCorrection[];
  typeCorrections: TypeCorrection[];
  announcements: Announcement[];
  companySettings: CompanySettings;
  isMonthLocked: boolean;
  onToggleMonthLock: () => void;
  onTogglePassengerCallDriver: (enabled: boolean) => void;
  onUpdateVehicleFactories: (plate: string, factoryIds: string[]) => void;
  onRegeneratePasscode: (plate: string) => void;
  onApproveCorrection: (correctionId: string) => void;
  onRejectCorrection: (correctionId: string) => void;
  onApproveTypeCorrection: (id: string) => void;
  onRejectTypeCorrection: (id: string) => void;
  onApproveManualTrip: (tripId: string) => void;
  onRejectManualTrip: (tripId: string) => void;
  onSendAnnouncement: (title: string, message: string, target: 'all_drivers' | 'factory_passengers') => void;
  onAddFactory: (newFactory: Omit<Factory, 'id'>) => void;
  onUpdateGeofenceRadius: (factoryId: string, radius: number) => void;
  onUpdatePrice: (factoryId: string, singlePrice: number, doublePrice: number, note: string) => void;
  onAddDriver: (driver: Omit<DriverProfile, 'id'>) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'driverId' | 'dailyKm' | 'weeklyKm' | 'monthlyKm' | 'coordinates'>) => void;
  holidays?: Holiday[];
  isTodayHoliday?: boolean;
  onToggleTodayHoliday?: () => void;
  onAddHoliday?: (newH: Omit<Holiday, 'id'>) => void;
  onDeleteHoliday?: (id: string) => void;
}

export const CompanyScreen: React.FC<CompanyScreenProps> = ({
  factories,
  vehicles,
  drivers,
  trips,
  priceHistory,
  corrections,
  typeCorrections,
  announcements,
  companySettings,
  isMonthLocked,
  onToggleMonthLock,
  onTogglePassengerCallDriver,
  onUpdateVehicleFactories,
  onRegeneratePasscode,
  onApproveCorrection,
  onRejectCorrection,
  onApproveTypeCorrection,
  onRejectTypeCorrection,
  onApproveManualTrip,
  onRejectManualTrip,
  onSendAnnouncement,
  onAddFactory,
  onUpdateGeofenceRadius,
  onUpdatePrice,
  onAddDriver,
  onAddVehicle,
  holidays = [],
  isTodayHoliday = false,
  onToggleTodayHoliday,
  onAddHoliday,
  onDeleteHoliday,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'approvals' | 'documents' | 'fleet' | 'geofence' | 'pricing' | 'holidays'>('report');
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>(factories[0]?.id || 'f1');
  const [reportVehicleFilter, setReportVehicleFilter] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Modals
  const [showAddFactoryModal, setShowAddFactoryModal] = useState<boolean>(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState<boolean>(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState<boolean>(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);
  const [editingVehiclePlate, setEditingVehiclePlate] = useState<string | null>(null);
  const [tempAssignedFactories, setTempAssignedFactories] = useState<string[]>([]);

  // Requirement 4: Tatil Günleri state for Company
  const [showAddHolidayModal, setShowAddHolidayModal] = useState<boolean>(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('29.10.2026');
  const [newHolidayDesc, setNewHolidayDesc] = useState('');
  const [newHolidayAppliesTo, setNewHolidayAppliesTo] = useState<'all' | 'factory' | 'school'>('all');

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTarget, setAnnTarget] = useState<'all_drivers' | 'factory_passengers'>('all_drivers');

  // New Driver Form
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverPlate, setNewDriverPlate] = useState('26 S 2244');

  // New Vehicle Form
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');

  // New Factory Form
  const [newFactoryName, setNewFactoryName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRadius, setNewRadius] = useState(130);
  const [newSinglePrice, setNewSinglePrice] = useState('110');
  const [newDoublePrice, setNewDoublePrice] = useState('145');

  const selectedFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];

  // End of Month Hak Ediş Calculations (Seçil Turizm: All 4 company vehicles)
  const confirmedOctoberTrips = trips.filter((t) => {
    if (t.status !== 'confirmed') return false;
    if (!t.dateStr.includes('.10.2026')) return false;
    if (reportVehicleFilter !== 'all' && t.plate !== reportVehicleFilter) return false;
    return true;
  });

  const factoryReportData = factories.map((f) => {
    const fTrips = confirmedOctoberTrips.filter((t) => t.factoryId === f.id);
    const tekTrips = fTrips.filter((t) => t.type === 'tek');
    const ciftTrips = fTrips.filter((t) => t.type === 'cift');

    const tekCount = tekTrips.length;
    const ciftCount = ciftTrips.length;
    const tekTotal = tekTrips.reduce((acc, curr) => acc + curr.priceApplied, 0);
    const ciftTotal = ciftTrips.reduce((acc, curr) => acc + curr.priceApplied, 0);
    const total = tekTotal + ciftTotal;

    return {
      factory: f,
      tekCount,
      ciftCount,
      tekTotal,
      ciftTotal,
      total,
      tripCount: fTrips.length,
    };
  }).filter((item) => item.tripCount > 0);

  const grandTekTotal = factoryReportData.reduce((acc, curr) => acc + curr.tekTotal, 0);
  const grandCiftTotal = factoryReportData.reduce((acc, curr) => acc + curr.ciftTotal, 0);
  const grandTotal = grandTekTotal + grandCiftTotal;
  const totalTripsCount = factoryReportData.reduce((acc, curr) => acc + curr.tripCount, 0);

  // Pending Approvals
  const pendingCorrections = corrections.filter((c) => c.status === 'pending_company_approval');
  const pendingTypeCorrections = typeCorrections.filter((tc) => tc.status === 'pending_company_approval');
  const pendingManualTrips = trips.filter((t) => t.isManualEntry && t.manualStatus === 'pending_company_approval');
  const totalPendingApprovals = pendingCorrections.length + pendingTypeCorrections.length + pendingManualTrips.length;

  const handleExport = (type: 'pdf' | 'excel') => {
    setExportNotice(
      type === 'pdf'
        ? 'Ekim 2026 Hak Ediş Bordrosu PDF formatında hazırlandı.'
        : 'Ekim 2026 Sefer Dökümü Excel (.xlsx) formatında hazırlandı.'
    );
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    onSendAnnouncement(annTitle.trim(), annMessage.trim(), annTarget);
    setShowAnnouncementModal(false);
    setAnnTitle('');
    setAnnMessage('');
    setExportNotice('Duyuru başarıyla tüm ilgililere iletildi.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm text-white">Seçil Turizm</h1>
                {isMonthLocked && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Ay Kilitli
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Merkez Filo Yönetimi · {vehicles.length} Servis Aracı</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl cursor-pointer"
              title="Duyuru Gönder"
            >
              <Megaphone className="w-4 h-4" />
            </button>
            {/* Requirement A.2: Rapor Al button (Fixed from Rapor AI) */}
            <button
              onClick={() => setActiveTab('report')}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Rapor Al</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (7 Tabs covering Hak Ediş, Onaylar, Evraklar, Filo, Geofence, Fiyatlar, Tatil) */}
        <div className="grid grid-cols-7 gap-1 mt-3 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-[9.5px]">
          <button
            onClick={() => setActiveTab('report')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'report' ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Hak Ediş
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center relative ${
              activeTab === 'approvals' ? 'bg-slate-800 text-amber-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            <span>Onaylar</span>
            {totalPendingApprovals > 0 && (
              <span className="ml-0.5 px-1 py-0.2 bg-rose-500 text-white text-[8px] rounded-full font-bold">
                {totalPendingApprovals}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'documents' ? 'bg-slate-800 text-rose-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Evrak
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'fleet' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Kullanıcı
          </button>
          <button
            onClick={() => setActiveTab('geofence')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'geofence' ? 'bg-slate-800 text-sky-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Geofence
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'pricing' ? 'bg-slate-800 text-purple-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Fiyat
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'holidays' ? 'bg-slate-800 text-amber-300 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Tatil
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
        {exportNotice && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* TAB 1: AY SONU HAK EDİŞ RAPORU & AY KAPANIŞI */}
        {activeTab === 'report' && (
          <div className="space-y-3.5">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  Dönem: 01.10.2026 - 31.10.2026
                </span>
                <h2 className="text-base font-extrabold text-white">Ekim Hak Ediş Raporu</h2>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Requirement D: Ay Kapanışı Düğmesi */}
                <button
                  onClick={onToggleMonthLock}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    isMonthLocked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                  }`}
                >
                  {isMonthLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{isMonthLocked ? 'Ay Kilitli' : 'Ayı Kapat'}</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              </div>
            </div>

            {isMonthLocked && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Ekim 2026 Ayı Kapatıldı:</strong> Bordro kesinleşmiştir. Hiçbir şoför veya araç sahibi bu ay için sefer veya fiyat değişikliği yapamaz.
                </span>
              </div>
            )}

            {/* GRAND TOTAL HIGHLIGHT CARD (Requirement 11: HAK EDİŞ TOPLAMI) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>FİRMA FATURA VE HAK EDİŞ BİLANÇOSU</span>
                <span className="font-mono text-emerald-400 font-bold">{totalTripsCount} Toplam Sefer</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Teklerin Toplamı</span>
                  <span className="text-base font-bold text-white">{formatTL(grandTekTotal)}</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-sans">Çiftlerin Toplamı</span>
                  <span className="text-base font-bold text-sky-400">{formatTL(grandCiftTotal)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    FABRİKALARDAN ALINACAK
                  </span>
                  <h3 className="text-sm font-bold text-white">HAK EDİŞ TOPLAMI</h3>
                </div>
                <p className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                  {formatTL(grandTotal)}
                </p>
              </div>
            </div>

            {/* Per-Factory Details */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-400 px-1">Fabrika Bazında Hesap Dökümü</span>
              {factoryReportData.map((item) => (
                <div
                  key={item.factory.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white">{item.factory.shortName}</h4>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{formatTL(item.total)}</span>
                  </div>

                  <div className="bg-slate-950/80 rounded-xl p-3 space-y-2 font-mono text-xs border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>{item.factory.shortName} – {item.tekCount} tek × {formatTL(item.factory.currentSinglePrice)}</span>
                      <span className="font-bold text-white">{formatTL(item.tekTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>{item.factory.shortName} – {item.ciftCount} çift × {formatTL(item.factory.currentDoublePrice)}</span>
                      <span className="font-bold text-sky-400">{formatTL(item.ciftTotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ONAY BEKLEYENLER (Requirement D: Manual trips, account changes, TEK/ÇİFT changes) */}
        {activeTab === 'approvals' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-400">
                Firma Onayı Bekleyen İşlemler ({totalPendingApprovals})
              </span>
            </div>

            {totalPendingApprovals === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                Bekleyen sefer düzeltme veya elle giriş talebi bulunmuyor.
              </div>
            ) : null}

            {/* 1. TEK / ÇİFT Type Corrections */}
            {pendingTypeCorrections.map((tc) => (
              <div key={tc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">TEK / ÇİFT Değişiklik Talebi</span>
                  <span className="text-[10px] font-mono text-slate-400">{tc.tripTime}</span>
                </div>
                <p className="text-xs text-white">
                  {tc.plate} ({tc.requestedBy}) · {tc.factoryName} seferi:{' '}
                  <span className="line-through text-slate-400 uppercase">{tc.fromType}</span> ➔{' '}
                  <strong className="text-emerald-400 uppercase">{tc.toType} SEFER</strong>
                </p>
                {tc.reason && <p className="text-[10px] text-slate-400 italic">Gerekçe: "{tc.reason}"</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onRejectTypeCorrection(tc.id)}
                    className="flex-1 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => onApproveTypeCorrection(tc.id)}
                    className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            ))}

            {/* 2. On Behalf Of Account Corrections */}
            {pendingCorrections.map((c) => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400">Hesap Düzeltme Talebi</span>
                  <span className="text-[10px] font-mono text-slate-400">{c.tripTime}</span>
                </div>
                <p className="text-xs text-white">
                  {c.plate} · {c.factoryName} sefer hesabı:{' '}
                  <span className="line-through text-slate-400">{c.oldOnBehalfOf}</span> ➔{' '}
                  <strong className="text-sky-300">{c.newOnBehalfOf}</strong>
                </p>
                {c.reason && <p className="text-[10px] text-slate-400 italic">Gerekçe: "{c.reason}"</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onRejectCorrection(c.id)}
                    className="flex-1 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => onApproveCorrection(c.id)}
                    className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            ))}

            {/* 3. Manual Trips */}
            {pendingManualTrips.map((mt) => (
              <div key={mt.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">Elle Sefer Giriş Onayı</span>
                  <span className="text-[10px] font-mono text-slate-400">{mt.timeStr}</span>
                </div>
                <p className="text-xs text-white">
                  {mt.plate} ({mt.driverName}) · {mt.factoryName} – {mt.type === 'cift' ? 'ÇİFT' : 'TEK'} SEFER
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onRejectManualTrip(mt.id)}
                    className="flex-1 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => onApproveManualTrip(mt.id)}
                    className="flex-1 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Seferi Onayla
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: EVRAK TAKİBİ (Requirement F: Muayene, Sigorta, Kasko, Ruhsat & SRC, Ehliyet, Psikoteknik) */}
        {activeTab === 'documents' && (
          <div className="space-y-3.5">
            {/* Warning Banner */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1 text-xs">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Yaklaşan Evrak Bitiş Uyarıları (15 - 30 Gün)</span>
              </h4>
              <p className="text-[11px] text-slate-300">
                26 S 2244 plakasının <strong>Zorunlu Trafik Sigortası 15 gün sonra</strong> (01.11.2026) sona eriyor.
              </p>
            </div>

            {/* Vehicle Documents */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 px-1">Araç Resmi Evrakları</span>
              {vehicles.map((v) => (
                <div key={v.plate} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                      {v.plate}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{v.driverName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-sans">Araç Muayenesi</span>
                      <span className="text-emerald-400 font-bold">{v.documents.inspectionExpiry} (Geçerli)</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-sans">Trafik Sigortası</span>
                      <span className="text-amber-400 font-bold">{v.documents.trafficInsuranceExpiry} (15 Gün)</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-sans">Kasko Poliçesi</span>
                      <span className="text-emerald-400 font-bold">{v.documents.comprehensiveInsuranceExpiry}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-sans">Belediye İzin / Ruhsat</span>
                      <span className="text-emerald-400 font-bold">{v.documents.licenseRegistrationExpiry}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Driver Documents */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-400 px-1">Şoför Mesleki Yeterlilik Belgeleri</span>
              {drivers.map((d) => (
                <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{d.name}</span>
                    <span className="text-xs text-amber-300 font-mono">{d.assignedPlate}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-mono">
                    <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px] font-sans">Ehliyet</span>
                      <span className="text-emerald-400 font-bold">Geçerli</span>
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px] font-sans">SRC Belgesi</span>
                      <span className="text-amber-400 font-bold">{d.documents.srcExpiry}</span>
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-slate-500 block text-[9px] font-sans">Psikoteknik</span>
                      <span className="text-emerald-400 font-bold">Geçerli</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: KULLANICILAR, ARAÇLAR VE TAKİP KODLARI (Requirement D) */}
        {activeTab === 'fleet' && (
          <div className="space-y-3.5">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddDriverModal(true)}
                className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Şoför Ekle</span>
              </button>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sky-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Araç Ekle</span>
              </button>
            </div>

            {/* Passenger Phone Call Toggle */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Yolcular Şoförü Arayabilsin</h4>
                </div>
                <p className="text-[11px] text-slate-400">Açıldığında yolcu ekranında arama düğmesi çıkar.</p>
              </div>
              <button
                onClick={() => onTogglePassengerCallDriver(!companySettings.allowPassengerCallDriver)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  companySettings.allowPassengerCallDriver ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Vehicles List with 4-Digit Passcodes (Requirement D) */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 px-1">
                Kayıtlı Araçlar & 4 Haneli Takip Kodları
              </span>

              {vehicles.map((v) => (
                <div key={v.plate} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                          {v.plate}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{v.driverName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{v.model}</p>
                    </div>

                    {/* 4-digit passcode & regenerate button */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Yolcu Kodu</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-black text-amber-400 text-sm bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          {v.passengerPasscode}
                        </span>
                        <button
                          onClick={() => onRegeneratePasscode(v.plate)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                          title="Kodu Yenile"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Kilometre: {v.monthlyKm} km (Aylık)</span>
                    <button
                      onClick={() => {
                        setEditingVehiclePlate(v.plate);
                        setTempAssignedFactories([...v.assignedFactoryIds]);
                      }}
                      className="text-sky-400 font-bold hover:underline cursor-pointer"
                    >
                      Fabrika Yetkisi ({v.assignedFactoryIds.length})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GEOFENCE & FABRİKA EKLEME (Requirement D: Listede olmayan fabrikayı ortak listeye ekler) */}
        {activeTab === 'geofence' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Haritada Fabrika & Çember Belirleme</span>
                <h3 className="text-sm font-extrabold text-white">Geofence (Nizamiye) Ayarları</h3>
              </div>
              <button
                onClick={() => setShowAddFactoryModal(true)}
                className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Fabrika Ekle</span>
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-300">
              * Eklediğiniz fabrika ve çizilen çember ortak sisteme girer; firma olarak sadece kendi Tek/Çift fiyatınızı belirlersiniz.
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
              {factories.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFactoryId(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap ${
                    selectedFactoryId === f.id
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300'
                  }`}
                >
                  {f.shortName} ({f.geofenceRadiusMeters}m)
                </button>
              ))}
            </div>

            <GeofenceMap
              factory={selectedFactory}
              radiusMeters={selectedFactory.geofenceRadiusMeters}
              interactiveRadius={true}
              onRadiusChange={(r) => onUpdateGeofenceRadius(selectedFactory.id, r)}
              plate="26 S 2244"
              heightClass="h-64"
            />
          </div>
        )}

        {/* TAB 6: TARİFELER */}
        {activeTab === 'pricing' && (
          <div className="space-y-3.5">
            <span className="text-xs font-semibold text-slate-400 px-1">Seçil Turizm Fabrika Tarifeleri</span>
            {factories.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{f.name}</h4>
                  <span className="text-xs font-mono text-sky-400 font-bold">{f.code}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-sans">TEK SEFER</span>
                    <span className="text-base font-bold text-emerald-400">{formatTL(f.currentSinglePrice)}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px] font-sans">ÇİFT SEFER</span>
                    <span className="text-base font-bold text-sky-400">{formatTL(f.currentDoublePrice)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: TATİL GÜNLERİ (Requirement 4) */}
        {activeTab === 'holidays' && (
          <div className="space-y-3.5">
            {/* Quick Live Demo Test Switch */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-3xl space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Bugün Tatil İlan Et (Canlı Demo)
                  </h4>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">
                    İşçi ve veli ekranlarının "Bugün servis yok" durumunu test edin.
                  </p>
                </div>
                <button
                  onClick={onToggleTodayHoliday}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isTodayHoliday
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isTodayHoliday ? '🔴 Tatil Aktif (Servis Yok)' : '⚪ Normal Gün'}
                </button>
              </div>
            </div>

            {/* Holidays List with Add Holiday form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">Resmi & Kurumsal Tatil Günleri</h4>
                  <p className="text-[11px] text-slate-400">29 Ekim ve bayramlar hazır tanımlıdır</p>
                </div>
                <button
                  onClick={() => setShowAddHolidayModal(true)}
                  className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tatil Ekle</span>
                </button>
              </div>

              {/* List */}
              <div className="space-y-2 pt-1">
                {holidays.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{h.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            h.type === 'official'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {h.type === 'official' ? 'Resmi Tatil' : 'Firma İzni'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        📅 {h.dateStr} {h.description ? `· ${h.description}` : ''}
                      </p>
                    </div>

                    {h.type === 'custom' && onDeleteHoliday && (
                      <button
                        onClick={() => onDeleteHoliday(h.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Tatili Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Announcement (Duyuru Gönderme) */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAnnouncement}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>Firma Duyurusu Yayınla</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAnnouncementModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Hedef Kitle</label>
              <select
                value={annTarget}
                onChange={(e) => setAnnTarget(e.target.value as 'all_drivers' | 'factory_passengers')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all_drivers">Tüm Şoförler (4 Araç)</option>
                <option value="factory_passengers">Tüm Fabrika Yolcuları (İşçiler)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Duyuru Başlığı</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Örn: Bayram Sefer Düzeni"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Mesaj Metni</label>
              <textarea
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                rows={3}
                required
                placeholder="Duyuru detayını yazınız..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAnnouncementModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Yayınla</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Factory */}
      {showAddFactoryModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newFactoryName.trim()) return;
              onAddFactory({
                name: newFactoryName.trim(),
                shortName: newShortName || newFactoryName.split(' ')[0],
                code: `FAC-${Math.floor(100 + Math.random() * 900)}`,
                address: newAddress || 'Eskişehir OSB',
                geofenceRadiusMeters: newRadius,
                coordinates: { lat: 39.7700 + Math.random() * 0.02, lng: 30.5800 + Math.random() * 0.02 },
                currentSinglePrice: Number(newSinglePrice) || 100,
                currentDoublePrice: Number(newDoublePrice) || 130,
                color: '#0284c7',
                activeShifts: ['08:00 - 16:00', '16:00 - 24:00'],
              });
              setShowAddFactoryModal(false);
            }}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl"
          >
            <h3 className="font-bold text-sm text-white">Listede Olmayan Fabrikayı Ekle</h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Fabrika Adı</label>
              <input
                type="text"
                value={newFactoryName}
                onChange={(e) => setNewFactoryName(e.target.value)}
                placeholder="Örn: Paşabahçe Cam Sanayii"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tek Sefer (TL)</label>
                <input
                  type="number"
                  value={newSinglePrice}
                  onChange={(e) => setNewSinglePrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Çift Sefer (TL)</label>
                <input
                  type="number"
                  value={newDoublePrice}
                  onChange={(e) => setNewDoublePrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-sky-400 font-mono font-bold"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFactoryModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-sky-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Ortak Listeye Ekle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Driver */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newDriverName.trim()) return;
              onAddDriver({
                name: newDriverName.trim(),
                phone: newDriverPhone || '0532 000 00 00',
                assignedPlate: newDriverPlate,
                companyId: 'c1',
                accessStatus: 'active',
                documents: {
                  licenseExpiry: '2028-01-01',
                  srcExpiry: '2027-01-01',
                  psychoTestExpiry: '2027-01-01',
                },
              });
              setShowAddDriverModal(false);
              setNewDriverName('');
            }}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl"
          >
            <h3 className="font-bold text-sm text-white">Yeni Şoför Tanımla</h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Adı Soyadı</label>
              <input
                type="text"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                placeholder="Örn: Serdar Koç"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Telefon</label>
              <input
                type="text"
                value={newDriverPhone}
                onChange={(e) => setNewDriverPhone(e.target.value)}
                placeholder="0532..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Atanan Plaka</label>
              <input
                type="text"
                value={newDriverPlate}
                onChange={(e) => setNewDriverPlate(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDriverModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Şoförü Ekle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Vehicle */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newVehiclePlate.trim()) return;
              onAddVehicle({
                plate: newVehiclePlate.trim().toUpperCase(),
                model: newVehicleModel || 'Mercedes-Benz Sprinter',
                driverName: 'Atanmadı',
                driverPhone: '0530 000 00 00',
                assignedCompanyId: 'c1',
                assignedCompanyName: 'Seçil Turizm',
                ownerId: 'owner-1',
                assignedFactoryIds: ['f1', 'f2'],
                isOnline: true,
                passengerPasscode: String(Math.floor(1000 + Math.random() * 9000)),
                isKmEstimated: false,
                status: 'active',
                documents: {
                  inspectionExpiry: '2027-10-10',
                  trafficInsuranceExpiry: '2027-05-15',
                  comprehensiveInsuranceExpiry: '2027-05-15',
                  licenseRegistrationExpiry: '2027-10-10',
                },
              });
              setShowAddVehicleModal(false);
              setNewVehiclePlate('');
            }}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl"
          >
            <h3 className="font-bold text-sm text-white">Yeni Servis Aracı Ekle</h3>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Plaka</label>
              <input
                type="text"
                value={newVehiclePlate}
                onChange={(e) => setNewVehiclePlate(e.target.value.toUpperCase())}
                placeholder="Örn: 26 S 5590"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Araç Modeli / Kapasite</label>
              <input
                type="text"
                value={newVehicleModel}
                onChange={(e) => setNewVehicleModel(e.target.value)}
                placeholder="Örn: Otokar Sultan 29+1 (2024)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-sky-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Aracı Ekle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Factory Assignment */}
      {editingVehiclePlate && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white">
                {editingVehiclePlate} - Fabrika Yetkilendirme
              </h3>
              <button
                onClick={() => setEditingVehiclePlate(null)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {factories.map((f) => {
                const isChecked = tempAssignedFactories.includes(f.id);
                return (
                  <label
                    key={f.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs ${
                      isChecked
                        ? 'bg-sky-500/15 border-sky-500/40 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{f.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setTempAssignedFactories(tempAssignedFactories.filter((id) => id !== f.id));
                        } else {
                          setTempAssignedFactories([...tempAssignedFactories, f.id]);
                        }
                      }}
                      className="w-4 h-4 accent-sky-500 rounded"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingVehiclePlate(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (editingVehiclePlate) {
                    onUpdateVehicleFactories(editingVehiclePlate, tempAssignedFactories);
                    setEditingVehiclePlate(null);
                  }
                }}
                className="flex-1 py-2 bg-sky-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requirement 4: Add Custom Holiday Modal for Company */}
      {showAddHolidayModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newHolidayName.trim()) return;
              if (onAddHoliday) {
                onAddHoliday({
                  name: newHolidayName.trim(),
                  dateStr: newHolidayDate,
                  type: 'custom',
                  appliesTo: newHolidayAppliesTo,
                  description: newHolidayDesc.trim() || 'Seçil Turizm tarafından tanımlandı.',
                });
              }
              setShowAddHolidayModal(false);
              setNewHolidayName('');
              setNewHolidayDesc('');
            }}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white">Yeni Tatil Günü Ekle</h3>
              <button
                type="button"
                onClick={() => setShowAddHolidayModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Tatil / İzin Adı</label>
              <input
                type="text"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder="Örn: Yıllık Fabrika Bakım İzni"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tarih</label>
                <input
                  type="text"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  placeholder="29.10.2026"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Kapsam</label>
                <select
                  value={newHolidayAppliesTo}
                  onChange={(e) => setNewHolidayAppliesTo(e.target.value as 'all' | 'factory' | 'school')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="all">Tümü</option>
                  <option value="factory">Fabrika</option>
                  <option value="school">Okul</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Açıklama (İsteğe bağlı)</label>
              <input
                type="text"
                value={newHolidayDesc}
                onChange={(e) => setNewHolidayDesc(e.target.value)}
                placeholder="Tesis revizyonu sebebiyle servis yok"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddHolidayModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Tatili Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
