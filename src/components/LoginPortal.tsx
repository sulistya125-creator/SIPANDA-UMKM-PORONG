import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  Lock,
  LogIn,
  LogOut,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AuthUser, Village } from '../types/umkm';
import { authenticateByCredential } from '../data/rbacConfig';

interface LoginPortalProps {
  users: AuthUser[];
  villages: Village[];
  onLoginSuccess: (user: AuthUser, methodLabel: string) => void;
  onRegisterVillageOperator: (
    newUserPayload: Omit<AuthUser, 'id'>,
    autoLogin: boolean
  ) => { ok: boolean; message: string; user?: AuthUser };
  currentActiveUser: AuthUser | null;
  onCancelSwitch?: () => void;
  onLogout?: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  users,
  villages,
  onLoginSuccess,
  onRegisterVillageOperator,
  currentActiveUser,
  onCancelSwitch,
  onLogout,
}) => {
  const [selectedLoginUserId, setSelectedLoginUserId] = useState<string>(
    currentActiveUser?.id ?? users[0]?.id ?? ''
  );
  const [identifier, setIdentifier] = useState('superadmin@porong.sidoarjokab.go.id');
  const [password, setPassword] = useState('porong2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal Buat Akun Baru Operator Kelurahan/Desa
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regVillageId, setRegVillageId] = useState(villages[1]?.id ?? villages[0]?.id ?? 'v-kedungsolo');
  const [regPosition, setRegPosition] = useState('Operator Kelurahan/Desa');
  const [regEmail, setRegEmail] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAutoLogin, setRegAutoLogin] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    if (!users.some((u) => u.id === selectedLoginUserId) && users[0]) {
      setSelectedLoginUserId(users[0].id);
    }
  }, [users, selectedLoginUserId]);

  const selectedHeaderUser =
    users.find((u) => u.id === selectedLoginUserId) ?? users[0] ?? null;

  const superAdminUser = users.find((u) => u.role === 'superadmin');
  const internalRoles = users.filter((u) => u.role !== 'publik' && u.role !== 'superadmin');
  const publicRole = users.find((u) => u.role === 'publik');

  const handleHeaderUserChange = (userId: string) => {
    setSelectedLoginUserId(userId);
    setErrorMsg(null);
    const chosen = users.find((u) => u.id === userId);
    if (chosen && chosen.role !== 'publik') {
      setIdentifier(chosen.email || chosen.nip);
      setPassword(chosen.password || 'porong2026');
    }
  };

  const handleHeaderQuickLogin = () => {
    if (!selectedHeaderUser) return;
    onLoginSuccess(
      selectedHeaderUser,
      `Pilih Login Header (${selectedHeaderUser.roleLabel})`
    );
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    const matched = authenticateByCredential(users, identifier, password);
    if (!matched) {
      setErrorMsg(
        'NIP/Email atau kata sandi tidak sesuai. Gunakan akun demo resmi atau pilih akun di header / Login Cepat di bawah.'
      );
      return;
    }
    onLoginSuccess(matched, 'Login Kredensial NIP/Email');
  };

  const openRegisterModal = () => {
    const defaultVillage =
      villages.find((v) => v.id === 'v-kedungsolo') ?? villages[0];
    const slug = defaultVillage
      ? defaultVillage.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      : 'desa';
    setRegName('');
    setRegVillageId(defaultVillage?.id ?? 'v-kedungsolo');
    setRegPosition(
      defaultVillage
        ? `Operator Kelurahan/Desa (${defaultVillage.regionType} ${defaultVillage.name})`
        : 'Operator Kelurahan/Desa'
    );
    setRegEmail(`${slug}@porong.sidoarjokab.go.id`);
    setRegNip(`OPR-${defaultVillage?.code ?? '351504'}`);
    setRegPassword('');
    setRegConfirmPassword('');
    setRegAutoLogin(true);
    setRegError(null);
    setIsRegisterOpen(true);
  };

  const handleVillageSelectInRegister = (villageId: string) => {
    setRegVillageId(villageId);
    const v = villages.find((item) => item.id === villageId);
    if (v) {
      const slug = v.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      setRegPosition(`Operator Kelurahan/Desa (${v.regionType} ${v.name})`);
      setRegEmail(`${slug}@porong.sidoarjokab.go.id`);
      setRegNip(`OPR-${v.code}`);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regName.trim().length < 3) {
      setRegError('Nama lengkap operator minimal 3 karakter.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Masukkan alamat email resmi yang valid.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const village = villages.find((v) => v.id === regVillageId) ?? villages[0];
    const badgeLabel = village
      ? `${village.regionType} ${village.name}`
      : 'Operator Kelurahan/Desa';
    const unitLabel = village
      ? `Pemerintah ${village.regionType} ${village.name}`
      : 'Pemerintah Kelurahan/Desa';

    const result = onRegisterVillageOperator(
      {
        name: regName.trim(),
        position: regPosition.trim() || `Operator Kelurahan/Desa (${badgeLabel})`,
        unit: unitLabel,
        role: 'desa',
        roleLabel: 'Operator Kelurahan/Desa',
        badgeLabel,
        email: regEmail.trim(),
        nip: regNip.trim() || `OPR-${Date.now().toString().slice(-6)}`,
        password: regPassword,
        villageId: village?.id ?? regVillageId,
        accessSummary: `Input UMKM ${badgeLabel} & Daftar Bazar (No Self-Approve)`,
      },
      regAutoLogin
    );

    if (!result.ok) {
      setRegError(result.message);
      return;
    }

    setIsRegisterOpen(false);
    if (!regAutoLogin && result.user) {
      setSelectedLoginUserId(result.user.id);
      setIdentifier(result.user.email);
      setPassword(result.user.password);
      setSuccessMsg(
        `Akun Operator ${badgeLabel} (${result.user.name}) berhasil dibuat! Silakan login.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Header Halaman Portal Autentikasi */}
        <header className="bg-[#1E3A8A] text-white px-5 sm:px-7 py-4 border-b border-blue-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/20">
              <img
                src="/assets/aistudio/squareImage-1200x1200__1__7bf14be3.png"
                alt="Logo SIPANDA UMKM PORONG"
                className="w-full h-full object-contain scale-[1.26]"
              />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-amber-300 tracking-wide uppercase leading-tight">
                Pemkab Sidoarjo · Kecamatan Porong
              </div>
              <div className="text-sm font-bold tracking-tight text-white leading-tight mt-0.5">
                SIPANDA UMKM PORONG
              </div>
            </div>
          </div>

          {/* Kontrol Login Pilihan (Menjadi Siapa) + Logout di Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-700/80 rounded-lg p-1.5 flex-1 sm:flex-initial">
              <label
                htmlFor="portal-header-user-select"
                className="text-[11px] font-semibold text-amber-300 px-1.5 whitespace-nowrap"
              >
                Masuk Menjadi:
              </label>
              <select
                id="portal-header-user-select"
                value={selectedLoginUserId}
                onChange={(e) => handleHeaderUserChange(e.target.value)}
                className="bg-white text-slate-900 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] max-w-[230px] sm:max-w-[260px]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.roleLabel}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleHeaderQuickLogin}
                className="px-3 py-1.5 text-xs font-semibold text-blue-950 bg-[#F59E0B] hover:bg-amber-400 rounded-md transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openRegisterModal}
              className="px-3 py-2 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Buat Akun Kel./Desa</span>
            </button>

            {currentActiveUser && (
              <div className="flex items-center gap-2">
                {onCancelSwitch && (
                  <button
                    type="button"
                    onClick={onCancelSwitch}
                    className="px-3 py-2 text-xs font-semibold text-blue-100 bg-blue-900/80 hover:bg-blue-800 border border-blue-700 rounded-lg whitespace-nowrap"
                  >
                    Kembali ke Sesi
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-3 py-2 text-xs font-semibold text-white bg-[#EF4444] hover:bg-red-600 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Banner Utama Showcase Logo SIPANDA UMKM PORONG */}
        <section
          aria-label="Banner Identitas SIPANDA UMKM PORONG"
          className="bg-gradient-to-r from-slate-50 via-blue-50/80 to-amber-50/50 border-b border-slate-200 px-5 sm:px-8 py-5"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-white border border-slate-200 shadow-md p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src="/assets/aistudio/squareImage-1200x1200__1__7bf14be3.png"
                alt="Logo Resmi SIPANDA UMKM PORONG"
                className="w-full h-full object-contain scale-[1.12]"
              />
            </div>

            <div className="text-center sm:text-left space-y-2 min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 text-[11px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                Pemerintah Kabupaten Sidoarjo · Kecamatan Porong
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E3A8A]">
                  SIPANDA UMKM PORONG
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                  Sistem Informasi Pemasaran dan Pendampingan UMKM Kecamatan Porong
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Pusat Pemasaran, Pembinaan, dan Pengembangan UMKM terpadu untuk 13 Desa dan 6
                Kelurahan se-Kecamatan Porong.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 italic">
                &ldquo;Bersama Membangun UMKM yang Mandiri dan Berdaya Saing&rdquo;
              </div>
            </div>
          </div>
        </section>

        {/* Konten Split 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Panel Kiri: Informasi Sistem & Keamanan */}
          <section className="lg:col-span-5 bg-[#1E3A8A] text-white p-6 sm:p-8 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="space-y-2.5">
                <span className="inline-block px-2.5 py-1 text-[11px] font-semibold bg-blue-950/60 border border-blue-700/80 text-amber-300 rounded-md">
                  Seksi Perekonomian Kecamatan Porong
                </span>
                <h1 className="text-lg sm:text-xl font-bold leading-snug text-white">
                  Portal Autentikasi &amp; Hak Akses Sistem
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/95 leading-relaxed">
                  Pilih akun pada menu <strong>Masuk Menjadi</strong> di header atau masukkan
                  kredensial NIP/Email resmi untuk mengakses fitur pengelolaan sesuai peran RBAC.
                </p>
              </div>

              {currentActiveUser && (
                <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-700/80 space-y-2">
                  <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wide">
                    Sesi Saat Ini Aktif
                  </div>
                  <div className="text-xs font-bold text-white">{currentActiveUser.name}</div>
                  <div className="text-[11px] text-blue-200">
                    {currentActiveUser.roleLabel} · {currentActiveUser.position}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-blue-800/80 text-xs text-blue-100">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      Role-Based Access Control (Super Admin + 5 Tingkat Hak Akses)
                    </div>
                    <div className="text-blue-200/85">
                      Super Admin dapat menentukan matriks hak akses dan mengubah nama akun pengguna.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      Pencatatan Jejak Audit (Audit Log) Otomatis
                    </div>
                    <div className="text-blue-200/85">
                      Setiap sesi login, logout, perubahan nama/RBAC, kurasi, dan bazar tercatat
                      kronologis.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-blue-200 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      Proteksi Data Sensitif Omzet &amp; Catatan Kurasi
                    </div>
                    <div className="text-blue-200/85">
                      Informasi omzet usaha dan catatan internal hanya tampil pada mode pengelola.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-800/80 text-xs text-amber-300 font-medium">
              &ldquo;Bela Beli Produk Porong — UMKM Naik Kelas, Ekonomi Kecamatan Tumbuh.&rdquo;
            </div>
          </section>

          {/* Panel Kanan: Form Kredensial & Login Cepat RBAC */}
          <section className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-white">
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Masuk ke Sistem Internal
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gunakan kredensial NIP/Email resmi, pemilih akun di header, atau Login Cepat Demo
                    Role
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="px-3 py-1.5 text-xs font-semibold text-[#047857] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-auto"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Buat Akun Operator Kelurahan/Desa</span>
                </button>
              </div>

            {/* Form Kredensial */}
            <form onSubmit={handleCredentialSubmit} className="space-y-3.5">
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-[#047857] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#EF4444] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / Email Resmi *
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="superadmin@porong.sidoarjokab.go.id"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">
                  Sandi akun simulasi:{' '}
                  <code className="font-mono font-semibold text-slate-700">porong2026</code>
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>Masuk dengan Kredensial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Login Cepat Demo Role */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800">
                Login Cepat Demo Role (1-Klik Pengujian RBAC &amp; Super Admin)
              </h3>

              {/* Super Admin Highlight Card */}
              {superAdminUser && (
                <button
                  type="button"
                  onClick={() => onLoginSuccess(superAdminUser, 'Login Cepat Super Admin')}
                  className="w-full text-left p-3.5 rounded-xl border border-amber-300 bg-amber-50/75 hover:bg-amber-50 hover:border-[#F59E0B] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Shield className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-950">
                          {superAdminUser.roleLabel}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-amber-300 text-amber-900 rounded">
                          {superAdminUser.badgeLabel}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 mt-0.5">
                        {superAdminUser.name}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {superAdminUser.accessSummary}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 text-xs font-semibold text-blue-950 bg-[#F59E0B] rounded-lg whitespace-nowrap shrink-0 self-start sm:self-center">
                    Kelola RBAC &amp; Akun
                  </span>
                </button>
              )}

              {/* 4+ Internal PRD Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {internalRoles.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onLoginSuccess(user, 'Login Cepat Demo Role')}
                    className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-[#1E3A8A] transition-colors flex flex-col justify-between gap-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-xs font-bold text-[#1E3A8A] group-hover:underline">
                        {user.roleLabel}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 rounded shrink-0">
                        {user.badgeLabel}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate w-full">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-500 leading-snug">
                      {user.accessSummary}
                    </div>
                  </button>
                ))}
              </div>

              {/* Publik / Pembeli (Tanpa Login) */}
              {publicRole && (
                <button
                  type="button"
                  onClick={() => onLoginSuccess(publicRole, 'Akses Terbuka Publik')}
                  className="w-full text-left p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 hover:border-[#10B981] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Users className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#047857]">
                        {publicRole.roleLabel} (Tanpa Login)
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {publicRole.accessSummary}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 text-xs font-semibold text-white bg-[#10B981] rounded-lg whitespace-nowrap shrink-0 self-start sm:self-center inline-flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Mode Publik
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Seksi Perekonomian Kecamatan Porong
            </span>
            <span>PRD v2.0 · Super Admin &amp; RBAC</span>
          </div>
          </section>
        </div>
      </div>

      {/* Modal Buat Akun Baru Operator Kelurahan/Desa */}
      {isRegisterOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-desa-title"
        >
          <form
            onSubmit={handleRegisterSubmit}
            className="bg-white border border-slate-200 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div>
                <div className="text-[11px] font-semibold text-[#047857]">
                  Pendaftaran Akun Role Operator Kelurahan/Desa
                </div>
                <h3 id="register-desa-title" className="text-sm font-bold text-slate-900">
                  Buat Akun Baru Operator Kelurahan/Desa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                aria-label="Tutup pendaftaran akun desa"
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
              {regError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[#EF4444] font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Wilayah Desa / Kelurahan (19 Wilayah Porong) *
                </label>
                <select
                  value={regVillageId}
                  onChange={(e) => handleVillageSelectInRegister(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <optgroup label="13 Desa">
                    {villages
                      .filter((v) => v.regionType === 'Desa')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          Desa {v.name} (PIC: {v.picName})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="6 Kelurahan">
                    {villages
                      .filter((v) => v.regionType === 'Kelurahan')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          Kelurahan {v.name} (PIC: {v.picName})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap Operator *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan / Posisi *
                  </label>
                  <input
                    type="text"
                    required
                    value={regPosition}
                    onChange={(e) => setRegPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Login Resmi *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="desa@porong.sidoarjokab.go.id"
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIP / ID Operator Kelurahan/Desa
                  </label>
                  <input
                    type="text"
                    value={regNip}
                    onChange={(e) => setRegNip(e.target.value)}
                    placeholder="OPR-351504..."
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kata Sandi (min. 6 karakter) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ulangi Kata Sandi *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi"
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800">
                  Hak Akses Otomatis Akun Operator Kelurahan/Desa:
                </div>
                <p>
                  Menginput &amp; memperbarui UMKM binaan wilayah kelurahan/desa terpilih serta
                  mendaftarkan peserta bazar. Persetujuan tayang publik tetap dikurasi kecamatan (
                  <em>No Self-Approve</em>).
                </p>
                <label className="flex items-center gap-2 pt-1 font-semibold text-[#1E3A8A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regAutoLogin}
                    onChange={(e) => setRegAutoLogin(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#1E3A8A]"
                  />
                  <span>Langsung masuk ke sistem setelah akun dibuat</span>
                </label>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-lg inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftarkan Akun Operator Kelurahan/Desa</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
