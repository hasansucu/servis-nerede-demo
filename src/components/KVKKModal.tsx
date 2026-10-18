import React from 'react';
import { ShieldCheck, MapPin, Zap, CheckCircle2, Lock, X } from 'lucide-react';

interface KVKKModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const KVKKModal: React.FC<KVKKModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[92%] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Konum İzni & KVKK Bilgilendirmesi</h3>
              <p className="text-[11px] text-slate-400">Servis Takip Geofence Altyapısı</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-300">
          <div className="p-3 bg-sky-950/40 border border-sky-800/40 rounded-2xl flex items-start gap-3">
            <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sky-200 text-[12px] mb-1">
                Nizamiye Kapısında Otomatik Bildirim
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Servis aracınız fabrika girişindeki 100-150 metrelik coğrafi alana (Geofence) girdiğinde,
                direksiyondan ayrılmadan saniyeler içinde sefer onayı verebilmeniz için konum erişimi gereklidir.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300">
                <strong className="text-white">Pil Dostu Geofence:</strong> Sürekli GPS yerine fabrika kapısına yaklaşıldığında düşük güç tüketimli bölge sensörleri tetiklenir.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300">
                <strong className="text-white">Mükerrer Bildirim Engeli:</strong> Fabrika kapısında manevra yaparken aynı sefer için 45 dakika boyunca tekrar bildirim gelmez.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300">
                <strong className="text-white">Çevrimdışı Çalışma:</strong> İnternet çekmediği durumlarda onaylanan seferler cihazda şifreli saklanır ve hat gelince senkronize edilir.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300">
                <strong className="text-white">6698 Sayılı KVKK Güvencesi:</strong> Konum verileriniz sadece sefer doğrulama ve ay sonu hak ediş hesabında kullanılır, 3. şahıslarla paylaşılmaz.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-2">
          <button
            onClick={onAccept}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Konum İznini Onayla & Devam Et</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-[11px] text-slate-400 hover:text-slate-200 text-center font-medium"
          >
            Daha Sonra Hatırlat
          </button>
        </div>
      </div>
    </div>
  );
};
