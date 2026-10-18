import React, { useState } from 'react';
import { Factory, Trip } from '../../types';
import {
  Building2,
  Clock,
  CheckCircle2,
  Lock,
  Truck,
  FileSpreadsheet
} from 'lucide-react';

interface FactoryScreenProps {
  factories: Factory[];
  trips: Trip[];
}

export const FactoryScreen: React.FC<FactoryScreenProps> = ({ factories, trips }) => {
  // Requirement 4: Factory user CANNOT change factory; strictly locked to their own factory (Arçelik)
  const currentFactory = factories.find((f) => f.id === 'f1') || factories[0];
  const [selectedShift, setSelectedShift] = useState<string>('all');

  // Strictly filter only trips destined for THIS factory (Security & Privacy requirement)
  const factoryTrips = trips.filter((t) => t.factoryId === currentFactory.id && t.status === 'confirmed');
  const todayFactoryTrips = factoryTrips.filter((t) => t.dateStr === '17.10.2026' || t.dateStr === '15.10.2026');

  // October month summary for Seçil Turizm
  const octoberTrips = factoryTrips.filter((t) => t.dateStr.includes('.10.2026'));
  const tekCount = octoberTrips.filter((t) => t.type === 'tek').length;
  const ciftCount = octoberTrips.filter((t) => t.type === 'cift').length;

  const companySummary = [
    {
      companyName: 'Seçil Turizm',
      tekCount,
      ciftCount,
      totalCount: octoberTrips.length,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 pb-20">
      {/* Factory Portal Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm text-white">{currentFactory.shortName}</h1>
                <span className="text-[10px] bg-slate-800 text-sky-400 font-mono font-bold px-2 py-0.5 rounded-md border border-slate-700">
                  {currentFactory.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">İdari İşler & Nizamiye Giriş Portalı</p>
            </div>
          </div>

          {/* Locked single factory badge (Requirement 4: Fabrika kullanıcısı fabrika değiştiremez) */}
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-sky-400 font-bold flex items-center gap-1.5 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>{currentFactory.shortName}</span>
          </div>
        </div>

        {/* Strict Isolation Notice */}
        <div className="mt-3 p-2 bg-sky-950/40 border border-sky-800/40 rounded-xl flex items-center gap-2 text-[11px] text-sky-300">
          <Lock className="w-3.5 h-3.5 shrink-0 text-sky-400" />
          <span>
            Gizlilik İlkesi: Yalnızca <strong>{currentFactory.shortName}</strong> girişleri listelenir; diğer fabrikalar veya fiyatlar görülemez.
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 block font-medium">Bugün Gelen Servis</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              {todayFactoryTrips.length} Araç
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              Nizamiye Teyitli
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] text-slate-400 block font-medium">Ekim Ayı Toplamı</span>
            <span className="text-xl font-black text-sky-400 font-mono mt-0.5 block">
              {factoryTrips.length} Sefer
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {currentFactory.activeShifts.length} Aktif Vardiya
            </span>
          </div>
        </div>

        {/* Requirement 12: Ay Sonu Firma Bazında Döküm ("Bu ay Seçil Turizm: X tek, Y çift") */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 text-white">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm">Ay Sonu Firma Bazında Sefer Dökümü</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Ekim ayı boyunca {currentFactory.shortName} tesisine servis çeken firmaların tek ve çift sefer sayıları:
          </p>

          <div className="space-y-2 pt-1">
            {companySummary.map((item) => (
              <div
                key={item.companyName}
                className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{item.companyName}</span>
                  <span className="text-xs font-mono font-bold text-sky-400">{item.totalCount} Sefer</span>
                </div>
                {/* Specific format: "Bu ay Seçil Turizm: 40 tek, 30 çift" */}
                <p className="text-xs font-mono text-slate-300">
                  Bu ay {item.companyName}: <strong className="text-emerald-400">{item.tekCount} tek</strong>,{' '}
                  <strong className="text-sky-400">{item.ciftCount} çift</strong>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
          <button
            onClick={() => setSelectedShift('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap ${
              selectedShift === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-900 text-slate-400'
            }`}
          >
            Tüm Vardiyalar
          </button>
          {currentFactory.activeShifts.map((shift) => (
            <button
              key={shift}
              onClick={() => setSelectedShift(shift)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap ${
                selectedShift === shift
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400'
              }`}
            >
              {shift}
            </button>
          ))}
        </div>

        {/* Arriving Shuttles Today (No GPS coordinates, pure time and verification) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Bugün Giriş Yapan Servisler</span>
            <span className="font-mono">15.10.2026</span>
          </div>

          {todayFactoryTrips.length === 0 ? (
            <div className="p-6 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              Bu fabrika için bugün henüz giriş kaydı bulunmuyor.
            </div>
          ) : (
            todayFactoryTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                      <Truck className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                          {trip.plate}
                        </span>
                        <span className="px-2 py-0.5 bg-sky-950/80 text-sky-400 border border-sky-800/50 rounded-md text-[11px] font-bold">
                          {trip.type === 'cift' ? 'ÇİFT SEFER' : 'TEK SEFER'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Firma: <strong className="text-slate-200">Seçil Turizm</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {trip.timeStr}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Nizamiye Giriş
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
