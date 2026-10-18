import React, { useState } from 'react';
import { UserRole } from '../../types';
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
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: UserRole, username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('mehmet.demir');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRoleForForm, setSelectedRoleForForm] = useState<UserRole>('driver');

  const rolePresets: {
    role: UserRole;
    label: string;
    sub: string;
    username: string;
    icon: React.ReactNode;
    color: string;
    border: string;
  }[] = [
    {
      role: 'admin',
      label: 'Yönetici',
      sub: 'admin@servistakip.com',
      username: 'admin@servistakip.com',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />,
      color: 'bg-amber-500/10 text-amber-300',
      border: 'border-amber-500/30',
    },
    {
      role: 'company',
      label: 'Servis Firması',
      sub: 'secil@turizm.com',
      username: 'secil@turizm.com',
      icon: <Building2 className="w-3.5 h-3.5 text-sky-400" />,
      color: 'bg-sky-500/10 text-sky-300',
      border: 'border-sky-500/30',
    },
    {
      role: 'owner',
      label: 'Araç Sahibi / Patron',
      sub: 'ahmet.karaca@gmail.com',
      username: 'ahmet.karaca@gmail.com',
      icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'bg-emerald-500/10 text-emerald-300',
      border: 'border-emerald-500/30',
    },
    {
      role: 'driver',
      label: 'Şoför',
      sub: 'mehmet.demir',
      username: 'mehmet.demir',
      icon: <Truck className="w-3.5 h-3.5 text-amber-400" />,
      color: 'bg-amber-500/10 text-amber-300',
      border: 'border-amber-500/30',
    },
    {
      role: 'factory',
      label: 'Fabrika',
      sub: 'idari.isler@arcelik.com',
      username: 'idari.isler@arcelik.com',
      icon: <Building2 className="w-3.5 h-3.5 text-purple-400" />,
      color: 'bg-purple-500/10 text-purple-300',
      border: 'border-purple-500/30',
    },
    {
      role: 'worker',
      label: 'İşçi',
      sub: 'murat.celik@worker.com',
      username: 'murat.celik@worker.com',
      icon: <Briefcase className="w-3.5 h-3.5 text-cyan-400" />,
      color: 'bg-cyan-500/10 text-cyan-300',
      border: 'border-cyan-500/30',
    },
    {
      role: 'parent',
      label: 'Veli',
      sub: 'fatma.kaya@veli.com',
      username: 'fatma.kaya@veli.com',
      icon: <GraduationCap className="w-3.5 h-3.5 text-rose-400" />,
      color: 'bg-rose-500/10 text-rose-300',
      border: 'border-rose-500/30',
    },
  ];

  const handlePresetClick = (preset: typeof rolePresets[0]) => {
    setUsername(preset.username);
    setPassword('••••••••');
    setSelectedRoleForForm(preset.role);
    // Directly log in on tapping the demo role card
    onLogin(preset.role, preset.username);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRoleForForm, username);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-950 p-3 pt-2 pb-3 overflow-y-auto">
      <div className="space-y-2.5">
        {/* App Logo & Branding - Compact & Sleek */}
        <div className="flex items-center justify-center gap-2.5 pt-0.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/25 shrink-0 ring-2 ring-amber-500/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-none">SERVİS TAKİP</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Sefer Takip & Hak Ediş Yönetim Portalı
            </p>
          </div>
        </div>

        {/* Real Login Form (Kullanıcı Adı, Şifre, Giriş Yap Butonu) */}
        <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 space-y-2 shadow-lg">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
              Kullanıcı Adı / E-Posta
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kullanici.adi"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3 h-3 rounded border-slate-700 bg-slate-950 text-amber-500 accent-amber-500"
              />
              <span>Beni Hatırla</span>
            </label>
            <span className="text-amber-400 hover:text-amber-300 cursor-pointer">
              Şifremi Unuttum
            </span>
          </div>

          {/* Prominent Giriş Yap Button - Above the fold */}
          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>GİRİŞ YAP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Kullanıcılarla Dene Section (7 Roles) - Compact 2-column grid visible without scroll */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Demo kullanıcılarla dene (7 Rol)
            </span>
            <span className="text-[9px] text-slate-500">Tek dokunuşla giriş</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {rolePresets.map((preset, idx) => (
              <button
                key={preset.role}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`text-left p-1.5 px-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 hover:brightness-110 active:scale-[0.98] ${preset.color} ${preset.border} bg-slate-900/80 ${
                  idx === 6 ? 'col-span-2' : ''
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800">
                  {preset.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[11px] text-white leading-tight truncate">{preset.label}</h4>
                  <p className="text-[9px] text-slate-400 font-mono truncate">{preset.username}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-amber-400/60 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Confidentiality Footer */}
      <div className="pt-2 text-center border-t border-slate-900 mt-2">
        <p className="text-[9px] text-slate-500">
          Servis Takip Mobil Altyapısı · KVKK Uyumlu Güvenli Sistem
        </p>
      </div>
    </div>
  );
};
