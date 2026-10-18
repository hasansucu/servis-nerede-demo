import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Bell,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Truck,
  Building2,
  DollarSign,
  ChevronDown,
  Briefcase,
  GraduationCap,
  LogIn,
  Sparkles,
  X
} from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onTriggerGeofence: (scenario: 'stopped' | 'transit' | 'exited') => void;
  onOpenKVKK: () => void;
  pendingTripsCount: number;
  onOpenLoginModal?: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  activeRole,
  onSelectRole,
  isOffline,
  onToggleOffline,
  onTriggerGeofence,
  onOpenKVKK,
  pendingTripsCount,
  onOpenLoginModal,
}) => {
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'android' | 'fullscreen'>('iphone');
  const [showGeofenceMenu, setShowGeofenceMenu] = useState<boolean>(false);
  const [showMobileDemoModal, setShowMobileDemoModal] = useState<boolean>(false);
  const [currentTime] = useState('16:45');

  // Detect mobile phone screen width (< 768px)
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Requirement B: All 7 Roles
  const roleLabels: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'admin', label: 'Yönetici', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'company', label: 'Firma', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'owner', label: 'Araç Sahibi', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'driver', label: 'Şoför', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'factory', label: 'Fabrika', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'worker', label: 'İşçi', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'parent', label: 'Veli', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen h-screen md:h-auto w-full bg-slate-950 text-slate-100 flex flex-col md:items-center md:justify-start p-0 md:py-3 md:px-4 overflow-hidden md:overflow-visible relative">
      {/* 1. Desktop & Tablet Top Testing Control Toolbar (Hidden on Phone) */}
      <header className="hidden md:flex w-full max-w-5xl mb-3 flex-wrap items-center justify-between gap-2.5 p-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-xs">
        {/* Role Selector */}
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-0.5">
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer mr-1 whitespace-nowrap shadow-sm"
            title="Giriş Ekranı ve Rol Değiştirme Aç"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span>Rol Değiştir</span>
          </button>

          <span className="text-slate-400 font-medium text-[11px] mr-1 hidden sm:inline">Rol:</span>
          {roleLabels.map((r) => {
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
                {r.id === 'driver' && pendingTripsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Testing Tools */}
        <div className="flex items-center gap-1.5 ml-auto relative">
          {/* Geofence Scenario Dropdown Button (Red Button) */}
          <div className="relative">
            <button
              onClick={() => setShowGeofenceMenu(!showGeofenceMenu)}
              title="Geofence senaryolarını test et"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-sm shadow-rose-900/30 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>Geofence Senaryosu</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showGeofenceMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-60 space-y-1 text-xs animate-in fade-in">
                <button
                  onClick={() => {
                    onTriggerGeofence('stopped');
                    setShowGeofenceMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-slate-200 cursor-pointer flex flex-col"
                >
                  <span className="font-bold text-emerald-400">✅ Nizamiyede Durdu (&lt;10 km/s)</span>
                  <span className="text-[10px] text-slate-400">Doğru bildirim düşer ve onay bekler</span>
                </button>
                <button
                  onClick={() => {
                    onTriggerGeofence('transit');
                    setShowGeofenceMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-slate-200 cursor-pointer flex flex-col"
                >
                  <span className="font-bold text-amber-400">🚗 Ana Yoldan Transit Geçiş</span>
                  <span className="text-[10px] text-slate-400">Hızlı geçtiği için bildirim engellenir</span>
                </button>
                <button
                  onClick={() => {
                    onTriggerGeofence('exited');
                    setShowGeofenceMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-slate-200 cursor-pointer flex flex-col"
                >
                  <span className="font-bold text-rose-400">🚪 Onaylamadan Bölgeden Çıktı</span>
                  <span className="text-[10px] text-slate-400">Bildirim kendiliğinden silinir</span>
                </button>
              </div>
            )}
          </div>

          {/* Offline/Online Toggle */}
          <button
            onClick={onToggleOffline}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              isOffline
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'İnternet Yok (Kuyrukta)' : 'Çevrimiçi'}</span>
          </button>

          {/* KVKK Information */}
          <button
            onClick={onOpenKVKK}
            title="Konum ve KVKK Bilgilendirmesi"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">KVKK</span>
          </button>

          {/* Frame Style Toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setDeviceModel('iphone')}
              title="iPhone 16 Pro Çerçevesi"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${deviceModel === 'iphone' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceModel(deviceModel === 'fullscreen' ? 'iphone' : 'fullscreen')}
              title={deviceModel === 'fullscreen' ? 'Telefon Çerçevesine Geç' : 'Tam Ekran Dikey Mod'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${deviceModel === 'fullscreen' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
            >
              {deviceModel === 'fullscreen' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Mobile Floating "Demo" Button (Right-Top Corner - Hidden on Desktop) */}
      <div className="md:hidden fixed top-2.5 right-2.5 z-50">
        <button
          onClick={() => setShowMobileDemoModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-lg shadow-black/50 text-xs font-bold cursor-pointer active:scale-95 transition-all"
          title="Demo ve Rol Seçimi"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo</span>
        </button>
      </div>

      {/* 3. Mobile Demo & Rol Seçenekleri Modalı */}
      {showMobileDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Demo ve Rol Seçimi</h3>
                  <p className="text-[10px] text-slate-400">Test araçları ve hızlı rol değişimi</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileDemoModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rol Seçimi (7 Rol) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">Rol Değiştir (7 Rol)</span>
                {onOpenLoginModal && (
                  <button
                    onClick={() => {
                      setShowMobileDemoModal(false);
                      onOpenLoginModal();
                    }}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <LogIn className="w-3 h-3" />
                    Giriş Ekranına Git
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {roleLabels.map((r) => {
                  const isActive = activeRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectRole(r.id);
                        setShowMobileDemoModal(false);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <div className={`p-1 rounded-lg ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-amber-400'}`}>
                        {r.icon}
                      </div>
                      <span className="text-xs font-semibold">{r.label}</span>
                      {r.id === 'driver' && pendingTripsCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-500 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Geofence Test Senaryoları (Kırmızı Düğme) */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                Geofence Test Senaryoları
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    onTriggerGeofence('stopped');
                    setShowMobileDemoModal(false);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-emerald-400">✅ Nizamiyede Durdu (&lt;10 km/s)</div>
                    <div className="text-[10px] text-slate-400">Doğru bildirim düşer ve onay bekler</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onTriggerGeofence('transit');
                    setShowMobileDemoModal(false);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400">🚗 Ana Yoldan Transit Geçiş</div>
                    <div className="text-[10px] text-slate-400">Hızlı geçtiği için bildirim engellenir</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onTriggerGeofence('exited');
                    setShowMobileDemoModal(false);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-rose-400">🚪 Onaylamadan Bölgeden Çıktı</div>
                    <div className="text-[10px] text-slate-400">Bildirim kendiliğinden silinir</div>
                  </div>
                </button>
              </div>
            </div>

            {/* İnternet Simülasyonu & KVKK */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => {
                  onToggleOffline();
                  setShowMobileDemoModal(false);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold ${
                  isOffline
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                }`}
              >
                {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                <span>{isOffline ? 'İnternet Yok (Kuyruk)' : 'Çevrimiçi'}</span>
              </button>
              <button
                onClick={() => {
                  setShowMobileDemoModal(false);
                  onOpenKVKK();
                }}
                className="px-3 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>KVKK</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Viewport: Fullscreen on mobile, Phone Mockup on desktop/tablet */}
      <div className="w-full flex-1 flex justify-center items-stretch md:items-center overflow-hidden">
        <div
          className={`relative transition-all duration-300 flex flex-col overflow-hidden w-full h-full ${
            isMobileScreen
              ? 'min-h-screen rounded-none p-0 bg-slate-950 border-0 shadow-none'
              : deviceModel === 'fullscreen'
                ? 'md:max-w-[430px] md:h-[92vh] md:rounded-3xl md:border md:border-slate-800 md:shadow-2xl md:bg-slate-900'
                : 'md:w-[410px] md:h-[860px] md:rounded-[52px] md:p-3.5 md:bg-gradient-to-b md:from-slate-700 md:via-slate-800 md:to-slate-900 md:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_12px_#1e293b,0_0_0_14px_#334155]'
          }`}
        >
          {/* Inner Phone Screen (no border or radius on mobile phone) */}
          <div
            className={`relative w-full h-full bg-slate-900 text-slate-100 flex flex-col ${
              isMobileScreen
                ? 'rounded-none border-0 shadow-none'
                : 'md:rounded-[38px] md:border md:border-slate-800/80 md:shadow-inner md:overflow-hidden'
            }`}
          >
            {/* Top Phone Status Bar: Hidden on real mobile phones, shown only on desktop/tablet */}
            <div className="hidden md:flex h-11 w-full items-center justify-between px-6 pt-2 shrink-0 z-50 bg-slate-900/90 backdrop-blur-md select-none text-[12px] font-semibold tracking-tight text-slate-200">
              <span>{currentTime}</span>

              {/* Center Dynamic Island / Notch */}
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <div className="w-2 h-2 rounded-full bg-sky-950 border border-sky-800/40" />
              </div>

              {/* Right Network & Battery */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-[10px] font-bold text-slate-400">5G</span>
                {isOffline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-slate-200" />
                )}
                <div className="w-5 h-2.5 border border-slate-300 rounded-sm p-0.5 flex items-center">
                  <div className={`h-full rounded-2xs ${isOffline ? 'w-2 bg-amber-400' : 'w-3.5 bg-emerald-400'}`} />
                </div>
              </div>
            </div>

            {/* Offline Alert Strip if Offline */}
            {isOffline && (
              <div className="bg-amber-500 text-slate-950 px-3 py-1 text-[11px] font-bold flex items-center justify-between z-40 shrink-0">
                <div className="flex items-center gap-1.5">
                  <WifiOff className="w-3 h-3" />
                  <span>Çevrimdışı Modu: Seferler telefonda saklanır</span>
                </div>
                <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded">Yerel Kayıt</span>
              </div>
            )}

            {/* Application Dynamic Content Screen Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar relative bg-slate-950 flex flex-col">
              {children}
            </div>

            {/* Bottom iOS Home Indicator Bar: Hidden on real mobile phones, shown only on desktop */}
            <div className="hidden md:flex h-5 w-full bg-slate-950 items-center justify-center shrink-0 z-50">
              <div className="w-32 h-1 bg-slate-600/70 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
