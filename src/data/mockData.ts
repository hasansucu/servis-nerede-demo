import {
  Announcement,
  Company,
  DriverProfile,
  Factory,
  Holiday,
  ParentChild,
  PriceHistoryEntry,
  StudentLedgerItem,
  Trip,
  TripCorrection,
  TypeCorrection,
  Vehicle
} from '../types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'Seçil Turizm',
    city: 'Eskişehir',
    phone: '0222 230 40 50',
    status: 'active',
    monthlyFee: 4500,
    subscriptionStatus: 'paid',
    totalVehicles: 4,
    isMonthLocked: false,
  },
  {
    id: 'c2',
    name: 'Özlem Turizm',
    city: 'Eskişehir',
    phone: '0222 320 88 99',
    status: 'active',
    monthlyFee: 4500,
    subscriptionStatus: 'trial',
    trialRemainingDays: 18,
    totalVehicles: 6,
    isMonthLocked: false,
  },
  {
    id: 'c3',
    name: 'Çözüm Taşımacılık',
    city: 'Eskişehir',
    phone: '0222 221 11 22',
    status: 'suspended',
    monthlyFee: 4500,
    subscriptionStatus: 'unpaid',
    totalVehicles: 2,
    isMonthLocked: true,
  },
];

export const INITIAL_FACTORIES: Factory[] = [
  {
    id: 'f1',
    name: 'Arçelik Buzdolabı & Kompresör İşletmesi',
    shortName: 'Arçelik',
    code: 'ARC-ESK',
    address: 'Organize Sanayi Bölgesi 1. Cadde No: 8, Odunpazarı / Eskişehir',
    geofenceRadiusMeters: 140,
    coordinates: { lat: 39.7745, lng: 30.5890 },
    currentSinglePrice: 100,
    currentDoublePrice: 130,
    color: '#0284c7', // Sky Blue
    activeShifts: ['08:00 - 16:00', '16:00 - 24:00', '24:00 - 08:00'],
  },
  {
    id: 'f2',
    name: 'Eti Bisküvi & Kek Üretim Tesisleri',
    shortName: 'Eti Gıda',
    code: 'ETI-ESK',
    address: 'Organize Sanayi Bölgesi 11. Cadde No: 4, Eskişehir',
    geofenceRadiusMeters: 120,
    coordinates: { lat: 39.7680, lng: 30.5985 },
    currentSinglePrice: 95,
    currentDoublePrice: 125,
    color: '#d97706', // Amber
    activeShifts: ['07:30 - 15:30', '15:30 - 23:30', '23:30 - 07:30'],
  },
  {
    id: 'f3',
    name: 'Ford Otosan Kamyon & Motor Fabrikası',
    shortName: 'Ford Otosan',
    code: 'FRD-INN',
    address: 'İnönü Tesisleri, Kütahya Yolu 30. km, İnönü / Eskişehir',
    geofenceRadiusMeters: 180,
    coordinates: { lat: 39.8120, lng: 30.1540 },
    currentSinglePrice: 160,
    currentDoublePrice: 220,
    color: '#2563eb', // Royal Blue
    activeShifts: ['08:00 - 16:30', '16:30 - 01:00'],
  },
  {
    id: 'f4',
    name: 'TUSAŞ Motor Sanayii A.Ş. (TEI)',
    shortName: 'TUSAŞ / TEI',
    code: 'TEI-ESK',
    address: 'Çevre Yolu Üzeri, Tepebaşı / Eskişehir',
    geofenceRadiusMeters: 130,
    coordinates: { lat: 39.7915, lng: 30.5180 },
    currentSinglePrice: 115,
    currentDoublePrice: 150,
    color: '#059669', // Emerald
    activeShifts: ['08:30 - 17:30', 'Vardiya A', 'Vardiya B'],
  },
];

