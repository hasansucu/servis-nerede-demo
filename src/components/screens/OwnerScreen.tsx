import React, { useState } from 'react';
import { BreakdownIncident, Factory, Holiday, PriceHistoryEntry, StudentLedgerItem, Trip, Vehicle } from '../../types';
import { formatTL } from '../../utils/formatters';
import {
  DollarSign,
  BookOpen,
  Truck,
  CheckCircle,
  AlertTriangle,
  History,
  Phone,
  Plus,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  UserCheck,
  ShieldAlert,
  Gauge,
  Calendar,
  Clock,
  ArrowRightLeft,
  Trash2,
  X
} from 'lucide-react';

interface OwnerScreenProps {
  vehicles: Vehicle[];
  trips: Trip[];
  factories: Factory[];
  priceHistory: PriceHistoryEntry[];
  students: StudentLedgerItem[];
  holidays?: Holiday[];
  isTodayHoliday?: boolean;
  onToggleTodayHoliday?: () => void;
  onAddHoliday?: (newH: Omit<Holiday, 'id'>) => void;
  onDeleteHoliday?: (id: string) => void;
  breakdownIncident?: BreakdownIncident | null;
  onAssignBackupVehicle?: (originalPlate: string, backupPlate: string, backupDriverName: string) => void;
  onUpdatePrice: (
    factoryId: string,
    singlePrice: number,
    doublePrice: number,
    note: string,
    effectiveFrom?: string
  ) => void;
  onUpdateStudentPayment: (studentId: string, status: 'paid' | 'unpaid' | 'partial', amount: number) => void;
  onAddStudent: (newStudent: Omit<StudentLedgerItem, 'id'>) => void;
  onAssignDriver?: (plate: string, driverName: string, backupDriverName: string) => void;
  onSwitchToDriver?: () => void;
}

