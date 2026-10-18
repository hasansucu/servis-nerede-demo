import React, { useState } from 'react';
import { Factory, ParentChild, Trip } from '../../types';
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Zap,
  ArrowRightLeft,
  Edit3,
  X,
  Send,
  Plus,
  AlertTriangle,
  Phone,
  ShieldAlert,
  ChevronDown,
  GraduationCap
} from 'lucide-react';

interface DriverScreenProps {
  trips: Trip[];
  factories: Factory[];
  onOpenConfirmation: (trip?: Trip) => void;
  onSyncOfflineTrips: () => void;
  onRequestCorrection: (tripId: string, newAccount: string, reason: string) => void;
  onRequestTypeCorrection?: (tripId: string, fromType: 'tek' | 'cift', toType: 'tek' | 'cift', reason: string) => void;
  onAddManualTrip?: (factoryId: string, type: 'tek' | 'cift', timeStr: string, reason: string) => void;
  onReportDelay?: (minutes: number) => void;
  onReportEmergency?: (type: 'breakdown' | 'accident', notes?: string) => void;
  onSelectVehiclePlate?: (plate: string) => void;
  isOffline: boolean;
  activePlate: string;
  driverName: string;
  onSwitchToOwner?: () => void;
  childrenList?: ParentChild[];
}