export const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'd1',
    name: 'Mehmet Demir',
    phone: '0532 555 12 34',
    assignedPlate: '26 S 2244',
    companyId: 'c1',
    accessStatus: 'active',
    documents: {
      licenseExpiry: '2028-06-15',     // Geçerli (Yeşil)
      srcExpiry: '2026-11-02',         // 16 Gün Kaldı (Sarı)
      psychoTestExpiry: '2027-04-10',  // Geçerli (Yeşil)
    },
  },
  {
    id: 'd2',
    name: 'Ali Yıldız',
    phone: '0544 333 45 67',
    assignedPlate: '26 S 1085',
    companyId: 'c1',
    accessStatus: 'active',
    documents: {
      licenseExpiry: '2027-09-20',
      srcExpiry: '2026-10-28',         // 11 Gün Kaldı (Sarı)
      psychoTestExpiry: '2026-09-01',  // Gecikmiş (Kırmızı)
    },
  },
  {
    id: 'd3',
    name: 'Hasan Çelik',
    phone: '0505 222 78 90',
    assignedPlate: '26 S 0412',
    companyId: 'c1',
    accessStatus: 'active',
    documents: {
      licenseExpiry: '2029-01-10',
      srcExpiry: '2027-11-15',
      psychoTestExpiry: '2028-03-25',
    },
  },
  {
    id: 'd4',
    name: 'Mustafa Kaya',
    phone: '0530 999 11 22',
    assignedPlate: '26 S 3390',
    companyId: 'c1',
    accessStatus: 'active',
    documents: {
      licenseExpiry: '2028-08-14',
      srcExpiry: '2028-02-19',
      psychoTestExpiry: '2027-12-05',
    },
  },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    plate: '26 S 2244',
    model: 'Mercedes-Benz Sprinter 19+1 (2023)',
    driverId: 'd1',
    driverName: 'Mehmet Demir',
    driverPhone: '0532 555 12 34',
    assignedCompanyId: 'c1',
    assignedCompanyName: 'Seçil Turizm',
    ownerId: 'owner-1', // Ahmet Karaca (Patron)
    assignedFactoryIds: ['f1', 'f2'], // Arçelik, Eti Gıda
    isOnline: true,
    currentRoute: 'Yenidoğan - Emek - Arçelik Fabrikası',
    destination: 'Arçelik Buzdolabı İşletmesi',
    etaMinutes: 4,
    progressPercent: 78,
    isCompleted: false,
    passengerPasscode: '4819', // 4 haneli kod
    dailyKm: 68,
    weeklyKm: 420,
    monthlyKm: 1840,
    isKmEstimated: false,
    status: 'active',
    documents: {
      inspectionExpiry: '2027-03-15',       // Muayene (Geçerli)
      trafficInsuranceExpiry: '2026-11-01', // 15 Gün Kaldı (Sarı uyarı)
      comprehensiveInsuranceExpiry: '2027-05-20', // Kasko (Geçerli)
      licenseRegistrationExpiry: '2026-09-30', // Süresi Geçmiş (Kırmızı)
    },
    coordinates: { lat: 39.7710, lng: 30.5840 },
  },
  {
    plate: '26 S 1085',
    model: 'Volkswagen Crafter 16+1 (2022)',
    driverId: 'd2',
    driverName: 'Ali Yıldız',
    driverPhone: '0544 333 45 67',
    assignedCompanyId: 'c1',
    assignedCompanyName: 'Seçil Turizm',
    ownerId: 'owner-1', // Ahmet Karaca (Patron)
    assignedFactoryIds: ['f1', 'f3'], // Arçelik, Ford Otosan
    isOnline: true,
    currentRoute: 'Bağlar - Şirintepe - Arçelik',
    destination: 'Arçelik Fabrikası',
    etaMinutes: 12,
    progressPercent: 45,
    isCompleted: false,
    passengerPasscode: '7290',
    dailyKm: 52,
    weeklyKm: 310,
    monthlyKm: 1420,
    isKmEstimated: true, // Telefon kapalı günlerden dolayı tahmini
    status: 'active',
    documents: {
      inspectionExpiry: '2026-10-31', // 14 Gün Kaldı (Sarı)
      trafficInsuranceExpiry: '2027-02-10',
      comprehensiveInsuranceExpiry: '2027-02-10',
      licenseRegistrationExpiry: '2027-06-15',
    },
    coordinates: { lat: 39.7620, lng: 30.5750 },
  },
  {
    plate: '26 S 0412',
    model: 'Otokar Sultan Maxi 31+1 (2021)',
    driverId: 'd3',
    driverName: 'Hasan Çelik',
    driverPhone: '0505 222 78 90',
    assignedCompanyId: 'c1',
    assignedCompanyName: 'Seçil Turizm',
    ownerId: 'owner-2', // Diğer araç sahibi
    assignedFactoryIds: ['f3'], // Ford Otosan
    isOnline: true,
    currentRoute: 'Çamlıca - Batıkent - Ford Otosan',
    destination: 'Ford Otosan İnönü',
    etaMinutes: 28,
    progressPercent: 20,
    isCompleted: false,
    passengerPasscode: '3150',
    dailyKm: 110,
    weeklyKm: 650,
    monthlyKm: 2750,
    isKmEstimated: false,
    status: 'active',
    documents: {
      inspectionExpiry: '2027-08-12',
      trafficInsuranceExpiry: '2027-04-18',
      comprehensiveInsuranceExpiry: '2027-04-18',
      licenseRegistrationExpiry: '2027-11-20',
    },
    coordinates: { lat: 39.8050, lng: 30.2200 },
  },
  {
    plate: '26 S 3390',
    model: 'Isuzu Novo Lux 27+1 (2024)',
    driverId: 'd4',
    driverName: 'Mustafa Kaya',
    driverPhone: '0530 999 11 22',
    assignedCompanyId: 'c1',
    assignedCompanyName: 'Seçil Turizm',
    ownerId: 'owner-3', // Diğer araç sahibi
    assignedFactoryIds: ['f4'], // TUSAŞ TEI
    isOnline: false,
    currentRoute: 'Vişnelik - TUSAŞ TEI',
    destination: 'TUSAŞ TEI',
    etaMinutes: 0,
    progressPercent: 100,
    isCompleted: true,
    passengerPasscode: '8842',
    dailyKm: 44,
    weeklyKm: 280,
    monthlyKm: 1200,
    isKmEstimated: false,
    status: 'active',
    documents: {
      inspectionExpiry: '2028-05-10',
      trafficInsuranceExpiry: '2027-09-01',
      comprehensiveInsuranceExpiry: '2027-09-01',
      licenseRegistrationExpiry: '2028-01-15',
    },
    coordinates: { lat: 39.7915, lng: 30.5180 },
  },
];

