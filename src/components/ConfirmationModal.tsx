import React, { useState, useRef, useEffect } from 'react';
import { Factory } from '../types';
import { playSuccessBeep, triggerHaptic } from '../utils/audio';
import {
  MapPin,
  Clock,
  CheckCircle,
  Users,
  ShieldAlert,
  Navigation,
  ArrowRightLeft,
  X
} from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  factory: Factory;
  plate: string;
  driverName: string;
  isOffline: boolean;
  timeStr?: string;
  onConfirm: (type: 'tek' | 'cift', onBehalfOf: string) => void;
  onPostpone: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  factory,
  plate,
  driverName: _driverName,
  isOffline,
  timeStr,
  onConfirm,
  onPostpone,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('Kendi Hesabıma');
  const [showAccountSheet, setShowAccountSheet] = useState<boolean>(false);
  const [pendingType, setPendingType] = useState<'tek' | 'cift'>('tek');
  const [customPlateInput, setCustomPlateInput] = useState<string>('');
  const [confirmedType, setConfirmedType] = useState<'tek' | 'cift' | null>(null);
  const [pressingType, setPressingType] = useState<'tek' | 'cift' | null>(null);

  // Long press handling (1000ms: 1 - 1.5 seconds)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);
  const isPointerDownRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const startPress = (type: 'tek' | 'cift', pointerId?: number, target?: HTMLElement) => {
    isPointerDownRef.current = true;
    isLongPressRef.current = false;
    setPressingType(type);

    if (pointerId !== undefined && target?.setPointerCapture) {
      try {
        target.setPointerCapture(pointerId);
      } catch {
        // Ignore pointer capture errors
      }
    }

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // 1000ms (1 - 1.5 seconds per Requirement 3)
    longPressTimerRef.current = setTimeout(() => {
      if (isPointerDownRef.current) {
        isLongPressRef.current = true;
        setPressingType(null);
        triggerHaptic();
        setPendingType(type);
        setShowAccountSheet(true);
      }
    }, 1000);
  };

  const endPress = (type: 'tek' | 'cift') => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setPressingType(null);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If it was not a long-press (normal tap < 1000ms), execute direct confirm for own account
    if (!isLongPressRef.current) {
      handleDirectConfirm(type, 'Kendi Hesabıma');
    }
  };

  const cancelPress = () => {
    isPointerDownRef.current = false;
    setPressingType(null);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDirectConfirm = (type: 'tek' | 'cift', account: string) => {
    setConfirmedType(type);
    playSuccessBeep();
    triggerHaptic();

    setTimeout(() => {
      onConfirm(type, account);
      setConfirmedType(null);
      setShowAccountSheet(false);
    }, 320);
  };

  const handleConfirmFromSheet = () => {
    const finalAccount =
      selectedAccount === 'custom' && customPlateInput.trim()
        ? `${customPlateInput.toUpperCase()} (Yedek)`
        : selectedAccount;

    handleDirectConfirm(pendingType, finalAccount);
  };

  const accountOptions = [
    { id: 'Kendi Hesabıma', label: `Kendi Hesabıma (${plate})`, desc: 'Normal sefer' },
    { id: '26 S 1085 (Ali Yıldız Yerine)', label: '26 S 1085 (Ali Yıldız)', desc: 'Arkadaşının yerine sefer' },
    { id: '26 S 0412 (Hasan Çelik Yerine)', label: '26 S 0412 (Hasan Çelik)', desc: 'Yedek araç desteği' },
    { id: 'custom', label: 'Farklı Bir Araç / Şoför...', desc: 'Plaka elle gir' },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in slide-in-from-bottom duration-250 select-none">
      {/* Top Header Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                SEFERİ ONAYLA
              </span>
              <p className="text-[11px] text-slate-400">Otomatik Geofence Algılandı</p>
            </div>
          </div>
          <button
            onClick={onPostpone}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Kapat ve Bekleyenlere Al"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Factory Name & Gate Announcement (NO PRICE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400">Hedef Fabrika</span>
              <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                {factory.shortName}’e Geldin.
              </h2>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">
                Bu sefer TEK mi, ÇİFT mi?
              </p>
            </div>
            <div className="px-2.5 py-1 bg-sky-950/70 border border-sky-800/60 rounded-xl text-sky-300 font-mono text-[11px] font-bold">
              {plate}
            </div>
          </div>

          {/* Time & Gate only - GPS coordinates are recorded in background, NOT shown */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Nizamiye İndirme Noktası</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{timeStr || '16:45'} (Nizamiye Saati)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Massive Tactile Action Buttons (NO PRICE ON BUTTONS) */}
      <div className="my-auto py-3 space-y-3">
        {/* TEK SEFER BUTTON */}
        <div className="space-y-1">
          <button
            onPointerDown={(e) => {
              if (e.button !== 0 && e.pointerType === 'mouse') return;
              startPress('tek', e.pointerId, e.currentTarget);
            }}
            onPointerUp={() => endPress('tek')}
            onPointerCancel={cancelPress}
            onPointerLeave={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-full py-5 px-5 rounded-3xl font-extrabold text-left transition-all cursor-pointer flex items-center justify-between shadow-2xl relative overflow-hidden select-none touch-none ${
              confirmedType === 'tek'
                ? 'bg-emerald-400 text-slate-950 scale-102 ring-4 ring-emerald-300'
                : pressingType === 'tek'
                  ? 'bg-emerald-700 text-white scale-[0.98]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 active:scale-[0.98]'
            }`}
          >
            {/* Visual holding progress line */}
            {pressingType === 'tek' && (
              <div className="absolute bottom-0 left-0 h-1.5 bg-amber-400 w-full animate-[progress_1s_linear]" />
            )}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight block">TEK SEFER</span>
                {pressingType === 'tek' && (
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded animate-pulse">
                    Basılı tutuluyor...
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Dolu gidip boş dönme ya da boş gidip dolu dönme
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 relative z-10">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </button>
        </div>

        {/* ÇİFT SEFER BUTTON */}
        <div className="space-y-1">
          <button
            onPointerDown={(e) => {
              if (e.button !== 0 && e.pointerType === 'mouse') return;
              startPress('cift', e.pointerId, e.currentTarget);
            }}
            onPointerUp={() => endPress('cift')}
            onPointerCancel={cancelPress}
            onPointerLeave={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-full py-5 px-5 rounded-3xl font-extrabold text-left transition-all cursor-pointer flex items-center justify-between shadow-2xl relative overflow-hidden select-none touch-none ${
              confirmedType === 'cift'
                ? 'bg-sky-400 text-slate-950 scale-102 ring-4 ring-sky-300'
                : pressingType === 'cift'
                  ? 'bg-sky-700 text-white scale-[0.98]'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/60 active:scale-[0.98]'
            }`}
          >
            {/* Visual holding progress line */}
            {pressingType === 'cift' && (
              <div className="absolute bottom-0 left-0 h-1.5 bg-amber-400 w-full animate-[progress_1s_linear]" />
            )}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight block">ÇİFT SEFER</span>
                {pressingType === 'cift' && (
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded animate-pulse">
                    Basılı tutuluyor...
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-100 font-medium">
                Dolu gidip dolu dönme (Vardiya değişimi)
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 relative z-10">
              <ArrowRightLeft className="w-7 h-7 text-white" />
            </div>
          </button>
        </div>

        {/* Mandatory Hint Text under TEK/ÇİFT buttons */}
        <p className="text-center text-[11px] text-amber-400/90 font-medium pt-1">
          💡 Normal dokun: Kendi hesabına onaylar · Başkası adına için 1 sn basılı tut
        </p>
      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-2.5 pt-1">
        {/* Anti-maneuver protection notice */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Manevra koruması: 45 dk boyunca mükerrer bildirim gelmez</span>
          </div>
          {isOffline && (
            <span className="text-amber-400 font-semibold">Telefonda saklanacak</span>
          )}
        </div>

        {/* Cancel / Postpone Link */}
        <button
          onClick={onPostpone}
          className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
        >
          Şimdi Yanıtlama (Onay Bekleyenler Listesinde Tut)
        </button>
      </div>

      {/* Slide-up Bottom Sheet for "Bu Sefer Kimin Hesabına?" (Triggered by long press) */}
      {showAccountSheet && (
        <div className="absolute inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-end justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Bu Sefer Kimin Hesabına?</h3>
              </div>
              <button
                onClick={() => setShowAccountSheet(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Seçilen Sefer Türü: <strong className="text-white uppercase font-mono">{pendingType} SEFER</strong>
            </p>

            <div className="space-y-1.5">
              {accountOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAccount(opt.id)}
                  className={`w-full text-left p-2.5 rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    selectedAccount === opt.id
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{opt.label}</p>
                    <p className="text-[10px] text-slate-400">{opt.desc}</p>
                  </div>
                  {selectedAccount === opt.id && <CheckCircle className="w-4 h-4 text-amber-400" />}
                </button>
              ))}

              {selectedAccount === 'custom' && (
                <input
                  type="text"
                  placeholder="Plaka Girin (Örn: 26 S 3390)"
                  value={customPlateInput}
                  onChange={(e) => setCustomPlateInput(e.target.value)}
                  className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAccountSheet(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmFromSheet}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                Seferi Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
