import React, { useState } from 'react';
import { Company, Factory } from '../../types';
import { formatTL } from '../../utils/formatters';
import { GeofenceMap } from '../GeofenceMap';
import {
  ShieldCheck,
  Building2,
  Truck,
  FileText,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Compass,
  Lock,
  Unlock,
  Sliders
} from 'lucide-react';

interface AdminScreenProps {
  companies: Company[];
  factories: Factory[];
  totalTripsCount: number;
  totalVehiclesCount: number;
  onToggleCompanyStatus: (companyId: string) => void;
  onAddCompany: (newCompany: Omit<Company, 'id'>) => void;
  onUpdateFactoryRadius: (factoryId: string, radius: number) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  companies,
  factories,
  totalTripsCount,
  totalVehiclesCount,
  onToggleCompanyStatus,
  onAddCompany,
  onUpdateFactoryRadius,
}) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'subscriptions' | 'factories' | 'overview'>('overview');
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState(factories[0]?.id || 'f1');

  // New company form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCity, setNewCity] = useState('Eskişehir');
  const [newPhone, setNewPhone] = useState('0222 ');
  const [newVehicles, setNewVehicles] = useState(5);

  const selectedFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    onAddCompany({
      name: newCompanyName.trim(),
      city: newCity,
      phone: newPhone,
      status: 'active',
      monthlyFee: 4500,
      subscriptionStatus: 'trial',
      trialRemainingDays: 30,
      totalVehicles: Number(newVehicles) || 1,
      isMonthLocked: false,
    });
    setShowAddCompanyModal(false);
    setNewCompanyName('');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm text-white">Yönetici Paneli</h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Sistem Sahibi
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Servis Takip Merkezi Yönetim Portalı</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddCompanyModal(true)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Firma Ekle</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 mt-3 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Genel Durum
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'companies'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Firmalar ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'subscriptions'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Abonelik
          </button>
          <button
            onClick={() => setActiveTab('factories')}
            className={`py-1.5 font-semibold rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'factories'
                ? 'bg-slate-800 text-sky-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ortak Çember
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-3.5">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Toplam Kayıtlı Araç</span>
                <span className="text-2xl font-black text-white font-mono block">
                  {totalVehiclesCount} Plaka
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  3 Farklı Firmada Aktif
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Bu Ayki Toplam Sefer</span>
                <span className="text-2xl font-black text-amber-400 font-mono block">
                  {totalTripsCount} Sefer
                </span>
                <span className="text-[10px] text-slate-400 block">Ekim 2026 Dönemi</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Ortak Fabrika Geofence</span>
                <span className="text-xl font-bold text-sky-400 font-mono block">
                  {factories.length} Tesis
                </span>
                <span className="text-[10px] text-slate-400 block">Tüm firmalar ortak kullanır</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">Aylık Lisans Geliri</span>
                <span className="text-xl font-bold text-emerald-400 font-mono block">
                  {formatTL(companies.filter(c => c.status === 'active').length * 4500)}
                </span>
                <span className="text-[10px] text-slate-400 block">Platform abonelikleri</span>
              </div>
            </div>

            {/* Platform Information Card */}
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Ortak Altyapı ve Lisans Politikası</span>
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Her fabrika (Arçelik, Eti, Ford Otosan vb.) sistemde <strong>yalnızca bir defa</strong> eklenir ve nizamiye çemberi tek merkezden yönetilir. Tüm servis firmaları bu ortak çemberi kullanır ancak birbirlerinin fiyatlarını ve seferlerini asla göremez.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANIES */}
        {activeTab === 'companies' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Sistemdeki Servis Firmaları</span>
              <span>{companies.length} Firma</span>
            </div>

            {companies.map((comp) => (
              <div
                key={comp.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">{comp.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          comp.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {comp.status === 'active' ? 'Aktif' : 'Erişim Kilitli'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {comp.city} · {comp.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-xs block">
                      {comp.totalVehicles} Araç
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {formatTL(comp.monthlyFee)}/ay
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Abonelik: {comp.subscriptionStatus === 'trial' ? `1 Ay Deneme (${comp.trialRemainingDays} gün kaldı)` : comp.subscriptionStatus === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                  </span>
                  <button
                    onClick={() => onToggleCompanyStatus(comp.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      comp.status === 'active'
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {comp.status === 'active' ? 'Erişimi Kapat' : 'Erişimi Aç'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SUBSCRIPTIONS & TRIAL */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-xs space-y-1">
              <h4 className="font-bold text-emerald-300">Yeni Firmalar İçin 1 Ay Ücretsiz Deneme</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Her yeni eklenen servis firmasına 30 günlük tam yetkili ücretsiz deneme süresi atanır. Süre bitiminde aylık lisans ücreti devreye girer.
              </p>
            </div>

            <div className="space-y-2">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="font-mono font-bold text-emerald-400">{formatTL(c.monthlyFee)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Durum:</span>
                    <span className="font-bold text-slate-200">
                      {c.subscriptionStatus === 'trial'
                        ? `🎁 1 Ay Ücretsiz Deneme (Kalan: ${c.trialRemainingDays} Gün)`
                        : c.subscriptionStatus === 'paid'
                        ? '✅ Ekim 2026 Ödendi'
                        : '⚠️ Ödeme Bekleniyor'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COMMON FACTORY GEOFENCE MANAGEMENT */}
        {activeTab === 'factories' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Ortak Fabrika Listesi</span>
                <h3 className="text-sm font-extrabold text-white">Merkezi Geofence Çemberleri</h3>
              </div>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                Tüm Firmalar Ortak Kullanır
              </span>
            </div>

            {/* Factory Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
              {factories.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFactoryId(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                    selectedFactoryId === f.id
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300'
                  }`}
                >
                  {f.shortName} ({f.geofenceRadiusMeters}m)
                </button>
              ))}
            </div>

            {/* Interactive Vector Map for Geofence */}
            <GeofenceMap
              factory={selectedFactory}
              radiusMeters={selectedFactory.geofenceRadiusMeters}
              interactiveRadius={true}
              onRadiusChange={(r) => onUpdateFactoryRadius(selectedFactory.id, r)}
              plate="Ortak Kapı"
              heightClass="h-64"
            />

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{selectedFactory.name}</span>
                <span className="font-mono text-sky-400 font-bold text-xs">{selectedFactory.geofenceRadiusMeters}m</span>
              </div>
              <p className="text-slate-400 text-[11px]">{selectedFactory.address}</p>
              <p className="text-[10px] text-amber-400 pt-1 border-t border-slate-800">
                * Burada ayarlanan çember Seçil Turizm, Özlem Turizm vb. tüm firmaların servis araçları için geçerli tek resmi nizamiye alanıdır.
              </p>
            </div>
          </div>
        )}

        {/* Modal: Add New Company */}
        {showAddCompanyModal && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateCompany}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-2xl"
            >
              <h3 className="font-bold text-sm text-white">Yeni Servis Firması Tanımla</h3>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Firma Ticari Ünvanı</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Örn: Anadolu Turizm Taşımacılık"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Şehir</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Başlangıç Araç Sayısı</label>
                  <input
                    type="number"
                    value={newVehicles}
                    onChange={(e) => setNewVehicles(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Telefon / İletişim</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300">
                Otomatik olarak <strong>1 Ay Ücretsiz Deneme Süresi</strong> tanımlanacaktır.
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Firmayı Oluştur
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