export const INITIAL_PRICE_HISTORY: PriceHistoryEntry[] = [
  {
    id: 'ph-1',
    factoryId: 'f1',
    factoryName: 'Arçelik',
    singlePrice: 100,
    doublePrice: 130,
    effectiveFrom: '2026-10-01',
    changedBy: 'Seçil Turizm (Firma)',
    role: 'Servis Firması',
    note: 'Ekim ayı akaryakıt güncellemesi doğrultusunda tek 90->100 TL, çift 120->130 TL yapıldı.',
  },
  {
    id: 'ph-2',
    factoryId: 'f1',
    factoryName: 'Arçelik',
    singlePrice: 90,
    doublePrice: 120,
    effectiveFrom: '2026-08-01',
    changedBy: 'Ahmet Karaca (Patron)',
    role: 'Araç Sahibi',
    note: 'Yıllık sözleşme taban fiyatı',
  },
  {
    id: 'ph-3',
    factoryId: 'f2',
    factoryName: 'Eti Gıda',
    singlePrice: 95,
    doublePrice: 125,
    effectiveFrom: '2026-09-15',
    changedBy: 'Seçil Turizm (Firma)',
    role: 'Servis Firması',
    note: 'Mesafe düzenlemesi sonrası güncellenen fiyat',
  },
  {
    id: 'ph-4',
    factoryId: 'f3',
    factoryName: 'Ford Otosan',
    singlePrice: 160,
    doublePrice: 220,
    effectiveFrom: '2026-09-01',
    changedBy: 'Seçil Turizm (Firma)',
    role: 'Servis Firması',
    note: 'İnönü hattı otoyol ve uzak mesafe katsayısı',
  },
];

