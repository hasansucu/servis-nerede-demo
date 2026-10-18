import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  Truck,
  Building2,
  DollarSign,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSelectRole }) => {
  const [username, setUsername] = useState('mehmet.demir');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const roleDemos: {
    role: UserRole;
    name: string;
    sub: string;
    user: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      role: 'admin',
      name: 'Yönetici (Sistem Sahibi)',
      sub: 'Tüm firmalar, lisanslar, ortak geofence',
      user: 'admin@servistakip.com',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10',
    },
    {
      role: 'company',
      name: 'Servis Firması (Seçil Turizm)',
      sub: 'Tüm filo, fiyatlar, onaylar, ay kapanışı',
      user: 'secil@turizm.com',
      icon: <Building2 className="w-4 h-4 text-sky-400" />,
      color: 'border-sky-500/40 bg-sky-500/10',
    },
    {
      role: 'owner',
      name: 'Araç Sahibi / Patron (Ahmet Karaca)',
      sub: '2 araç, km takibi, evraklar, şoför atama',
      user: 'ahmet.karaca@gmail.com',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-500/10',
    },
    {
      role: 'driver',
      name: 'Şoför (Mehmet Demir - 26 S 2244)',
      sub: 'Büyük TEK/ÇİFT, elle sefer, gecikme butonu',
      user: 'mehmet.demir',
      icon: <Truck className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10',
    },
    {
      role: 'factory',
      name: 'Fabrika (Arçelik İdari İşler)',
      sub: 'Yalnızca Arçelik vardiya girişleri',
      user: 'idari.isler@arcelik.com',
      icon: <Building2 className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-500/10',
    },
    {
      role: 'worker',
      name: 'İşçi (Murat Çelik - Arçelik)',
      sub: '4 haneli kod, vardiya rotasyonu, servis 5 dk',
      user: 'murat.celik@worker.com',
      icon: <Briefcase className="w-4 h-4 text-sky-400" />,
      color: 'border-sky-500/40 bg-sky-500/10',
    },
    {
      role: 'parent',
      name: 'Veli (Fatma Kaya - Öğrenci)',
      sub: 'Çocuk kartları, "Bugün binmeyecek" butonu',
      user: 'fatma.kaya@veli.com',
      icon: <GraduationCap className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-500/10',
    },
  ];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectRole('driver');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black mx-auto shadow-lg shadow-amber-500/25">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white">Servis Takip Giriş Ekranı</h2>
          <p className="text-xs text-slate-400">
            Personel & Öğrenci Servisi Sefer ve Hak Ediş Portalı
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-amber-400 block px-1">
            ⚡ Demo İçin Rol Seçin (7 Rol Hazır):
          </span>

          <div className="space-y-1.5">
            {roleDemos.map((demo) => (
              <button
                key={demo.role}
                onClick={() => {
                  onSelectRole(demo.role);
                  onClose();
                }}
                className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between hover:scale-[1.01] ${demo.color}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                    {demo.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{demo.name}</h4>
                    <p className="text-[10px] text-slate-400">{demo.sub}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Traditional login form */}
        <div className="pt-2 border-t border-slate-800">
          <form onSubmit={handleCustomLogin} className="space-y-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Kullanıcı Adı veya E-Posta</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
                />
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Şifre</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-amber-500 rounded"
                />
                <span>Beni Hatırla</span>
              </label>
              <span className="text-[11px] text-amber-400 hover:underline cursor-pointer">Şifremi Unuttum</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
