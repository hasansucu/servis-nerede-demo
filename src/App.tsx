import React, { useState, useEffect } from 'react';
import {
  Announcement,
  BreakdownIncident,
  Company,
  CompanySettings,
  DriverProfile,
  Factory,
  Holiday,
  ParentChild,
  PriceHistoryEntry,
  StudentLedgerItem,
  Trip,
  TripCorrection,
  TypeCorrection,
  UserRole,
  Vehicle
} from './types';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CHILDREN,
  INITIAL_COMPANIES,
  INITIAL_CORRECTIONS,
  INITIAL_DRIVERS,
  INITIAL_FACTORIES,
  INITIAL_HOLIDAYS,
  INITIAL_PRICE_HISTORY,
  INITIAL_STUDENTS,
  INITIAL_TRIPS,
  INITIAL_TYPE_CORRECTIONS,
  INITIAL_VEHICLES
} from './data/mockData';
import { PhoneFrame } from './components/PhoneFrame';
import { KVKKModal } from './components/KVKKModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/screens/LoginScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { DriverScreen } from './components/screens/DriverScreen';
import { OwnerScreen } from './components/screens/OwnerScreen';
import { CompanyScreen } from './components/screens/CompanyScreen';
import { FactoryScreen } from './components/screens/FactoryScreen';
import { WorkerScreen } from './components/screens/WorkerScreen';
import { ParentScreen } from './components/screens/ParentScreen';
import { playAlertChime, playSuccessBeep } from './utils/audio';
import {
  Truck,
  DollarSign,
  Building2,
  Compass,
  CheckCircle,
  ShieldCheck,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [factories, setFactories] = useState<Factory[]>(INITIAL_FACTORIES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<DriverProfile[]>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>(INITIAL_PRICE_HISTORY);
  const [students, setStudents] = useState<StudentLedgerItem[]>(INITIAL_STUDENTS);
  const [corrections, setCorrections] = useState<TripCorrection[]>(INITIAL_CORRECTIONS);
  const [typeCorrections, setTypeCorrections] = useState<TypeCorrection[]>(INITIAL_TYPE_CORRECTIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [childrenList, setChildrenList] = useState<ParentChild[]>(INITIAL_CHILDREN);

  // Requirement 4: Tatil Günleri State (29 Ekim, bayramlar hazır)
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);
  const [isTodayHoliday, setIsTodayHoliday] = useState<boolean>(false);

  // Requirement 3: Arıza & Yedek Araç Atama State
  const [breakdownIncident, setBreakdownIncident] = useState<BreakdownIncident | null>(null);

  // Requirement 1: Gerçek Giriş Ekranı State (Uygulama açılınca ayrı giriş ekranı gelsin)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Month lock state (Ay Kapanışı)
  const [isMonthLocked, setIsMonthLocked] = useState<boolean>(false);

  // Company Settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    allowPassengerCallDriver: false,
  });

  // Active View & Role (7 Roles)
  const [activeRole, setActiveRole] = useState<UserRole>('driver');

  // Interactive Modals & Conditions
  const [isKVKKOpen, setIsKVKKOpen] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [confirmationTrip, setConfirmationTrip] = useState<Trip | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Offline / Online simulation
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Maneuver Debounce: Timestamp of last confirmation per factory
  const [lastConfirmedAt, setLastConfirmedAt] = useState<Record<string, number>>({});

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Requirement 4: Uygulama açılırken konum izni istemesin; demo örnek verilerle çalışır
  useEffect(() => {
    // Açılışta konum/KVKK modalı istemesin, doğrudan demo çalışsın
    setIsKVKKOpen(false);
  }, []);

  const handleAcceptKVKK = () => {
    localStorage.setItem('servis_takip_kvkk_seen', 'true');
    setIsKVKKOpen(false);
    showToast('Konum izni başarıyla tanımlandı. Geofence servisi aktif.');
  };

  // Requirement 8: Geofence scenarios & False Notification prevention
  const handleTriggerGeofenceScenario = (scenario: 'stopped' | 'transit' | 'exited') => {
    const targetFactory = factories[0]; // Arçelik
    const activeVehicle = vehicles.find((v) => v.plate === '26 S 2244') || vehicles[0];

    // Scenario A: Vehicle passing at normal speed (Requirement 8a)
    if (scenario === 'transit') {
      showToast('🚗 Transit Geçiş: Araç normal hızla geçtiği için bildirim engellendi.');
      return;
    }

    // Scenario D: Exited area without confirming (Requirement 8d)
    if (scenario === 'exited') {
      setTrips((prev) => prev.filter((t) => !(t.status === 'pending' && t.factoryId === targetFactory.id)));
      setIsConfirmationOpen(false);
      setConfirmationTrip(null);
      showToast('🚪 Bölgeden Ayrıldı: Onaylanmayan bildirim silindi, listeye düşmedi.');
      return;
    }

    // Scenario B/C: Vehicle stopped (<10 km/s) in geofence
    const isAssigned = (activeVehicle.assignedFactoryIds || []).includes(targetFactory.id);
    if (!isAssigned) {
      showToast(`🚫 Bildirim Engellendi: ${activeVehicle.plate} aracı ${targetFactory.shortName} fabrikasına atanmamış.`);
      return;
    }

    const now = Date.now();
    const lastTime = lastConfirmedAt[targetFactory.id] || 0;
    const elapsedMinutes = (now - lastTime) / (1000 * 60);

    if (lastTime > 0 && elapsedMinutes < 45) {
      showToast(
        `🛡️ Manevra Koruması Aktif: ${targetFactory.shortName} kapısında 45 dk boyunca mükerrer bildirim engellendi.`
      );
      return;
    }

    playAlertChime();

    // Create or find pending trip
    const existingPending = trips.find((t) => t.status === 'pending' && t.factoryId === targetFactory.id);
    if (existingPending) {
      setConfirmationTrip(existingPending);
    } else {
      const newPendingTrip: Trip = {
        id: `trip-pending-${Date.now()}`,
        factoryId: targetFactory.id,
        factoryName: targetFactory.shortName,
        plate: '26 S 2244',
        driverId: 'd1',
        driverName: 'Mehmet Demir',
        onBehalfOf: 'Kendi Hesabıma',
        type: 'tek',
        status: 'pending',
        timestamp: new Date().toISOString(),
        timeStr: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        dateStr: '17.10.2026',
        coordinates: targetFactory.coordinates,
        priceApplied: targetFactory.currentSinglePrice,
        synced: !isOffline,
        notes: `${targetFactory.name} nizamiye indirme noktasında duraklama algılandı.`,
      };
      setTrips((prev) => [newPendingTrip, ...prev]);
      setConfirmationTrip(newPendingTrip);
    }

    setIsConfirmationOpen(true);
  };

  // Requirement 1: Notification without price: "Mehmet Demir, 26 S 2244, Arçelik'e vardı – TEK SEFER – 16:45"
  const handleConfirmTrip = (type: 'tek' | 'cift', onBehalfOf: string) => {
    const targetFactory = factories.find((f) => f.id === confirmationTrip?.factoryId) || factories[0];
    const appliedPrice = type === 'cift' ? targetFactory.currentDoublePrice : targetFactory.currentSinglePrice;
    const nowTimeStr = confirmationTrip?.timeStr || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    // Update trips state (move to confirmed, reduce pending, add to today's list)
    setTrips((prev) => {
      const exists = prev.some((t) => confirmationTrip && t.id === confirmationTrip.id);
      if (exists) {
        return prev.map((t) => {
          if (confirmationTrip && t.id === confirmationTrip.id) {
            return {
              ...t,
              type,
              status: 'confirmed',
              onBehalfOf,
              priceApplied: appliedPrice,
              synced: !isOffline,
              dateStr: t.dateStr || '17.10.2026',
              timeStr: t.timeStr || nowTimeStr,
            };
          }
          return t;
        });
      } else if (confirmationTrip) {
        const confirmedTripItem: Trip = {
          ...confirmationTrip,
          type,
          status: 'confirmed',
          onBehalfOf,
          priceApplied: appliedPrice,
          synced: !isOffline,
          dateStr: confirmationTrip.dateStr || '17.10.2026',
          timeStr: confirmationTrip.timeStr || nowTimeStr,
        };
        return [confirmedTripItem, ...prev];
      }
      return prev;
    });

    // Save debounce timestamp for anti-maneuver protection
    setLastConfirmedAt((prev) => ({
      ...prev,
      [targetFactory.id]: Date.now(),
    }));

    setIsConfirmationOpen(false);
    setConfirmationTrip(null);

    // Exact notification string format without price
    const notifStr = `🔔 Mehmet Demir, 26 S 2244, ${targetFactory.shortName}'e vardı – ${type.toUpperCase()} SEFER – ${nowTimeStr} (${onBehalfOf})`;
    showToast(notifStr);
  };

  // Price update handler with effectiveFrom date (Requirement E.4)
  const handleUpdatePrice = (
    factoryId: string,
    singlePrice: number,
    doublePrice: number,
    note: string,
    effectiveFrom?: string
  ) => {
    const targetFactory = factories.find((f) => f.id === factoryId);
    if (!targetFactory) return;

    setFactories((prev) =>
      prev.map((f) =>
        f.id === factoryId
          ? { ...f, currentSinglePrice: singlePrice, currentDoublePrice: doublePrice }
          : f
      )
    );

    const effDate = effectiveFrom || '17.10.2026';
    const newLog: PriceHistoryEntry = {
      id: `ph-${Date.now()}`,
      factoryId,
      factoryName: targetFactory.shortName,
      singlePrice,
      doublePrice,
      effectiveFrom: effDate,
      changedBy: activeRole === 'company' ? 'Seçil Turizm (Firma Sahibi)' : 'Ahmet Karaca (Araç Sahibi)',
      role: activeRole === 'company' ? 'Servis Firması' : 'Araç Sahibi',
      note,
    };

    setPriceHistory((prev) => [newLog, ...prev]);
    showToast(`Tarife güncellendi (${effDate}): ${targetFactory.shortName} Tek: ${singlePrice} TL, Çift: ${doublePrice} TL`);
  };

  // Requirement E.1: Assign driver & backup driver to vehicle
  const handleAssignDriver = (plate: string, driverName: string, backupDriverName: string) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.plate === plate ? { ...v, driverName, backupDriverName } : v
      )
    );
    showToast(`${plate} için şoför ataması güncellendi: ${driverName} (Yedek: ${backupDriverName})`);
  };

  // Requirement G.2: Add manual trip by driver
  const handleAddManualTrip = (
    factoryId: string,
    type: 'tek' | 'cift',
    timeStr: string,
    reason: string
  ) => {
    const targetFactory = factories.find((f) => f.id === factoryId) || factories[0];
    const newTrip: Trip = {
      id: `trip-manual-${Date.now()}`,
      factoryId: targetFactory.id,
      factoryName: targetFactory.shortName,
      plate: '26 S 2244',
      driverId: 'd1',
      driverName: 'Mehmet Demir',
      onBehalfOf: 'Kendi Hesabıma',
      type,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      timeStr,
      dateStr: '17.10.2026',
      coordinates: targetFactory.coordinates,
      priceApplied: type === 'cift' ? targetFactory.currentDoublePrice : targetFactory.currentSinglePrice,
      synced: !isOffline,
      isManualEntry: true,
      manualStatus: 'pending_company_approval',
      notes: reason,
    };
    setTrips((prev) => [newTrip, ...prev]);
    showToast('Elle sefer kaydı oluşturuldu, Seçil Turizm onayına gönderildi.');
  };

  // Requirement G.3: Request TEK / ÇİFT type correction
  const handleRequestTypeCorrection = (
    tripId: string,
    fromType: 'tek' | 'cift',
    toType: 'tek' | 'cift',
    reason: string
  ) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const newTC: TypeCorrection = {
      id: `tc-${Date.now()}`,
      tripId,
      factoryName: targetTrip.factoryName,
      plate: targetTrip.plate,
      tripTime: targetTrip.timeStr,
      requestedBy: 'Mehmet Demir (Şoför)',
      fromType,
      toType,
      status: 'pending_company_approval',
      reason,
    };

    setTypeCorrections((prev) => [newTC, ...prev]);
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, typeCorrectionStatus: 'pending_company_approval' } : t))
    );
    showToast(`Sefer tipi (${toType.toUpperCase()}) düzeltme talebi firma onayına iletildi.`);
  };

  // Requirement G.4: Report delay (5, 10, 15, 20 min)
  const handleReportDelay = (minutes: number) => {
    setVehicles((prev) =>
      prev.map((v) => (v.plate === '26 S 2244' ? { ...v, delayMinutes: minutes } : v))
    );
    showToast(`⏱️ Gecikme bildirildi: Servis ${minutes} dakika gecikecektir.`);
  };

  // Requirement 3: Report breakdown or accident
  const handleReportEmergency = (type: 'breakdown' | 'accident', notes?: string) => {
    const label = type === 'breakdown' ? 'Araç Arızası' : 'Trafik Kazası';
    setVehicles((prev) =>
      prev.map((v) => (v.plate === '26 S 2244' ? { ...v, status: type } : v))
    );
    if (type === 'breakdown') {
      const inc: BreakdownIncident = {
        id: `inc-${Date.now()}`,
        originalPlate: '26 S 2244',
        driverName: 'Mehmet Demir',
        status: 'reported',
        reportedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        notes: notes || 'Motor hararet yaptı, yol kenarında güvenli alana çekildi.',
      };
      setBreakdownIncident(inc);
      showToast('🚨 26 S 2244 Arıza Bildirdi! Patron ekranına yedek araç atama talebi iletildi.');
    } else {
      showToast(`🚨 ${label} bildirildi! Seçil Turizm idari işler ve yolcular bilgilendirildi.`);
    }
  };

  // Requirement 3: Patron assigns backup vehicle (e.g. 26 S 1085 - Ali Yıldız)
  const handleAssignBackupVehicle = (
    originalPlate: string,
    backupPlate: string,
    backupDriverName: string
  ) => {
    setBreakdownIncident((prev) =>
      prev
        ? {
            ...prev,
            status: 'assigned',
            backupPlate,
            backupDriverName,
            assignedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          }
        : null
    );

    setVehicles((prev) =>
      prev.map((v) =>
        v.plate === originalPlate
          ? {
              ...v,
              backupPlate,
              backupDriverName,
            }
          : v
      )
    );

    // Broadcast notification as explicitly required: "Servisiniz değişti: 26 S 1085"
    showToast(`🔔 Servisiniz değişti: ${backupPlate} (${backupDriverName})`);
  };

  // Requirement 4: Tatil Günleri Toggle & Handlers
  const handleToggleTodayHoliday = () => {
    setIsTodayHoliday(!isTodayHoliday);
    showToast(
      !isTodayHoliday
        ? '🔴 Bugün Resmi Tatil İlan Edildi (Demo). İşçi ve veli ekranları "Bugün servis yok" gösteriyor.'
        : '⚪ Normal Gün Moduna Dönüldü.'
    );
  };

  const handleAddHoliday = (newH: Omit<Holiday, 'id'>) => {
    const holiday: Holiday = {
      ...newH,
      id: `h-${Date.now()}`,
    };
    setHolidays((prev) => [holiday, ...prev]);
    showToast(`Yeni tatil eklendi: ${holiday.name} (${holiday.dateStr})`);
  };

  const handleDeleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    showToast('Tatil günü listeden silindi.');
  };

  // Requirement 1: Login Handler
  const handleLogin = (role: UserRole, user: string) => {
    setActiveRole(role);
    setIsLoggedIn(true);
    showToast(`Giriş yapıldı: ${user}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('Giriş ekranına dönüldü.');
  };

  // Driver requested account correction
  const handleRequestCorrection = (tripId: string, newAccount: string, reason: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const newCorrection: TripCorrection = {
      id: `cor-${Date.now()}`,
      tripId,
      factoryName: targetTrip.factoryName,
      plate: targetTrip.plate,
      tripTime: targetTrip.timeStr,
      tripDate: targetTrip.dateStr,
      requestedBy: 'Mehmet Demir (Şoför)',
      requestedAt: '17.10.2026 16:50',
      oldOnBehalfOf: targetTrip.onBehalfOf || 'Kendi Hesabıma',
      newOnBehalfOf: newAccount,
      status: 'pending_company_approval',
      reason,
    };

    setCorrections((prev) => [newCorrection, ...prev]);

    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, correctionStatus: 'pending_company_approval' } : t))
    );

    showToast('Hesap düzeltme talebi oluşturuldu, firma onayına gönderildi.');
  };

  // Company approves correction
  const handleApproveCorrection = (correctionId: string) => {
    const cor = corrections.find((c) => c.id === correctionId);
    if (!cor) return;

    setCorrections((prev) =>
      prev.map((c) => (c.id === correctionId ? { ...c, status: 'approved' } : c))
    );

    setTrips((prev) =>
      prev.map((t) =>
        t.id === cor.tripId
          ? {
              ...t,
              onBehalfOf: cor.newOnBehalfOf,
              correctionStatus: 'approved',
            }
          : t
      )
    );

    showToast(`Düzeltme onaylandı: ${cor.plate} sefer hesabı '${cor.newOnBehalfOf}' olarak güncellendi.`);
  };

  // Company rejects correction
  const handleRejectCorrection = (correctionId: string) => {
    const cor = corrections.find((c) => c.id === correctionId);
    if (!cor) return;

    setCorrections((prev) =>
      prev.map((c) => (c.id === correctionId ? { ...c, status: 'rejected' } : c))
    );

    setTrips((prev) =>
      prev.map((t) => (t.id === cor.tripId ? { ...t, correctionStatus: 'none' } : t))
    );

    showToast('Düzeltme talebi reddedildi.');
  };

  // Company approves type correction (Tek / Çift)
  const handleApproveTypeCorrection = (id: string) => {
    const tc = typeCorrections.find((t) => t.id === id);
    if (!tc) return;

    setTypeCorrections((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
    );

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tc.tripId) {
          const applied = tc.toType === 'cift' ? 125 : 95;
          return {
            ...t,
            type: tc.toType,
            priceApplied: applied,
            typeCorrectionStatus: 'approved',
          };
        }
        return t;
      })
    );

    showToast(`Sefer türü düzeltmesi onaylandı: ${tc.toType.toUpperCase()}`);
  };

  // Company rejects type correction
  const handleRejectTypeCorrection = (id: string) => {
    setTypeCorrections((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t))
    );
    showToast('Sefer türü düzeltme talebi reddedildi.');
  };

  // Company approves manual trip entry
  const handleApproveManualTrip = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, manualStatus: 'approved', status: 'confirmed' } : t
      )
    );
    showToast('Elle girilen sefer onaylandı ve hak ediş bordrosuna eklendi.');
  };

  // Company rejects manual trip entry
  const handleRejectManualTrip = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, manualStatus: 'rejected' } : t))
    );
    showToast('Elle girilen sefer reddedildi.');
  };

  // Month lock toggle (Ayı Kapat)
  const handleToggleMonthLock = () => {
    setIsMonthLocked(!isMonthLocked);
    showToast(!isMonthLocked ? '🔒 Ekim 2026 Hak Ediş Dönemi KİLİTLENDİ (Ay Kapatıldı).' : '🔓 Hak Ediş Dönemi Kilidi Kaldırıldı.');
  };

  // Vehicle factory assignment
  const handleUpdateVehicleFactories = (plate: string, factoryIds: string[]) => {
    setVehicles((prev) =>
      prev.map((v) => (v.plate === plate ? { ...v, assignedFactoryIds: factoryIds } : v))
    );
    showToast(`${plate} plakalı aracın fabrika atamaları güncellendi.`);
  };

  // Toggle passenger calling driver
  const handleTogglePassengerCallDriver = (enabled: boolean) => {
    setCompanySettings({ allowPassengerCallDriver: enabled });
    showToast(enabled ? 'Yolcuların şoförü arama izni AÇILDI.' : 'Yolcuların şoförü arama izni KAPATILDI.');
  };

  // Regenerate passcode
  const handleRegeneratePasscode = (plate: string) => {
    const newCode = String(Math.floor(1000 + Math.random() * 9000));
    setVehicles((prev) =>
      prev.map((v) => (v.plate === plate ? { ...v, passengerPasscode: newCode } : v))
    );
    showToast(`${plate} için yeni 4 haneli yolcu kodu: ${newCode}`);
  };

  // Send announcement
  const handleSendAnnouncement = (
    title: string,
    message: string,
    target: 'all_drivers' | 'factory_passengers'
  ) => {
    const ann: Announcement = {
      id: `ann-${Date.now()}`,
      fromCompany: 'Seçil Turizm Genel Merkez',
      target,
      title,
      message,
      createdAt: '17.10.2026 ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    setAnnouncements((prev) => [ann, ...prev]);
    showToast(`Duyuru yayınlandı: "${title}"`);
  };

  // Add driver
  const handleAddDriver = (driverData: Omit<DriverProfile, 'id'>) => {
    const newD: DriverProfile = {
      ...driverData,
      id: `d-${Date.now()}`,
    };
    setDrivers((prev) => [...prev, newD]);
    showToast(`Yeni şoför eklendi: ${newD.name}`);
  };

  // Add vehicle
  const handleAddVehicle = (
    vehicleData: Omit<Vehicle, 'driverId' | 'dailyKm' | 'weeklyKm' | 'monthlyKm' | 'coordinates'>
  ) => {
    const newV: Vehicle = {
      ...vehicleData,
      driverId: 'd1',
      dailyKm: 0,
      weeklyKm: 0,
      monthlyKm: 0,
      coordinates: { lat: 39.7745, lng: 30.589 },
    };
    setVehicles((prev) => [...prev, newV]);
    showToast(`Yeni araç filoya eklendi: ${newV.plate}`);
  };

  // Geofence radius update
  const handleUpdateGeofenceRadius = (factoryId: string, radius: number) => {
    setFactories((prev) =>
      prev.map((f) => (f.id === factoryId ? { ...f, geofenceRadiusMeters: radius } : f))
    );
    showToast(`Geofence çemberi güncellendi (${radius} metre)`);
  };

  // Add new factory to shared list (Requirement C & D)
  const handleAddFactory = (newFactoryData: Omit<Factory, 'id'>) => {
    const newFactory: Factory = {
      ...newFactoryData,
      id: `f-${Date.now()}`,
    };
    setFactories((prev) => [...prev, newFactory]);
    showToast(`Yeni fabrika ortak listeye eklendi: ${newFactory.name}`);
  };

  // Admin company management
  const handleToggleCompanyStatus = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId
          ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' }
          : c
      )
    );
    showToast('Firma erişim yetkisi güncellendi.');
  };

  const handleAddCompany = (newCompanyData: Omit<Company, 'id'>) => {
    const comp: Company = {
      ...newCompanyData,
      id: `c-${Date.now()}`,
    };
    setCompanies((prev) => [...prev, comp]);
    showToast(`Yeni servis firması kaydedildi: ${comp.name}`);
  };

  // Parent child management
  const handleToggleChildBoarding = (childId: string) => {
    setChildrenList((prev) =>
      prev.map((c) =>
        c.id === childId ? { ...c, isBoardingToday: !c.isBoardingToday } : c
      )
    );
    const child = childrenList.find((c) => c.id === childId);
    showToast(
      child && child.isBoardingToday
        ? `${child.childName} bugün servise BİNMEYECEK olarak şoföre bildirildi.`
        : `${child?.childName} servise BİNECEK olarak güncellendi.`
    );
  };

  const handleAddChild = (childData: Omit<ParentChild, 'id'>) => {
    const ch: ParentChild = {
      ...childData,
      id: `c-${Date.now()}`,
    };
    setChildrenList((prev) => [...prev, ch]);
    showToast(`Yeni öğrenci veli paneline eklendi: ${ch.childName}`);
  };

  // Student payments
  const handleUpdateStudentPayment = (
    studentId: string,
    status: 'paid' | 'unpaid' | 'partial',
    amount: number
  ) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status,
              paidAmount: amount,
              lastPaymentDate: status === 'paid' ? '17.10.2026 (Nakit/Havale)' : s.lastPaymentDate,
            }
          : s
      )
    );
    showToast('Öğrenci ödeme durumu güncellendi.');
  };

  const handleAddStudent = (newStudentData: Omit<StudentLedgerItem, 'id'>) => {
    const item: StudentLedgerItem = {
      ...newStudentData,
      id: `s-${Date.now()}`,
    };
    setStudents((prev) => [item, ...prev]);
    showToast(`Yeni öğrenci kaydedildi: ${item.studentName}`);
  };

  // Offline trips sync
  const handleSyncOfflineTrips = () => {
    setTrips((prev) => prev.map((t) => ({ ...t, synced: true })));
    playSuccessBeep();
    showToast('Tüm yerel seferler bulut sunucusuyla başarıyla eşitlendi.');
  };

  const pendingTripsCount = trips.filter((t) => t.status === 'pending').length;

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center">
      <PhoneFrame
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        isOffline={isOffline}
        onToggleOffline={() => {
          setIsOffline(!isOffline);
          showToast(!isOffline ? 'Çevrimdışı moda geçildi (İnternet kapalı)' : 'Çevrimiçi moda dönüldü');
        }}
        onTriggerGeofence={handleTriggerGeofenceScenario}
        onOpenKVKK={() => setIsKVKKOpen(true)}
        pendingTripsCount={pendingTripsCount}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      >
        {/* Requirement 1: Gerçek Giriş Ekranı (Uygulama açılınca ayrı giriş ekranı gelsin) */}
        {!isLoggedIn ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <>
            {/* Dynamic Screen Routing for 7 Roles */}
            {activeRole === 'admin' && (
              <AdminScreen
                companies={companies}
                factories={factories}
                totalTripsCount={trips.filter((t) => t.status === 'confirmed').length}
                totalVehiclesCount={vehicles.length}
                onToggleCompanyStatus={handleToggleCompanyStatus}
                onAddCompany={handleAddCompany}
                onUpdateFactoryRadius={handleUpdateGeofenceRadius}
              />
            )}

            {activeRole === 'driver' && (
              <DriverScreen
                trips={trips}
                factories={factories}
                onOpenConfirmation={(trip) => {
                  let target = trip || trips.find((t) => t.status === 'pending');
                  if (!target) {
                    const targetFactory = factories[0];
                    target = {
                      id: `trip-pending-${Date.now()}`,
                      factoryId: targetFactory.id,
                      factoryName: targetFactory.shortName,
                      plate: '26 S 2244',
                      driverId: 'd1',
                      driverName: 'Mehmet Demir',
                      onBehalfOf: 'Kendi Hesabıma',
                      type: 'tek',
                      status: 'pending',
                      timestamp: new Date().toISOString(),
                      timeStr: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                      dateStr: '17.10.2026',
                      coordinates: targetFactory.coordinates,
                      priceApplied: targetFactory.currentSinglePrice,
                      synced: !isOffline,
                      notes: `${targetFactory.name} nizamiye indirme noktasında duraklama algılandı.`,
                    };
                    setTrips((prev) => [target!, ...prev]);
                  }
                  setConfirmationTrip(target);
                  setIsConfirmationOpen(true);
                }}
                onSyncOfflineTrips={handleSyncOfflineTrips}
                onRequestCorrection={handleRequestCorrection}
                onRequestTypeCorrection={handleRequestTypeCorrection}
                onAddManualTrip={handleAddManualTrip}
                onReportDelay={handleReportDelay}
                onReportEmergency={handleReportEmergency}
                onSelectVehiclePlate={(plate) => showToast(`Seçilen araç: ${plate}`)}
                isOffline={isOffline}
                activePlate="26 S 2244"
                driverName="Mehmet Demir"
                onSwitchToOwner={() => setActiveRole('owner')}
                childrenList={childrenList}
              />
            )}

            {activeRole === 'owner' && (
              <OwnerScreen
                vehicles={vehicles}
                trips={trips}
                factories={factories}
                priceHistory={priceHistory}
                students={students}
                onUpdatePrice={handleUpdatePrice}
                onUpdateStudentPayment={handleUpdateStudentPayment}
                onAddStudent={handleAddStudent}
                onAssignDriver={handleAssignDriver}
                onSwitchToDriver={() => setActiveRole('driver')}
                holidays={holidays}
                isTodayHoliday={isTodayHoliday}
                onToggleTodayHoliday={handleToggleTodayHoliday}
                onAddHoliday={handleAddHoliday}
                onDeleteHoliday={handleDeleteHoliday}
                breakdownIncident={breakdownIncident}
                onAssignBackupVehicle={handleAssignBackupVehicle}
              />
            )}

            {activeRole === 'company' && (
              <CompanyScreen
                factories={factories}
                vehicles={vehicles}
                drivers={drivers}
                trips={trips}
                priceHistory={priceHistory}
                corrections={corrections}
                typeCorrections={typeCorrections}
                announcements={announcements}
                companySettings={companySettings}
                isMonthLocked={isMonthLocked}
                onToggleMonthLock={handleToggleMonthLock}
                onTogglePassengerCallDriver={handleTogglePassengerCallDriver}
                onUpdateVehicleFactories={handleUpdateVehicleFactories}
                onRegeneratePasscode={handleRegeneratePasscode}
                onApproveCorrection={handleApproveCorrection}
                onRejectCorrection={handleRejectCorrection}
                onApproveTypeCorrection={handleApproveTypeCorrection}
                onRejectTypeCorrection={handleRejectTypeCorrection}
                onApproveManualTrip={handleApproveManualTrip}
                onRejectManualTrip={handleRejectManualTrip}
                onSendAnnouncement={handleSendAnnouncement}
                onAddFactory={handleAddFactory}
                onUpdateGeofenceRadius={handleUpdateGeofenceRadius}
                onUpdatePrice={handleUpdatePrice}
                onAddDriver={handleAddDriver}
                onAddVehicle={handleAddVehicle}
                holidays={holidays}
                isTodayHoliday={isTodayHoliday}
                onToggleTodayHoliday={handleToggleTodayHoliday}
                onAddHoliday={handleAddHoliday}
                onDeleteHoliday={handleDeleteHoliday}
              />
            )}

            {activeRole === 'factory' && (
              <FactoryScreen factories={factories} trips={trips} />
            )}

            {activeRole === 'worker' && (
              <WorkerScreen
                vehicles={vehicles}
                isTodayHoliday={isTodayHoliday}
                holidayName={holidays.find((h) => h.isToday || h.dateStr === '29.10.2026')?.name || '29 Ekim Cumhuriyet Bayramı'}
                backupIncidentPlate={breakdownIncident?.backupPlate}
                backupDriverName={breakdownIncident?.backupDriverName}
              />
            )}

            {activeRole === 'parent' && (
              <ParentScreen
                childrenList={childrenList}
                vehicles={vehicles}
                onToggleChildBoarding={handleToggleChildBoarding}
                onAddChild={handleAddChild}
                isTodayHoliday={isTodayHoliday}
                holidayName={holidays.find((h) => h.isToday || h.dateStr === '29.10.2026')?.name || '29 Ekim Cumhuriyet Bayramı'}
                backupIncidentPlate={breakdownIncident?.backupPlate}
                backupDriverName={breakdownIncident?.backupDriverName}
              />
            )}

            {/* In-Phone Bottom Navigation Bar for Ergonomic Thumb Navigation across all 7 roles */}
            <nav className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-7 items-center px-1 z-40 select-none">
              <button
                onClick={() => setActiveRole('admin')}
                title="Yönetici Paneli"
                className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
                  activeRole === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] mt-1 tracking-tight">Yönetici</span>
              </button>

              <button
                onClick={() => setActiveRole('company')}
                title="Servis Firması (Seçil Turizm)"
                className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
                  activeRole === 'company' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[9px] mt-1 tracking-tight">Firma</span>
              </button>

              <button
                onClick={() => setActiveRole('owner')}
                title="Araç Sahibi (Ahmet Karaca)"
                className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
                  activeRole === 'owner' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-[9px] mt-1 tracking-tight">Sahip</span>
              </button>

              <button
                onClick={() => setActiveRole('driver')}
                title="Şoför (Mehmet Demir)"
                className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
                  activeRole === 'driver' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Truck className="w-4 h-4" />
                  {pendingTripsCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
                  )}
                </div>
                <span className="text-[9px] mt-1 tracking-tight">Şoför</span>
              </button>

              <button
                onClick={() => setActiveRole('factory')}
                title="Fabrika (Arçelik)"
                className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
                  activeRole === 'factory' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[9px] mt-1 tracking-tight">Fabrika</span>
              </button>

              <button
                onClick={() => setActiveRole('worker')}
                title="İşçi (Arçelik Personeli)"
                className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
                  activeRole === 'worker' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span className="text-[9px] mt-1 tracking-tight">İşçi</span>
              </button>

              <button
                onClick={() => setActiveRole('parent')}
                title="Veli (Öğrenci Velisi)"
                className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
                  activeRole === 'parent' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span className="text-[9px] mt-1 tracking-tight">Veli</span>
              </button>
            </nav>

            {/* Confirmation Modal: Displays on TEK/ÇİFT confirmation request */}
            {isConfirmationOpen && (
              <ConfirmationModal
                isOpen={isConfirmationOpen}
                factory={
                  factories.find((f) => f.id === confirmationTrip?.factoryId) ||
                  factories[0]
                }
                plate={confirmationTrip?.plate || '26 S 2244'}
                driverName={confirmationTrip?.driverName || 'Mehmet Demir'}
                isOffline={isOffline}
                timeStr={confirmationTrip?.timeStr || '16:45'}
                onConfirm={handleConfirmTrip}
                onPostpone={() => {
                  setIsConfirmationOpen(false);
                }}
              />
            )}

            {/* KVKK Location Consent Modal */}
            {isKVKKOpen && (
              <KVKKModal
                isOpen={isKVKKOpen}
                onClose={() => setIsKVKKOpen(false)}
                onAccept={handleAcceptKVKK}
              />
            )}

            {/* Login Role Switcher Modal */}
            {isLoginModalOpen && (
              <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSelectRole={(role) => {
                  setActiveRole(role);
                  setIsLoginModalOpen(false);
                }}
              />
            )}
          </>
        )}
      </PhoneFrame>
    </div>
  );
}