export const OwnerScreen: React.FC<OwnerScreenProps> = ({
  vehicles,
  trips,
  factories,
  priceHistory,
  students,
  holidays = [],
  isTodayHoliday = false,
  onToggleTodayHoliday,
  onAddHoliday,
  onDeleteHoliday,
  breakdownIncident,
  onAssignBackupVehicle,
  onUpdatePrice,
  onUpdateStudentPayment,
  onAddStudent,
  onAssignDriver,
  onSwitchToDriver,
}) => {
  // 6 Tabs: trips (Hak Ediş), fleet (Şoför & KM), pricing (Fiyat Gir), documents (Evrak Takibi), ledger (Kendi Defterim), holidays (Tatil Günleri)
  const [activeTab, setActiveTab] = useState<'trips' | 'fleet' | 'pricing' | 'documents' | 'ledger' | 'holidays'>('trips');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [breakdownView, setBreakdownView] = useState<'factory' | 'vehicle' | 'driver'>('factory');

  // Requirement 3: Backup vehicle assignment modal state
  const [showAssignBackupModal, setShowAssignBackupModal] = useState<boolean>(false);
  const [selectedBackupPlate, setSelectedBackupPlate] = useState<string>('26 S 1085');

  // Requirement 4: Tatil Günleri state
  const [showAddHolidayModal, setShowAddHolidayModal] = useState<boolean>(false);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('29.10.2026');
  const [newHolidayDesc, setNewHolidayDesc] = useState('');
  const [newHolidayAppliesTo, setNewHolidayAppliesTo] = useState<'all' | 'factory' | 'school'>('all');

  // Requirement 9: Strict owner vehicles filtering (Ahmet Karaca has 2 vehicles: 26 S 2244 & 26 S 1085)
  const ownerVehicles = vehicles.filter(
    (v) => v.ownerId === 'owner-1' || v.plate === '26 S 2244' || v.plate === '26 S 1085'
  );
  const ownerPlates = ownerVehicles.map((v) => v.plate);

  // Driver Assignment Modal State (Requirement E.1)
  const [editingAssignmentPlate, setEditingAssignmentPlate] = useState<string | null>(null);
  const [assignedDriverInput, setAssignedDriverInput] = useState<string>('Mehmet Demir');
  const [backupDriverInput, setBackupDriverInput] = useState<string>('Ali Yıldız (Yedek)');

  // Pricing Form State (Requirement E.4: effectiveFrom date)
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>(factories[0]?.id || 'f1');
  const activeFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const [inputSinglePrice, setInputSinglePrice] = useState<string>(String(activeFactory.currentSinglePrice));
  const [inputDoublePrice, setInputDoublePrice] = useState<string>(String(activeFactory.currentDoublePrice));
  const [priceEffectiveDate, setPriceEffectiveDate] = useState<string>('17.10.2026');
  const [priceNote, setPriceNote] = useState<string>('');
  const [priceSuccessMsg, setPriceSuccessMsg] = useState<string | null>(null);

  // Student Ledger Filter
  const [studentFilter, setStudentFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newFee, setNewFee] = useState('3200');

  // Calculate owner trips (for owner's vehicles only)
  const ownerTrips = trips.filter((t) => {
    if (t.status !== 'confirmed') return false;
    if (!ownerPlates.includes(t.plate)) return false;
    if (selectedVehicle !== 'all' && t.plate !== selectedVehicle) return false;
    return true;
  });

  // Requirement 10: Factory by factory breakdown for vehicle owner
  const factoryBreakdown = factories
    .map((f) => {
      const fTrips = ownerTrips.filter((t) => t.factoryId === f.id);
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
    })
    .filter((item) => item.tripCount > 0);

  const grandTekTotal = factoryBreakdown.reduce((acc, curr) => acc + curr.tekTotal, 0);
  const grandCiftTotal = factoryBreakdown.reduce((acc, curr) => acc + curr.ciftTotal, 0);
  const grandTotal = grandTekTotal + grandCiftTotal;

  // Requirement E.2: Vehicle-by-Vehicle Breakdown
  const vehicleBreakdown = ownerVehicles.map((v) => {
    const vTrips = trips.filter((t) => t.plate === v.plate && t.status === 'confirmed');
    const tekTrips = vTrips.filter((t) => t.type === 'tek');
    const ciftTrips = vTrips.filter((t) => t.type === 'cift');
    const total = vTrips.reduce((acc, curr) => acc + curr.priceApplied, 0);
    return {
      vehicle: v,
      tripCount: vTrips.length,
      tekCount: tekTrips.length,
      ciftCount: ciftTrips.length,
      total,
    };
  });

  // Requirement E.2: Driver-by-Driver Breakdown
  const uniqueDrivers = Array.from(new Set(ownerVehicles.map((v) => v.driverName)));
  const driverBreakdown = uniqueDrivers.map((dName) => {
    const dTrips = trips.filter(
      (t) => t.driverName === dName && ownerPlates.includes(t.plate) && t.status === 'confirmed'
    );
    const total = dTrips.reduce((acc, curr) => acc + curr.priceApplied, 0);
    const assignedVehicle = ownerVehicles.find((v) => v.driverName === dName);
    return {
      driverName: dName,
      plate: assignedVehicle?.plate || '',
      tripCount: dTrips.length,
      total,
    };
  });

  // Student stats
  const totalStudentExpected = students.reduce((acc, curr) => acc + curr.monthlyFee, 0);
  const totalStudentCollected = students.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalStudentRemaining = totalStudentExpected - totalStudentCollected;

  const filteredStudents = students.filter((s) => {
    if (studentFilter === 'paid') return s.status === 'paid';
    if (studentFilter === 'unpaid') return s.status === 'unpaid' || s.status === 'partial';
    return true;
  });

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const single = parseFloat(inputSinglePrice);
    const double = parseFloat(inputDoublePrice);
    if (!isNaN(single) && !isNaN(double) && single > 0 && double > 0) {
      onUpdatePrice(
        selectedFactoryId,
        single,
        double,
        priceNote || 'Araç sahibi tarafından tarife güncellemesi yapıldı.',
        priceEffectiveDate
      );
      setPriceSuccessMsg(
        `Fiyat güncellendi! ${priceEffectiveDate} tarihinden itibaren geçerli (Tek: ${single} TL, Çift: ${double} TL).`
      );
      setTimeout(() => setPriceSuccessMsg(null), 4000);
    }
  };

  const handleSaveDriverAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignmentPlate) return;
    if (onAssignDriver) {
      onAssignDriver(editingAssignmentPlate, assignedDriverInput, backupDriverInput);
    }
    setEditingAssignmentPlate(null);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    onAddStudent({
      studentName: newStudentName,
      school: newSchool || 'Eskişehir Anadolu Lisesi',
      parentName: newParentName || 'Veli',
      parentPhone: newParentPhone || '0555 000 00 00',
      monthlyFee: Number(newFee) || 3200,
      status: 'unpaid',
      paidAmount: 0,
      notes: 'Yeni kayıt',
    });
    setShowAddStudentModal(false);
    setNewStudentName('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 pb-20">
      {/* Header (Requirement 9: Consistent 2 plates) */}
      <div className="bg-slate-900 border-b border-slate-800 p-3.5 shrink-0">
        {/* Dual Role Switcher (Requirement B: Same person can be driver & owner, switches from top) */}
        {onSwitchToDriver && (
          <div className="mb-2.5 flex items-center justify-between bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 pl-2 font-medium">Aktif Mod:</span>
            <div className="flex items-center gap-1">
              <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-sm">
                <DollarSign className="w-3 h-3" />
                Araç Sahibi
              </span>
              <button
                onClick={onSwitchToDriver}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                title="Şoför Moduna Geç"
              >
                <span>Şoför</span>
                <Truck className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white">Araç Sahibi Paneli</h1>
              <p className="text-[11px] text-slate-400">Ahmet Karaca · {ownerVehicles.length} Plaka Kayıtlı</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Ekim Toplam Hak Ediş</span>
            <span className="font-mono font-black text-emerald-400 text-sm">{formatTL(grandTotal)}</span>
          </div>
        </div>

        {/* Requirement 3: Breakdown Alert & Backup Vehicle Assignment for Patron */}
        {breakdownIncident?.status === 'reported' && (
          <div className="mt-2.5 p-3 bg-rose-950/90 border border-rose-500/70 rounded-2xl flex items-center justify-between gap-2.5 shadow-xl animate-in slide-in-from-top">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">
                  🚨 {breakdownIncident.originalPlate} Arıza Bildirdi ({breakdownIncident.driverName})!
                </h4>
                <p className="text-[10.5px] text-rose-300">
                  Yolcular durakta bekliyor. Seferin aksamaması için yedek araç atayınız.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAssignBackupModal(true)}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs shrink-0 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95 transition-all"
            >
              Yedek Araç Ata
            </button>
          </div>
        )}

        {/* Navigation Tabs (6 Tabs covering E, F and Requirement 4: Tatil Günleri) */}
        <div className="grid grid-cols-6 gap-1 mt-3 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-[10px]">
          <button
            onClick={() => setActiveTab('trips')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'trips' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Hak Ediş
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'fleet' ? 'bg-slate-800 text-sky-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Araç/KM
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'pricing' ? 'bg-slate-800 text-amber-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Fiyat Gir
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'documents' ? 'bg-slate-800 text-rose-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Evraklar
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'ledger' ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm' : 'text-slate-400'
            }`}
          >
            Defterim
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
        {/* TAB 1: VEHICLE TRIPS & REPORT (Requirement E.2: Araç Araç & Şoför Şoför Hak Ediş) */}
        {activeTab === 'trips' && (
          <div className="space-y-3.5">
            {/* View Mode Toggle: Fabrika / Araç Araç / Şoför Şoför */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setBreakdownView('factory')}
                className={`py-1.5 font-bold rounded-xl transition-colors cursor-pointer text-center ${
                  breakdownView === 'factory' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                Fabrika Bazında
              </button>
              <button
                onClick={() => setBreakdownView('vehicle')}
                className={`py-1.5 font-bold rounded-xl transition-colors cursor-pointer text-center ${
                  breakdownView === 'vehicle' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                Araç Araç
              </button>
              <button
                onClick={() => setBreakdownView('driver')}
                className={`py-1.5 font-bold rounded-xl transition-colors cursor-pointer text-center ${
                  breakdownView === 'driver' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400'
                }`}
              >
                Şoför Şoför
              </button>
            </div>

            {/* Accrual Card with Detailed Factory Breakdown */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>EKİM 2026 SEFER HAK EDİŞİ</span>
                <span className="font-mono text-emerald-400 font-bold">{ownerTrips.length} Sefer Toplam</span>
              </div>

              {/* Big Grand Total */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  TOPLAM HAK EDİŞ KAZANCI
                </span>
                <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
                  {formatTL(grandTotal)}
                </p>
              </div>

              {/* View 1: Factory-by-Factory Breakdown */}
              {breakdownView === 'factory' && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Fabrika Bazında Sefer ve Kazanç Dökümü:
                  </span>

                  {factoryBreakdown.map((item) => (
                    <div
                      key={item.factory.id}
                      className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between font-sans">
                        <h4 className="font-bold text-white text-sm">{item.factory.shortName}</h4>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {formatTL(item.total)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>
                          {item.factory.shortName} – {item.tekCount} tek × {formatTL(item.factory.currentSinglePrice)}
                        </span>
                        <span className="text-white font-semibold">{formatTL(item.tekTotal)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>
                          {item.factory.shortName} – {item.ciftCount} çift × {formatTL(item.factory.currentDoublePrice)}
                        </span>
                        <span className="text-sky-400 font-semibold">{formatTL(item.ciftTotal)}</span>
                      </div>

                      <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-sans text-slate-400">
                        <span>Fabrika Ara Toplamı:</span>
                        <span className="font-bold font-mono text-emerald-400">{formatTL(item.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 2: Araç Araç Hak Ediş (Requirement E.2) */}
              {breakdownView === 'vehicle' && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Araç Bazında Hak Ediş Bordrosu:
                  </span>

                  {vehicleBreakdown.map((vb) => (
                    <div
                      key={vb.vehicle.plate}
                      className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between font-sans">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-800 text-white font-mono font-bold px-2 py-0.5 rounded-md border border-slate-700">
                            {vb.vehicle.plate}
                          </span>
                          <span className="text-xs text-slate-300">{vb.vehicle.driverName}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {formatTL(vb.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Toplam: {vb.tripCount} Sefer</span>
                        <span>{vb.tekCount} Tek / {vb.ciftCount} Çift</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* View 3: Şoför Şoför Hak Ediş (Requirement E.2) */}
              {breakdownView === 'driver' && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Şoför Bazında Hak Ediş Bordrosu:
                  </span>

                  {driverBreakdown.map((db) => (
                    <div
                      key={db.driverName}
                      className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between font-sans">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-xs">{db.driverName}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{db.plate}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 text-sm block">
                            {formatTL(db.total)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">{db.tripCount} Sefer</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Totals Summary Strip */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-sans text-slate-400">Teklerin Toplamı:</span>
                  <span className="font-bold text-white">{formatTL(grandTekTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-sans text-slate-400">Çiftlerin Toplamı:</span>
                  <span className="font-bold text-sky-400">{formatTL(grandCiftTotal)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold font-sans">
                  <span className="text-white">GENEL TOPLAM:</span>
                  <span className="font-mono text-emerald-400 font-black">{formatTL(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARAÇLAR & ŞOFÖR/YEDEK ATAMA & KM TAKİBİ (Requirement E.1 & E.3) */}
        {activeTab === 'fleet' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Araçlarım, Şoförler & Kilometre Takibi</span>
              <span>{ownerVehicles.length} Araç</span>
            </div>

            {ownerVehicles.map((v) => (
              <div
                key={v.plate}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-md"
              >
                {/* Vehicle Header & Driver Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        {v.plate}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">{v.driverName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{v.model}</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingAssignmentPlate(v.plate);
                      setAssignedDriverInput(v.driverName);
                      setBackupDriverInput(v.backupDriverName || 'Ali Yıldız (Yedek)');
                    }}
                    className="px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Şoför / Yedek Ata
                  </button>
                </div>

                {/* Driver & Backup Driver Status (Requirement E.1) */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Asıl Şoför</span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {v.driverName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{v.driverPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Yedek Şoför</span>
                    <span className="font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                      {v.backupDriverName || 'Ali Yıldız (Yedek)'}
                    </span>
                    <span className="text-[10px] text-slate-500">İhtiyaç anında devralır</span>
                  </div>
                </div>

                {/* Requirement E.3: Günlük / Haftalık / Aylık KM & Boşluk Olan Günler "Tahmini" */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-sky-400" />
                      Kilometre Takip Kayıtları
                    </span>
                    {v.isKmEstimated ? (
                      <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                        ⚠️ Tahmini KM (Telefon Kapalı Günler)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        ✅ Gerçek GPS KM
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-sans">Günlük KM</span>
                      <span className="text-sm font-bold text-white">{v.dailyKm} km</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-sans">Haftalık KM</span>
                      <span className="text-sm font-bold text-white">{v.weeklyKm} km</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-sans">Aylık KM</span>
                      <span className="text-sm font-bold text-sky-400">{v.monthlyKm} km</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PRICING ENGINE WITH EFFECTIVE START DATE (Requirement E.4) */}
        {activeTab === 'pricing' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-300 space-y-1">
              <p className="font-bold">Fiyatlandırma & Geçerlilik Kuralı:</p>
              <p className="text-slate-300">
                Fiyatı hem firma sahibi hem araç sahibi girebilir; en son girilen geçerlidir. Ay ortasında değiştiğinde
                belirlenen <strong>Geçerlilik Başlangıç Tarihi</strong> esas alınır; eski seferler eski fiyattan, bu tarihten
                sonrakiler yeni fiyattan hesaplanır.
              </p>
            </div>

            {priceSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{priceSuccessMsg}</span>
              </div>
            )}

            <form
              onSubmit={handlePriceSubmit}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3"
            >
              <h3 className="font-bold text-sm text-white">Tarife Güncelle</h3>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Fabrika Seçin</label>
                <select
                  value={selectedFactoryId}
                  onChange={(e) => {
                    const fid = e.target.value;
                    setSelectedFactoryId(fid);
                    const f = factories.find((item) => item.id === fid);
                    if (f) {
                      setInputSinglePrice(String(f.currentSinglePrice));
                      setInputDoublePrice(String(f.currentDoublePrice));
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-400 font-medium"
                >
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.shortName} ({f.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">TEK Sefer Fiyatı (TL)</label>
                  <input
                    type="number"
                    value={inputSinglePrice}
                    onChange={(e) => setInputSinglePrice(e.target.value)}
                    required
                    min={1}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ÇİFT Sefer Fiyatı (TL)</label>
                  <input
                    type="number"
                    value={inputDoublePrice}
                    onChange={(e) => setInputDoublePrice(e.target.value)}
                    required
                    min={1}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-sky-400 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Requirement E.4: Geçerlilik Başlangıç Tarihi */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Geçerlilik Başlangıç Tarihi <span className="text-amber-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={priceEffectiveDate}
                    onChange={(e) => setPriceEffectiveDate(e.target.value)}
                    placeholder="17.10.2026"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-amber-400"
                  />
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">ve sonrası seferler</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Güncelleme Notu / Gerekçe</label>
                <input
                  type="text"
                  value={priceNote}
                  onChange={(e) => setPriceNote(e.target.value)}
                  placeholder="Örn: Akaryakıt zammı sebebiyle güncellendi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Yeni Tarifeyi Kaydet</span>
              </button>
            </form>

            {/* Audit Log / Price History */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-400 px-1 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Fiyat Değişiklik Geçmişi (Denetim Kayıtları)
              </span>

              {priceHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1.5 shadow-sm text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.factoryName}</span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">
                      Geçerlilik: {item.effectiveFrom}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-400 font-bold">Tek: {formatTL(item.singlePrice)}</span>
                    <span className="text-sky-400 font-bold">Çift: {formatTL(item.doublePrice)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                    <span>Yapan: {item.changedBy} ({item.role})</span>
                  </div>
                  {item.note && <p className="text-[10px] text-slate-400 italic">"{item.note}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EVRAK TAKİBİ (Requirement F: Muayene, Sigorta, Kasko, Ruhsat - 30 & 15 gün uyarı, Kırmızı/Sarı/Yeşil) */}
        {activeTab === 'documents' && (
          <div className="space-y-3.5">
            {/* Warning Banner */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1 text-xs">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Evrak Bitiş Uyarıları (30 ve 15 Gün Kala)</span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Kırmızı: <strong>Süresi geçmiş / acil</strong> · Sarı: <strong>15 - 30 gün içinde dolacak</strong> · Yeşil: <strong>Geçerli</strong>.
              </p>
            </div>

            {/* Vehicle Documents */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-400 px-1">
                Araçlarımın Resmi Evrak Takibi ({ownerVehicles.length} Araç)
              </span>

              {ownerVehicles.map((v) => (
                <div key={v.plate} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                      {v.plate}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">Şoför: {v.driverName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    {/* Muayene */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-slate-500 text-[10px] font-sans block">TÜVTÜRK Muayene</span>
                      <span className="text-xs font-bold block text-emerald-400">
                        {v.documents.inspectionExpiry}
                      </span>
                      <span className="text-[9.5px] text-emerald-400 font-sans block">● Yeşil: Muayene Geçerli</span>
                    </div>

                    {/* Zorunlu Sigorta */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-0.5">
                      <span className="text-slate-500 text-[10px] font-sans block">Zorunlu Trafik Sigortası</span>
                      <span className="text-xs font-bold block text-amber-400">
                        {v.documents.trafficInsuranceExpiry}
                      </span>
                      <span className="text-[9.5px] text-amber-400 font-sans block font-bold">
                        ⚠️ Sarı: 15 Gün Kaldı!
                      </span>
                    </div>

                    {/* Kasko */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-slate-500 text-[10px] font-sans block">Kasko Poliçesi</span>
                      <span className="text-xs font-bold block text-emerald-400">
                        {v.documents.comprehensiveInsuranceExpiry}
                      </span>
                      <span className="text-[9.5px] text-emerald-400 font-sans block">● Yeşil: Geçerli</span>
                    </div>

                    {/* Ruhsat / Belediye İzni */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-rose-500/30 space-y-0.5">
                      <span className="text-slate-500 text-[10px] font-sans block">Belediye İzin / Ruhsat</span>
                      <span className="text-xs font-bold block text-rose-400">
                        {v.documents.licenseRegistrationExpiry}
                      </span>
                      <span className="text-[9.5px] text-rose-400 font-sans block font-bold">
                        🚨 Kırmızı: Süresi Dolmuş!
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: STUDENT SERVICE LEDGER (Kendi Defterim) */}
        {activeTab === 'ledger' && (
          <div className="space-y-3.5">
            {/* Header with KPI cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Öğrenci Servisi Defteri</h3>
                  <p className="text-[11px] text-slate-400">Kendi aracınızla taşıdığınız öğrenciler ve tahsilat</p>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Öğrenci Ekle</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Beklenen</span>
                  <span className="text-xs font-bold text-white">{formatTL(totalStudentExpected)}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Tahsil Edilen</span>
                  <span className="text-xs font-bold text-emerald-400">{formatTL(totalStudentCollected)}</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Kalan Alacak</span>
                  <span className="text-xs font-bold text-rose-400">{formatTL(totalStudentRemaining)}</span>
                </div>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setStudentFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-medium cursor-pointer ${
                  studentFilter === 'all'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Tümü ({students.length})
              </button>
              <button
                onClick={() => setStudentFilter('unpaid')}
                className={`px-3 py-1 rounded-xl text-xs font-medium cursor-pointer ${
                  studentFilter === 'unpaid'
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Ödemeyenler ({students.filter((s) => s.status === 'unpaid' || s.status === 'partial').length})
              </button>
              <button
                onClick={() => setStudentFilter('paid')}
                className={`px-3 py-1 rounded-xl text-xs font-medium cursor-pointer ${
                  studentFilter === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Ödeyenler ({students.filter((s) => s.status === 'paid').length})
              </button>
            </div>

            {/* Students list */}
            <div className="space-y-2.5">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{st.studentName}</h4>
                      <p className="text-[11px] text-slate-400">{st.school}</p>
                      <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                        <span>Veli: {st.parentName}</span>
                        <a
                          href={`tel:${st.parentPhone}`}
                          className="text-amber-400 hover:underline flex items-center gap-0.5 ml-1 font-mono text-[10px]"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          {st.parentPhone}
                        </a>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-white block">
                        {formatTL(st.monthlyFee)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          st.status === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : st.status === 'partial'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {st.status === 'paid'
                          ? 'Ödendi'
                          : st.status === 'partial'
                          ? 'Kısmi Ödendi'
                          : 'Ödenmedi'}
                      </span>
                    </div>
                  </div>

                  {st.notes && (
                    <p className="text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                      Not: {st.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {st.status !== 'paid' ? (
                      <button
                        onClick={() => onUpdateStudentPayment(st.id, 'paid', st.monthlyFee)}
                        className="flex-1 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Tam Ödendi Olarak İşaretle</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateStudentPayment(st.id, 'unpaid', 0)}
                        className="py-1 px-3 text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
                      >
                        Ödemeyi İptal Et
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add student modal */}
            {showAddStudentModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateStudent}
                  className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3"
                >
                  <h3 className="font-bold text-sm text-white">Yeni Öğrenci Ekle</h3>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Öğrenci Adı Soyadı</label>
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Örn: Yağız Demir"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Okul</label>
                    <input
                      type="text"
                      value={newSchool}
                      onChange={(e) => setNewSchool(e.target.value)}
                      placeholder="Örn: Eskişehir Fatih Lisesi"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Veli Adı</label>
                      <input
                        type="text"
                        value={newParentName}
                        onChange={(e) => setNewParentName(e.target.value)}
                        placeholder="Örn: Ayşe Demir"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Veli Telefonu</label>
                      <input
                        type="tel"
                        value={newParentPhone}
                        onChange={(e) => setNewParentPhone(e.target.value)}
                        placeholder="0532..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Aylık Ücret (TL)</label>
                    <input
                      type="number"
                      value={newFee}
                      onChange={(e) => setNewFee(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStudentModal(false)}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        {/* TAB 6: TATİL GÜNLERİ (Requirement 4) */}
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

      {/* Driver & Backup Driver Assignment Modal (Requirement E.1) */}
      {editingAssignmentPlate && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDriverAssignment}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl"
          >
            <div className="border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">Şoför Atama</span>
              <h3 className="font-extrabold text-base text-white">{editingAssignmentPlate} Plakalı Araç</h3>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Asıl Şoför</label>
              <input
                type="text"
                value={assignedDriverInput}
                onChange={(e) => setAssignedDriverInput(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Yedek Şoför</label>
              <input
                type="text"
                value={backupDriverInput}
                onChange={(e) => setBackupDriverInput(e.target.value)}
                placeholder="Örn: Ali Yıldız (Yedek)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAssignmentPlate(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Atamayı Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requirement 3: Yedek Araç Ata Modal for Patron */}
      {showAssignBackupModal && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Yedek Araç Görevlendir</h3>
              </div>
              <button
                onClick={() => setShowAssignBackupModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Arızalanan Araç: <strong className="text-rose-400">{breakdownIncident?.originalPlate || '26 S 2244'}</strong> ({breakdownIncident?.driverName || 'Mehmet Demir'})
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Görevlendirilecek Yedek Araç</label>
              <select
                value={selectedBackupPlate}
                onChange={(e) => setSelectedBackupPlate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              >
                <option value="26 S 1085">26 S 1085 - Ali Yıldız (Garajda Hazır / Müsait)</option>
                <option value="26 S 0412">26 S 0412 - Hasan Çelik (Yedek)</option>
              </select>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-white">🔔 Otomatik Yolcu & Veli Bildirimi:</p>
              <p>
                Yedek aracı atadığınızda bu servisteki tüm yolculara ve velilere anında <strong>"Servisiniz değişti: {selectedBackupPlate}"</strong> bildirimi iletilir ve haritada yeni araç takip edilir.
              </p>
            </div>

            <button
              onClick={() => {
                const driver = selectedBackupPlate === '26 S 1085' ? 'Ali Yıldız' : 'Hasan Çelik';
                if (onAssignBackupVehicle) {
                  onAssignBackupVehicle(breakdownIncident?.originalPlate || '26 S 2244', selectedBackupPlate, driver);
                }
                setShowAssignBackupModal(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              Yedek Aracı Görevlendir & Yolculara Bildir
            </button>
          </div>
        </div>
      )}

      {/* Requirement 4: Add Custom Holiday Modal */}
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
                  description: newHolidayDesc.trim() || 'Firma / Patron tarafından tanımlandı.',
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