export const INITIAL_TRIPS: Trip[] = [
  // Bugüne ait onay bekleyen sefer
  {
    id: 'trip-pending-1',
    factoryId: 'f1',
    factoryName: 'Arçelik',
    plate: '26 S 2244',
    driverId: 'd1',
    driverName: 'Mehmet Demir',
    onBehalfOf: 'Kendi Hesabıma',
    type: 'tek',
    status: 'pending',
    timestamp: '2026-10-17T16:42:15',
    timeStr: '16:42',
    dateStr: '17.10.2026',
    coordinates: { lat: 39.7744, lng: 30.5892 },
    priceApplied: 100,
    synced: true,
    notes: 'Arçelik Fabrikası Ana Nizamiye kapısında geofence algılandı.',
  },
  // Bugün tamamlananlar
  {
    id: 'trip-today-1',
    factoryId: 'f1',
    factoryName: 'Arçelik',
    plate: '26 S 2244',
    driverId: 'd1',
    driverName: 'Mehmet Demir',
    onBehalfOf: 'Kendi Hesabıma',
    type: 'cift',
    status: 'confirmed',
    timestamp: '2026-10-17T07:48:10',
    timeStr: '07:48',
    dateStr: '17.10.2026',
    coordinates: { lat: 39.7746, lng: 30.5889 },
    priceApplied: 130,
    synced: true,
  },
  {
    id: 'trip-today-2',
    factoryId: 'f2',
    factoryName: 'Eti Gıda',
    plate: '26 S 2244',
    driverId: 'd1',
    driverName: 'Mehmet Demir',
    onBehalfOf: 'Kendi Hesabıma',
    type: 'tek',
    status: 'confirmed',
    timestamp: '2026-10-17T15:15:30',
    timeStr: '15:15',
    dateStr: '17.10.2026',
    coordinates: { lat: 39.7681, lng: 30.5983 },
    priceApplied: 95,
    synced: true,
  },
  // Başkasının yerine yapılmış istisnai sefer
  {
    id: 'trip-sub-1',
    factoryId: 'f1',
    factoryName: 'Arçelik',
    plate: '26 S 2244',
    driverId: 'd1',
    driverName: 'Mehmet Demir',
    onBehalfOf: '26 S 1085 (Ali Yıldız Yerine)',
    type: 'tek',
    status: 'confirmed',
    timestamp: '2026-10-16T07:50:00',
    timeStr: '07:50',
    dateStr: '16.10.2026',
    coordinates: { lat: 39.7745, lng: 30.5891 },
    priceApplied: 100,
    synced: true,
    notes: 'Ali Yıldız lastik patlaması sebebiyle yerine gidildi.',
  },
];