export const DriverScreen: React.FC<DriverScreenProps> = ({
  trips,
  factories,
  onOpenConfirmation,
  onSyncOfflineTrips,
  onRequestCorrection,
  onRequestTypeCorrection,
  onAddManualTrip,
  onReportDelay,
  onReportEmergency,
  onSelectVehiclePlate,
  isOffline,
  activePlate,
  driverName,
  onSwitchToOwner,
  childrenList = [],
}) => {
  // Tabs: today, pending, monthly, students
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'monthly' | 'students'>('today');

  // Vehicle Switcher State (Requirement G.1)
  const [currentPlate, setCurrentPlate] = useState<string>(activePlate);
  const [showPlateMenu, setShowPlateMenu] = useState<boolean>(false);

  // Delay Notification Modal / Menu State (Requirement G.4)
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [activeDelay, setActiveDelay] = useState<number | null>(null);

  // Emergency Modal State (Requirement G.5: Arıza & Kaza)
  const [emergencyModalType, setEmergencyModalType] = useState<'breakdown' | 'accident' | null>(null);
  const [emergencyNotes, setEmergencyNotes] = useState<string>('');
  const [activeEmergencyNotice, setActiveEmergencyNotice] = useState<string | null>(null);

  // Manual Trip Modal State (Requirement G.2: Elle Sefer Ekle)
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualFactoryId, setManualFactoryId] = useState<string>(factories[0]?.id || 'f1');
  const [manualType, setManualType] = useState<'tek' | 'cift'>('tek');
  const [manualTime, setManualTime] = useState<string>('16:30');
  const [manualReason, setManualReason] = useState<string>('Nizamiye kapısında internet çekmediği için geofence tetiklenmedi.');

  // Trip Correction Modal State (Requirement G.3: Kimin Hesabına & TEK/ÇİFT Düzeltme)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [correctionMode, setCorrectionMode] = useState<'account' | 'type'>('account');
  const [correctionTarget, setCorrectionTarget] = useState<string>('26 S 1085 (Ali Yıldız Yerine)');
  const [customPlateInput, setCustomPlateInput] = useState<string>('');
  const [targetType, setTargetType] = useState<'tek' | 'cift'>('cift');
  const [correctionReason, setCorrectionReason] = useState<string>('Yanlışlıkla kendi hesabıma basıldı.');

  // Filter trips for driver
  const driverTrips = trips.filter((t) => t.driverName === driverName || t.plate === currentPlate);
  const pendingTrips = driverTrips.filter((t) => t.status === 'pending');
  const todayTrips = driverTrips.filter(
    (t) => (t.dateStr === '17.10.2026' || t.dateStr === '15.10.2026') && (t.status === 'confirmed' || t.isManualEntry)
  );
  const unsyncedTrips = driverTrips.filter((t) => !t.synced);

  // October month trip counts (Zero price for driver)
  const octoberTrips = driverTrips.filter((t) => t.status === 'confirmed' && t.dateStr.includes('.10.2026'));

  const factorySummary = factories
    .map((f) => {
      const fTrips = octoberTrips.filter((t) => t.factoryId === f.id);
      const tekCount = fTrips.filter((t) => t.type === 'tek').length;
      const ciftCount = fTrips.filter((t) => t.type === 'cift').length;

      return {
        factory: f,
        tekCount,
        ciftCount,
        tripCount: fTrips.length,
      };
    })
    .filter((s) => s.tripCount > 0);

  const totalMonthlyTrips = factorySummary.reduce((acc, curr) => acc + curr.tripCount, 0);

  // Handle vehicle plate change (Requirement G.1)
  const handleSelectPlate = (plate: string) => {
    setCurrentPlate(plate);
    setShowPlateMenu(false);
    if (onSelectVehiclePlate) onSelectVehiclePlate(plate);
  };

  // Handle delay trigger (Requirement G.4: 5/10/15/20 min)
  const handleSetDelay = (minutes: number) => {
    setActiveDelay(minutes);
    setShowDelayModal(false);
    if (onReportDelay) onReportDelay(minutes);
  };

  // Handle emergency submission (Requirement G.5: Arıza & Kaza)
  const handleSendEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyModalType) return;
    const typeLabel = emergencyModalType === 'breakdown' ? 'Arıza Bildirimi' : 'Kaza Bildirimi';
    setActiveEmergencyNotice(
      `${typeLabel} Seçil Turizm merkezine iletildi. Yedek servis aracı ve saha ekibi bilgilendirildi.`
    );
    if (onReportEmergency) {
      onReportEmergency(emergencyModalType, emergencyNotes);
    }
    setEmergencyModalType(null);
    setEmergencyNotes('');
  };

  // Handle manual trip submit (Requirement G.2)
  const handleSaveManualTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddManualTrip) {
      onAddManualTrip(manualFactoryId, manualType, manualTime, manualReason);
    }
    setShowManualModal(false);
  };

  // Handle correction submit (Requirement G.3: Account or Type)
  const handleSendCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    if (correctionMode === 'account') {
      const finalTarget =
        correctionTarget === 'custom' && customPlateInput.trim()
          ? `${customPlateInput.toUpperCase()} (Yedek)`
          : correctionTarget;

      onRequestCorrection(editingTrip.id, finalTarget, correctionReason);
    } else if (correctionMode === 'type' && onRequestTypeCorrection) {
      onRequestTypeCorrection(editingTrip.id, editingTrip.type, targetType, correctionReason);
    }

    setEditingTrip(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 pb-20">
      {/* Top Driver Profile Header (Requirement 1: Full name on single line, clean plate badge) */}
      <div className="bg-slate-900 border-b border-slate-800 p-3.5 shrink-0 space-y-2.5">
        {/* Dual Role Switcher (Requirement B: Same person can be driver & owner, switches from top) */}
        {onSwitchToOwner && (
          <div className="flex items-center justify-between bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 pl-2 font-medium">Aktif Mod:</span>
            <div className="flex items-center gap-1">
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-sm">
                <Truck className="w-3 h-3" />
                Şoför
              </span>
              <button
                onClick={onSwitchToOwner}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Araç Sahibi Moduna Geç"
              >
                <span>Araç Sahibi</span>
                <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
              </button>
            </div>
          </div>
        )}

        {/* Profile Card & Plate Switcher (Requirement G.1) */}
        <div className="flex items-center justify-between gap-2">
          {/* Driver Info: Name is NEVER truncated */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-white tracking-tight leading-none whitespace-nowrap">
                  {driverName}
                </h1>

                {/* Requirement G.1: Bugünkü Araç Seçimi */}
                <div className="relative">
                  <button
                    onClick={() => setShowPlateMenu(!showPlateMenu)}
                    className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Bugünkü aracı değiştir"
                  >
                    <span>{currentPlate}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showPlateMenu && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 text-xs animate-in fade-in">
                      <span className="text-[10px] text-slate-400 px-2 py-1 block font-sans">Bugünkü Aracım:</span>
                      <button
                        onClick={() => handleSelectPlate('26 S 2244')}
                        className={`w-full text-left px-2 py-1.5 rounded-lg font-mono font-bold flex items-center justify-between ${
                          currentPlate === '26 S 2244' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span>26 S 2244</span>
                        <span className="text-[9px] font-sans">Asıl</span>
                      </button>
                      <button
                        onClick={() => handleSelectPlate('26 S 1085')}
                        className={`w-full text-left px-2 py-1.5 rounded-lg font-mono font-bold flex items-center justify-between ${
                          currentPlate === '26 S 1085' ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span>26 S 1085</span>
                        <span className="text-[9px] font-sans">Yedek</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>Seçil Turizm · Aktif Seferde</span>
              </p>
            </div>
          </div>

          {/* Quick Trigger Modal button (Requirement 4: SEFERİ ONAYLA) */}
          <button
            onClick={() => onOpenConfirmation(pendingTrips[0])}
            title="Seferi Onayla"
            className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold rounded-xl text-[11px] flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Seferi Onayla</span>
          </button>
        </div>

        {/* Operational Quick Action Buttons (Requirements G.2, G.4, G.5) */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {/* 1. Elle Sefer Ekle (Requirement G.2) */}
          <button
            onClick={() => setShowManualModal(true)}
            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-[10.5px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3 text-amber-400" />
            <span>Elle Sefer</span>
          </button>

          {/* 2. Gecikeceğim (Requirement G.4: 5/10/15/20 min) */}
          <button
            onClick={() => setShowDelayModal(true)}
            className={`py-1.5 px-2 font-bold rounded-xl text-[10.5px] flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              activeDelay
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{activeDelay ? `${activeDelay} dk Gecikme` : 'Gecikeceğim'}</span>
          </button>

          {/* 3. Aracım Arızalandı (Requirement G.5) */}
          <button
            onClick={() => setEmergencyModalType('breakdown')}
            className="py-1.5 px-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 font-bold rounded-xl text-[10.5px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Arıza Bildir</span>
          </button>

          {/* 4. Kaza Oldu (Requirement G.5) */}
          <button
            onClick={() => setEmergencyModalType('accident')}
            className="py-1.5 px-2 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl text-[10.5px] flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-red-950/50 transition-colors"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Kaza Bildir</span>
          </button>
        </div>

        {/* Active Delay Warning Banner if any */}
        {activeDelay && (
          <div className="p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Yolculara <strong>+{activeDelay} dakika gecikme</strong> duyurusu yapıldı.
              </span>
            </div>
            <button
              onClick={() => setActiveDelay(null)}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              İptal Et
            </button>
          </div>
        )}

        {/* Active Emergency Notice */}
        {activeEmergencyNotice && (
          <div className="p-2.5 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center justify-between animate-in fade-in">
            <span>{activeEmergencyNotice}</span>
            <button
              onClick={() => setActiveEmergencyNotice(null)}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Offline sync banner if unsynced items exist */}
        {unsyncedTrips.length > 0 && (
          <div className="p-2.5 bg-amber-950/40 border border-amber-800/50 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{unsyncedTrips.length} sefer telefonda bekliyor</span>
            </div>
            <button
              onClick={onSyncOfflineTrips}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Eşitle</span>
            </button>
          </div>
        )}

        {/* Navigation Tabs (Including Students Tab per Requirement I) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px]">
          <button
            onClick={() => setActiveTab('today')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'today' ? 'bg-slate-800 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bugün ({todayTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center relative ${
              activeTab === 'pending' ? 'bg-slate-800 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Onay Bekleyen</span>
            {pendingTrips.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                {pendingTrips.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'monthly' ? 'bg-slate-800 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aylık Sefer
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'students' ? 'bg-slate-800 text-rose-400 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Öğrenciler
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {/* PENDING CONFIRMATION PROMPT CARD (Highlight) */}
        {pendingTrips.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border-2 border-amber-500/70 rounded-3xl shadow-xl shadow-amber-950/20 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Nizamiye Girişi Tespit Edildi
                </span>
                <h3 className="text-base font-extrabold text-white mt-1.5">
                  {pendingTrips[0].factoryName} Seferi Onay Bekliyor
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Saat: <strong className="text-white">{pendingTrips[0].timeStr}</strong>
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Requirement 4: "SEFERİ ONAYLA" text */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => onOpenConfirmation(pendingTrips[0])}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <span>SEFERİ ONAYLA (TEK / ÇİFT)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: TODAY'S TRIPS (Requirement 2: NO PRICE, pure clean record) */}
        {activeTab === 'today' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Bugünkü Seferler ({todayTrips.length})</span>
              <span className="font-mono text-slate-300">17 Ekim 2026</span>
            </div>

            {todayTrips.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                Bugün henüz onaylanmış bir sefer bulunmuyor.
              </div>
            ) : (
              todayTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => {
                    setEditingTrip(trip);
                    setCorrectionTarget(trip.onBehalfOf || 'Kendi Hesabıma');
                    setTargetType(trip.type === 'tek' ? 'cift' : 'tek');
                  }}
                  className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3.5 shadow-md flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        trip.type === 'cift'
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {trip.type === 'cift' ? 'ÇİFT' : 'TEK'}
                    </div>
                    <div>
                      {/* Format per Requirement 2: "Arçelik – ÇİFT – 07:48 – Kayıtlı" */}
                      <h4 className="font-bold text-sm text-white">
                        {trip.factoryName} – {trip.type === 'cift' ? 'ÇİFT' : 'TEK'}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {trip.timeStr}
                        </span>
                        <span>·</span>
                        <span className="text-slate-300 font-medium">{trip.onBehalfOf || 'Kendi Hesabıma'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {trip.isManualEntry && trip.manualStatus === 'pending_company_approval' ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold block">
                        Elle Sefer (Onay Bekliyor)
                      </span>
                    ) : trip.correctionStatus === 'pending_company_approval' ? (
                      <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold block">
                        Hesap Onayı Bekliyor
                      </span>
                    ) : trip.typeCorrectionStatus === 'pending_company_approval' ? (
                      <span className="text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold block">
                        Tip Onayı Bekliyor
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Kayıtlı
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5 mt-0.5">
                      <Edit3 className="w-2.5 h-2.5" />
                      Düzeltme İste
                    </span>
                  </div>
                </div>
              ))
            )}

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">💡 Düzeltme Notu</p>
              <p>
                Başkası yerine gittiyseniz veya sefer türü (TEK / ÇİFT) hatalı girildiyse sefere dokunarak firma onaylı
                düzeltme talebi oluşturabilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PENDING TRIPS */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Onay Bekleyen Seferler ({pendingTrips.length})</span>
              <span className="text-[11px] text-amber-400">Hatırlatma devrede</span>
            </div>

            {pendingTrips.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-slate-300">Bekleyen Sefer Yok</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tüm fabrika girişleriniz onaylandı ve sisteme kaydedildi.
                </p>
              </div>
            ) : (
              pendingTrips.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                        Nizamiye Girişi: {p.timeStr}
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-1">{p.factoryName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.notes || 'Fabrika nizamiye kapısında algılandı.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenConfirmation(p)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>SEFERİ ONAYLA (TEK / ÇİFT)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: MONTHLY ACCRUAL & REPORT (ZERO PRICE FOR DRIVER, ONLY TRIP COUNTS) */}
        {activeTab === 'monthly' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/80 rounded-3xl p-4 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Ekim 2026 Sefer Özeti</span>
                <span className="font-mono text-emerald-400 font-bold">Resmi Sefer Dökümü</span>
              </div>
              <div className="mt-2">
                <span className="text-xs text-slate-400">Toplam Yapılan Sefer</span>
                <p className="text-2xl font-black text-white font-mono tracking-tight mt-0.5">
                  {totalMonthlyTrips} Sefer
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 px-1 block">
                Fabrikalara Göre Sefer Dağılımı
              </span>

              {factorySummary.map((item) => (
                <div
                  key={item.factory.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">{item.factory.shortName}</h4>
                    <span className="font-mono font-bold text-sky-400 text-xs">
                      {item.tripCount} Sefer Toplam
                    </span>
                  </div>

                  <div className="bg-slate-950/70 rounded-xl p-2.5 space-y-1.5 text-xs font-mono text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Tek Sefer Sayısı:</span>
                      <span className="font-bold text-emerald-400">{item.tekCount} Tek</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Çift Sefer Sayısı:</span>
                      <span className="font-bold text-sky-400">{item.ciftCount} Çift</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STUDENTS LIST (Requirement I: Şoför ekranında günün öğrenci listesi) */}
        {activeTab === 'students' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Günün Öğrenci Servisi Listesi</span>
              <span>17 Ekim 2026</span>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-rose-400" />
                <span>Veli İptal Bildirimleri Canlı Eşzamanlıdır</span>
              </p>
              <p className="text-[11px] text-slate-300">
                Velinin 'Bugün binmeyecek' olarak işaretlediği öğrenciler sarı renkle belirtilir; kapısına uğramayınız.
              </p>
            </div>

            <div className="space-y-2.5">
              {childrenList.map((ch) => (
                <div
                  key={ch.id}
                  className={`bg-slate-900 border rounded-2xl p-3.5 space-y-2 shadow-sm ${
                    !ch.isBoardingToday ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{ch.childName}</h4>
                        {!ch.isBoardingToday ? (
                          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                            ⚠️ Bugün Binmeyecek
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                            ✅ Biniyor
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ch.schoolName}</p>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Biniş Saati: <strong>{ch.morningPickupTime}</strong> · İniş: {ch.afternoonDropoffTime}
                      </p>
                    </div>

                    <a
                      href={`tel:${ch.driverPhone}`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl cursor-pointer"
                      title="Veliyi Ara"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Trip Entry Modal (Requirement G.2) */}
      {showManualModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveManualTrip}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Elle Sefer Ekle</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Fabrika Seçin</label>
              <select
                value={manualFactoryId}
                onChange={(e) => setManualFactoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sefer Türü</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as 'tek' | 'cift')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="tek">TEK SEFER</option>
                  <option value="cift">ÇİFT SEFER</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nizamiye Saati</label>
                <input
                  type="time"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Elle Ekleme Gerekçesi</label>
              <textarea
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                rows={2}
                required
                placeholder="Örn: Fabrika nizamiye kapısında internet çekmedi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10.5px] text-amber-300">
              * Bu sefer doğrudan hak edişe eklenmez; önce <strong>Seçil Turizm</strong> firma onayına düşer.
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Firma Onayına Gönder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delay Modal (Requirement G.4: 5/10/15/20 min) */}
      {showDelayModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">Gecikme Bildir</h3>
              <p className="text-xs text-slate-400 mt-1">
                Trafik veya yol durumu nedeniyle kaç dakika gecikeceksiniz?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetDelay(mins)}
                  className="py-3 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 rounded-2xl font-black text-sm text-white transition-all cursor-pointer shadow-md"
                >
                  +{mins} Dakika
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowDelayModal(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Emergency Modal: Breakdown & Accident (Requirement G.5) */}
      {emergencyModalType && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleSendEmergency}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              {emergencyModalType === 'breakdown' ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-base text-white">Araç Arıza Bildirimi</h3>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <h3 className="font-extrabold text-base text-white">Trafik Kazası Bildirimi</h3>
                </>
              )}
            </div>

            <p className="text-xs text-slate-300">
              {emergencyModalType === 'breakdown'
                ? 'Aracınız arızalandığında merkez bilgilendirilir ve hatta en yakın yedek servis yönlendirilir.'
                : 'Kaza durumunda Seçil Turizm idari işler merkezi, sigorta ve yolcu bilgilendirmesi anında tetiklenir.'}
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Durum / Konum Açıklaması</label>
              <textarea
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                rows={2}
                placeholder="Örn: Organize kavşağı lastik patlaması / hafif hasarlı sürtme"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEmergencyModalType(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 font-bold rounded-xl text-xs cursor-pointer text-white shadow-lg ${
                  emergencyModalType === 'accident' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                Acil Bildirimi Gönder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trip Correction Modal (Requirement G.3: Account or TEK/ÇİFT) */}
      {editingTrip && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <form
            onSubmit={handleSendCorrection}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Sefer Düzeltme Talebi</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTrip(null)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selector: Kimin Hesabına vs TEK/ÇİFT Değiştir */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCorrectionMode('account')}
                className={`py-1.5 font-bold rounded-lg cursor-pointer ${
                  correctionMode === 'account' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Hesap (Kimin Adına)
              </button>
              <button
                type="button"
                onClick={() => setCorrectionMode('type')}
                className={`py-1.5 font-bold rounded-lg cursor-pointer ${
                  correctionMode === 'type' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                TEK / ÇİFT Türü
              </button>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
              <p className="text-white font-semibold">
                {editingTrip.factoryName} – {editingTrip.type === 'cift' ? 'ÇİFT' : 'TEK'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Saat: {editingTrip.timeStr} · Mevcut Hesap:{' '}
                <strong className="text-amber-400">{editingTrip.onBehalfOf || 'Kendi Hesabıma'}</strong>
              </p>
            </div>

            {correctionMode === 'account' ? (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Yeni Hesap Sahibi</label>
                <select
                  value={correctionTarget}
                  onChange={(e) => setCorrectionTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Kendi Hesabıma">Kendi Hesabıma ({currentPlate})</option>
                  <option value="26 S 1085 (Ali Yıldız Yerine)">26 S 1085 (Ali Yıldız)</option>
                  <option value="26 S 0412 (Hasan Çelik Yerine)">26 S 0412 (Hasan Çelik)</option>
                  <option value="custom">Farklı Bir Plaka Gir...</option>
                </select>

                {correctionTarget === 'custom' && (
                  <input
                    type="text"
                    value={customPlateInput}
                    onChange={(e) => setCustomPlateInput(e.target.value.toUpperCase())}
                    placeholder="Örn: 26 S 9999"
                    className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase"
                  />
                )}
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Yeni Sefer Türü</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as 'tek' | 'cift')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="tek">TEK SEFER</option>
                  <option value="cift">ÇİFT SEFER</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Düzeltme Gerekçesi</label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                rows={2}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <p className="text-[10px] text-slate-500">
              * Bu talep Seçil Turizm firma yetkilisinin onayına gönderilir.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingTrip(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Talebi Gönder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
