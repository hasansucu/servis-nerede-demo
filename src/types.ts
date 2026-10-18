export type UserRole =
  | 'admin'    // 1. Yönetici (Sistem Sahibi)
  | 'company'  // 2. Servis Firması (Seçil Turizm)
  | 'owner'    // 3. Araç Sahibi / Patron (Ahmet Karaca)
  | 'driver'   // 4. Şoför (Mehmet Demir)
  | 'factory'  // 5. Fabrika (Arçelik İdari İşler)
  | 'worker'   // 6. İşçi (Fabrika Personeli)
  | 'parent';  // 7. Veli (Öğrenci Velisi)

export interface Company {
  id: string;
  name: string;
  city: string;
  phone: string;
  status: 'active' | 'suspended';
  monthlyFee: number;
  subscriptionStatus: 'paid' | 'unpaid' | 'trial';
  trialRemainingDays?: number;
  totalVehicles: number;
  isMonthLocked?: boolean; // Ay Kapanışı (Kilitli ise hiçbir sefer değiştirilemez)
}

export interface Factory {
  id: string;
  name: string;
  shortName: string;
  code: string;
  address: string;
  geofenceRadiusMeters: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  currentSinglePrice: number;
  currentDoublePrice: number;
  color: string;
  activeShifts: string[];
}

export interface PriceHistoryEntry {
  id: string;
  factoryId: string;
  factoryName: string;
  singlePrice: number;
  doublePrice: number;
  effectiveFrom: string; // Geçerlilik Başlangıç Tarihi
  changedBy: string;
  role: string;
  note?: string;
}

export interface TripCorrection {
  id: string;
  tripId: string;
  factoryName: string;
  plate: string;
  tripTime: string;
  tripDate: string;
  requestedBy: string;
  requestedAt: string;
  oldOnBehalfOf: string;
  newOnBehalfOf: string;
  status: 'pending_company_approval' | 'approved' | 'rejected';
  reason?: string;
}

export interface TypeCorrection {
  id: string;
  tripId: string;
  factoryName: string;
  plate: string;
  tripTime: string;
  requestedBy: string;
  fromType: 'tek' | 'cift';
  toType: 'tek' | 'cift';
  status: 'pending_company_approval' | 'approved' | 'rejected';
  reason?: string;
}

export interface Trip {
  id: string;
  factoryId: string;
  factoryName: string;
  plate: string;
  driverId: string;
  driverName: string;
  onBehalfOf?: string; // 'Kendi Hesabıma' or other driver/plate
  type: 'tek' | 'cift';
  status: 'confirmed' | 'pending';
  timestamp: string;
  timeStr: string;
  dateStr: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  priceApplied: number;
  synced: boolean;
  notes?: string;
  isManualEntry?: boolean; // Şoför elle eklediyse
  manualStatus?: 'pending_company_approval' | 'approved' | 'rejected';
  correctionStatus?: 'none' | 'pending_company_approval' | 'approved';
  typeCorrectionStatus?: 'none' | 'pending_company_approval' | 'approved';
}

export interface StudentLedgerItem {
  id: string;
  studentName: string;
  school: string;
  parentName: string;
  parentPhone: string;
  monthlyFee: number;
  status: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  lastPaymentDate?: string;
  notes?: string;
}

export interface VehicleDocuments {
  inspectionExpiry: string;          // Muayene Bitiş Tarihi
  trafficInsuranceExpiry: string;    // Zorunlu Trafik Sigortası Bitiş
  comprehensiveInsuranceExpiry: string; // Kasko Bitiş
  licenseRegistrationExpiry: string; // Ruhsat / Belediye İzin Belgesi
}

export interface DriverDocuments {
  licenseExpiry: string;    // Ehliyet
  srcExpiry: string;        // SRC Belgesi
  psychoTestExpiry: string; // Psikoteknik Raporu
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  assignedPlate: string;
  companyId: string;
  accessStatus: 'active' | 'suspended';
  documents: DriverDocuments;
}

export interface Vehicle {
  plate: string;
  model: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  assignedCompanyId: string;
  assignedCompanyName: string;
  ownerId: string; // 'owner-1' (Ahmet Karaca)
  assignedFactoryIds: string[]; // only trigger geofence if vehicle is assigned
  isOnline: boolean;
  currentRoute?: string;
  destination?: string;
  etaMinutes?: number;
  progressPercent?: number;
  isCompleted?: boolean;
  passengerPasscode: string; // 4 haneli güvenlik kodu (örn: "4819")
  dailyKm: number;
  weeklyKm: number;
  monthlyKm: number;
  isKmEstimated?: boolean; // Telefon kapalı günlerde "tahmini"
  status: 'active' | 'breakdown' | 'accident';
  backupPlate?: string; // Yedek araç atanmışsa
  backupDriverName?: string;
  delayMinutes?: number; // Gecikme duyurusu (5, 10, 15, 20 dk)
  documents: VehicleDocuments;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Announcement {
  id: string;
  fromCompany: string;
  target: 'all_drivers' | 'factory_passengers' | 'school_parents';
  targetDetail?: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface ParentChild {
  id: string;
  childName: string;
  schoolName: string;
  plate: string;
  passcode: string;
  morningPickupTime: string;
  afternoonDropoffTime: string;
  isBoardingToday: boolean; // Bugün binmeyecek düğmesi
  status: 'home' | 'on_the_way_school' | 'at_school' | 'on_the_way_home';
  parentAccessActive: boolean;
  driverPhone: string;
  driverName: string;
}

export interface WorkerProfile {
  name: string;
  plate: string;
  passcode: string;
  factoryName: string;
  serviceHour: string;
  pickupLocation: string;
  shiftRotation: string;
  currentShift: 'day' | 'evening' | 'night';
}

export interface CompanySettings {
  allowPassengerCallDriver: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  dateStr: string;
  isToday?: boolean;
  type?: 'official' | 'custom';
  appliesTo: 'all' | 'school' | 'factory';
  description?: string;
}

export interface BreakdownIncident {
  id: string;
  originalPlate: string;
  driverName: string;
  status: 'reported' | 'assigned' | 'resolved';
  backupPlate?: string;
  backupDriverName?: string;
  reportedAt: string;
  assignedAt?: string;
  notes?: string;
}

export interface AutoShiftConfig {
  week1Shift: 'day' | 'evening' | 'night'; // 1. Hafta (Örn: Gündüz 07:00)
  week2Shift: 'day' | 'evening' | 'night'; // 2. Hafta (Örn: Akşam 15:00)
  week3Shift: 'day' | 'evening' | 'night'; // 3. Hafta (Örn: Gece 23:00)
  offDay: 'Pazar' | 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi';
  todayOverride?: 'day' | 'evening' | 'night' | 'off' | string | null;
}