// Ekim ayı için kusursuz tutarlı demo dökümü:
// 26 S 2244 (Mehmet Demir):
// - Arçelik: 39 tek (toplam bugünle 40), 29 çift (toplam bugünle 30) = 70 sefer
// - Eti Gıda: 17 tek (toplam 18), 12 çift = 30 sefer
// -> ŞOFÖR MEHMET DEMİR TOPLAMI: 100 Sefer (Fiyat görmez)
// -> AHMET KARACA (Patron): 26 S 2244 (100 Sefer, 11.110 TL) + 26 S 1085 (30 Sefer, 3.450 TL) = 130 Sefer, 14.560 TL
// -> SEÇİL TURİZM (Firma): Tüm 4 araç = 175 Sefer, 22.110 TL
// -> ARÇELİK FABRİKASI: Seçil Turizm'den gelen toplam 100 Sefer (26 S 2244: 70 sefer, 26 S 1085: 30 sefer)
(() => {
  let idCounter = 100;
  // 26 S 2244 - Arçelik için 39 tane daha tek ekleyelim (toplam 40 tek)
  for (let i = 1; i <= 39; i++) {
    const day = (i % 16) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-arc-tek-${idCounter++}`,
      factoryId: 'f1',
      factoryName: 'Arçelik',
      plate: '26 S 2244',
      driverId: 'd1',
      driverName: 'Mehmet Demir',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'tek',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T15:35:00`,
      timeStr: '15:35',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.7745, lng: 30.5890 },
      priceApplied: 100,
      synced: true,
    });
  }

  // 26 S 2244 - Arçelik için 29 tane daha çift ekleyelim (toplam 30 çift)
  for (let i = 1; i <= 29; i++) {
    const day = (i % 16) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-arc-cift-${idCounter++}`,
      factoryId: 'f1',
      factoryName: 'Arçelik',
      plate: '26 S 2244',
      driverId: 'd1',
      driverName: 'Mehmet Demir',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'cift',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T07:45:00`,
      timeStr: '07:45',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.7745, lng: 30.5890 },
      priceApplied: 130,
      synced: true,
    });
  }

  // 26 S 2244 - Eti Gıda için 17 tek (toplam 18) ve 12 çift
  for (let i = 1; i <= 17; i++) {
    const day = (i % 15) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-eti-tek-${idCounter++}`,
      factoryId: 'f2',
      factoryName: 'Eti Gıda',
      plate: '26 S 2244',
      driverId: 'd1',
      driverName: 'Mehmet Demir',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'tek',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T23:20:00`,
      timeStr: '23:20',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.7680, lng: 30.5985 },
      priceApplied: 95,
      synced: true,
    });
  }

  for (let i = 1; i <= 12; i++) {
    const day = (i % 15) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-eti-cift-${idCounter++}`,
      factoryId: 'f2',
      factoryName: 'Eti Gıda',
      plate: '26 S 2244',
      driverId: 'd1',
      driverName: 'Mehmet Demir',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'cift',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T07:25:00`,
      timeStr: '07:25',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.7680, lng: 30.5985 },
      priceApplied: 125,
      synced: true,
    });
  }

  // 26 S 1085 (Ali Yıldız - Ahmet Karaca'nın 2. aracı)
  // Arçelik için 15 tek (100 TL = 1.500 TL) ve 15 çift (130 TL = 1.950 TL) = 3.450 TL
  for (let i = 1; i <= 15; i++) {
    const day = (i % 15) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-1085-tek-${idCounter++}`,
      factoryId: 'f1',
      factoryName: 'Arçelik',
      plate: '26 S 1085',
      driverId: 'd2',
      driverName: 'Ali Yıldız',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'tek',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T15:40:00`,
      timeStr: '15:40',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.7745, lng: 30.5890 },
      priceApplied: 100,
      synced: true,
    });
  }
  for (let i = 1; i <= 15; i++) {
    const day = (i % 15) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-1085-cift-${idCounter++}`,
      factoryId: 'f1',
      factoryName: 'Arçelik',
      plate: '26 S 1085',
      driverId: 'd2',
      driverName: 'Ali Yıldız',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'cift',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T07:50:00`,
      timeStr: '07:50',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.7745, lng: 30.5890 },
      priceApplied: 130,
      synced: true,
    });
  }

  // 26 S 0412 (Hasan Çelik - Ford Otosan) - 10 tek (160 TL) + 15 çift (220 TL) = 4.900 TL
  for (let i = 1; i <= 10; i++) {
    const day = (i % 10) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-0412-tek-${idCounter++}`,
      factoryId: 'f3',
      factoryName: 'Ford Otosan',
      plate: '26 S 0412',
      driverId: 'd3',
      driverName: 'Hasan Çelik',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'tek',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T16:45:00`,
      timeStr: '16:45',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.8120, lng: 30.1540 },
      priceApplied: 160,
      synced: true,
    });
  }
  for (let i = 1; i <= 15; i++) {
    const day = (i % 15) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-0412-cift-${idCounter++}`,
      factoryId: 'f3',
      factoryName: 'Ford Otosan',
      plate: '26 S 0412',
      driverId: 'd3',
      driverName: 'Hasan Çelik',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'cift',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T08:10:00`,
      timeStr: '08:10',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.8120, lng: 30.1540 },
      priceApplied: 220,
      synced: true,
    });
  }

  // 26 S 3390 (Mustafa Kaya - TUSAŞ) - 10 tek (115 TL) + 10 çift (150 TL) = 2.650 TL
  for (let i = 1; i <= 10; i++) {
    const day = (i % 10) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    INITIAL_TRIPS.push({
      id: `trip-hist-3390-tek-${idCounter++}`,
      factoryId: 'f4',
      factoryName: 'TUSAŞ / TEI',
      plate: '26 S 3390',
      driverId: 'd4',
      driverName: 'Mustafa Kaya',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'tek',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T17:35:00`,
      timeStr: '17:35',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.7915, lng: 30.5180 },
      priceApplied: 115,
      synced: true,
    });
    INITIAL_TRIPS.push({
      id: `trip-hist-3390-cift-${idCounter++}`,
      factoryId: 'f4',
      factoryName: 'TUSAŞ / TEI',
      plate: '26 S 3390',
      driverId: 'd4',
      driverName: 'Mustafa Kaya',
      onBehalfOf: 'Kendi Hesabıma',
      type: 'cift',
      status: 'confirmed',
      timestamp: `2026-10-${dayStr}T08:20:00`,
      timeStr: '08:20',
      dateStr: `${dayStr}.10.2026`,
      coordinates: { lat: 39.7915, lng: 30.5180 },
      priceApplied: 150,
      synced: true,
    });
  }
})();

export const INITIAL_CORRECTIONS: TripCorrection[] = [
  {
    id: 'cor-1',
    tripId: 'trip-sub-1',
    factoryName: 'Arçelik',
    plate: '26 S 2244',
    tripTime: '07:50',
    tripDate: '16.10.2026',
    requestedBy: 'Mehmet Demir (Şoför)',
    requestedAt: '16.10.2026 18:30',
    oldOnBehalfOf: 'Kendi Hesabıma',
    newOnBehalfOf: '26 S 1085 (Ali Yıldız Yerine)',
    status: 'approved',
    reason: 'Ali Yıldız lastik patlaması sebebiyle yerine gidildi.',
  },
];

export const INITIAL_TYPE_CORRECTIONS: TypeCorrection[] = [
  {
    id: 'tc-1',
    tripId: 'trip-today-2',
    factoryName: 'Eti Gıda',
    plate: '26 S 2244',
    tripTime: '15:15',
    requestedBy: 'Mehmet Demir (Şoför)',
    fromType: 'tek',
    toType: 'cift',
    status: 'pending_company_approval',
    reason: 'Dönüşte 3. vardiya personeli alındığı için Çift sefer yapılmalıydı.',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    fromCompany: 'Seçil Turizm Genel Merkez',
    target: 'all_drivers',
    title: '29 Ekim Cumhuriyet Bayramı Sefer Düzeni',
    message: '29 Ekim Perşembe günü sadece Arçelik 1. vardiya servisi çalışacak, diğer vardiya seferleri yapılmayacaktır.',
    createdAt: '17.10.2026 09:00',
  },
  {
    id: 'ann-2',
    fromCompany: 'Seçil Turizm',
    target: 'factory_passengers',
    targetDetail: 'Arçelik',
    title: 'Yol Bakım Çalışması Uyarısı',
    message: 'Organize Sanayi 1. Cadde kavşağındaki çalışma nedeniyle servis araçlarımız 5-10 dakika gecikmeli varabilir.',
    createdAt: '16.10.2026 14:30',
  },
];

export const INITIAL_CHILDREN: ParentChild[] = [
  {
    id: 'c-1',
    childName: 'Zeynep Su Kaya',
    schoolName: 'Ahmet Kanatlı Anadolu Lisesi',
    plate: '26 S 1085',
    passcode: '7290',
    morningPickupTime: '07:35',
    afternoonDropoffTime: '15:45',
    isBoardingToday: true,
    status: 'on_the_way_school',
    parentAccessActive: true,
    driverName: 'Ali Yıldız',
    driverPhone: '0544 333 45 67',
  },
  {
    id: 'c-2',
    childName: 'Can Kaya',
    schoolName: 'Atatürk Ortaokulu',
    plate: '26 S 2244',
    passcode: '4819',
    morningPickupTime: '07:55',
    afternoonDropoffTime: '15:10',
    isBoardingToday: false, // Veli "Bugün binmeyecek" işaretlemiş
    status: 'home',
    parentAccessActive: true,
    driverName: 'Mehmet Demir',
    driverPhone: '0532 555 12 34',
  },
];

export const INITIAL_STUDENTS: StudentLedgerItem[] = [
  {
    id: 's-1',
    studentName: 'Ahmet Eren Yılmaz',
    school: 'Eskişehir Fatih Anadolu Lisesi',
    parentName: 'Kemal Yılmaz',
    parentPhone: '0532 411 22 33',
    monthlyFee: 3200,
    status: 'paid',
    paidAmount: 3200,
    lastPaymentDate: '03.10.2026 (Havale)',
    notes: 'Öğrenci sabah 07:40 Vişnelik durağından biniyor.',
  },
  {
    id: 's-2',
    studentName: 'Zeynep Su Kaya',
    school: 'Ahmet Kanatlı Anadolu Lisesi',
    parentName: 'Fatma Kaya',
    parentPhone: '0544 200 99 88',
    monthlyFee: 3200,
    status: 'unpaid',
    paidAmount: 0,
    notes: 'Maaş günü 18 Ekim ödenecek dendi.',
  },
  {
    id: 's-3',
    studentName: 'Can Kaya',
    school: 'Atatürk Ortaokulu',
    parentName: 'Fatma Kaya',
    parentPhone: '0544 200 99 88',
    monthlyFee: 3000,
    status: 'paid',
    paidAmount: 3000,
    lastPaymentDate: '05.10.2026',
    notes: 'Bugün binmeyecek olarak işaretli.',
  },
  {
    id: 's-4',
    studentName: 'Efe Barış Şahin',
    school: 'Eskişehir Fatih Anadolu Lisesi',
    parentName: 'Serdar Şahin',
    parentPhone: '0505 888 12 34',
    monthlyFee: 3200,
    status: 'partial',
    paidAmount: 1600,
    lastPaymentDate: '05.10.2026 (Nakit)',
    notes: 'Kalan 1.600 TL ayın 20 sinde verilecek.',
  },
  {
    id: 's-5',
    studentName: 'Defne Öztürk',
    school: 'Gazi Yakup Satar Kız MTAL',
    parentName: 'Aysel Öztürk',
    parentPhone: '0533 777 44 11',
    monthlyFee: 3000,
    status: 'paid',
    paidAmount: 3000,
    lastPaymentDate: '02.10.2026 (EFT)',
  },
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'h-1',
    name: '29 Ekim Cumhuriyet Bayramı',
    dateStr: '29.10.2026',
    isToday: false,
    type: 'official',
    appliesTo: 'all',
    description: 'Cumhuriyetimizin 103. yılı kutlamaları sebebiyle tüm resmi/özel kurumlar tatildir.',
  },
  {
    id: 'h-2',
    name: 'Ramazan Bayramı Tatili (1. Gün)',
    dateStr: '20.03.2026',
    isToday: false,
    type: 'official',
    appliesTo: 'all',
    description: 'Dini bayram resmi tatili.',
  },
  {
    id: 'h-3',
    name: 'Kurban Bayramı Tatili (1. Gün)',
    dateStr: '27.05.2026',
    isToday: false,
    type: 'official',
    appliesTo: 'all',
    description: 'Dini bayram resmi tatili.',
  },
  {
    id: 'h-4',
    name: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı',
    dateStr: '23.04.2026',
    isToday: false,
    type: 'official',
    appliesTo: 'all',
    description: 'Milli bayram resmi tatili.',
  },
  {
    id: 'h-5',
    name: '1 Mayıs Emek ve Dayanışma Günü',
    dateStr: '01.05.2026',
    isToday: false,
    type: 'official',
    appliesTo: 'factory',
    description: 'İşçi bayramı resmi tatili.',
  },
  {
    id: 'h-6',
    name: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
    dateStr: '19.05.2026',
    isToday: false,
    type: 'official',
    appliesTo: 'all',
    description: 'Milli bayram resmi tatili.',
  },
  {
    id: 'h-7',
    name: '30 Ağustos Zafer Bayramı',
    dateStr: '30.08.2026',
    isToday: false,
    type: 'official',
    appliesTo: 'all',
    description: 'Milli bayram resmi tatili.',
  },
  {
    id: 'h-8',
    name: '1 Ocak Yılbaşı Tatili',
    dateStr: '01.01.2027',
    isToday: false,
    type: 'official',
    appliesTo: 'all',
  },
  {
    id: 'h-custom-1',
    name: 'Fabrika Yıllık Bakım & İdari İzin Günü',
    dateStr: '17.10.2026',
    isToday: false,
    type: 'custom',
    appliesTo: 'factory',
    description: 'Seçil Turizm & Arçelik ortak idari izin kararı.',
  },
];

