import React, { useState } from 'react';
import {
  Check,
  Edit3,
  Lock,
  Plus,
  RotateCcw,
  Shield,
  Sliders,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import {
  AuthUser,
  MenuKey,
  RolePermissions,
  RolePermissionsMap,
  UserRole,
  Village,
} from '../types/umkm';

interface ManajemenAkunRbacProps {
  users: AuthUser[];
  currentUserId: string;
  villages: Village[];
  permissionsMap: RolePermissionsMap;
  onUpdateUser: (updatedUser: AuthUser) => void;
  onCreateUser: (newUser: Omit<AuthUser, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  onToggleRolePermission: (
    role: UserRole,
    key: keyof Omit<RolePermissions, 'allowedMenus' | 'scopedVillageId' | 'canManageRbac'>,
    value: boolean
  ) => void;
  onToggleRoleMenu: (role: UserRole, menu: MenuKey, enabled: boolean) => void;
  onResetPermissionsDefault: () => void;
}

const CONFIGURABLE_ROLES: { role: UserRole; label: string; subtitle: string }[] = [
  { role: 'admin', label: 'Admin Kecamatan', subtitle: 'Staf Ekonomi' },
  { role: 'kasi', label: 'Kasi Perekonomian', subtitle: 'Supervisor' },
  { role: 'camat', label: 'Pimpinan (Camat)', subtitle: 'Eksekutif' },
  { role: 'desa', label: 'Operator Kelurahan/Desa', subtitle: 'Wilayah Kel./Desa' },
  { role: 'publik', label: 'Publik / Pembeli', subtitle: 'Tanpa Login' },
];

const MENU_ROWS: { key: MenuKey; label: string }[] = [
  { key: 'dashboard', label: 'Menu: Dashboard Pimpinan' },
  { key: 'etalase', label: 'Menu: Katalog & Etalase Digital' },
  { key: 'direktori', label: 'Menu: Direktori & Kurasi UMKM' },
  { key: 'bazar', label: 'Menu: Bazar & Pelatihan' },
  { key: 'brief', label: 'Menu: Management Brief' },
  { key: 'cetak', label: 'Menu: Cetak Data (PDF)' },
  { key: 'audit', label: 'Menu: Jejak Audit (RBAC Log)' },
];

const ACTION_ROWS: {
  key: keyof Omit<RolePermissions, 'allowedMenus' | 'scopedVillageId' | 'canManageRbac'>;
  label: string;
  description: string;
}[] = [
  {
    key: 'canCreateUmkm',
    label: 'Tambah Data UMKM Baru',
    description: 'Mengajukan atau mendaftarkan profil pelaku usaha baru.',
  },
  {
    key: 'canEditUmkm',
    label: 'Edit Profil & Legalitas UMKM',
    description: 'Mengubah identitas usaha, harga, dan checklist NIB/Halal/P-IRT.',
  },
  {
    key: 'canDeleteUmkm',
    label: 'Hapus Permanen Data UMKM',
    description: 'Menghapus entri pelaku usaha dari direktori dan bazar.',
  },
  {
    key: 'canCurateUmkm',
    label: 'Kurasi Etalase (Approve / Revisi)',
    description: 'Menyetujui produk tayang publik atau meminta revisi foto/kemasan.',
  },
  {
    key: 'canCreateEvent',
    label: 'Buat Agenda Bazar / Pelatihan Baru',
    description: 'Memublikasikan jadwal kegiatan baru beserta kapasitas kuota.',
  },
  {
    key: 'canAllocateBooth',
    label: 'Alokasi Booth / Peserta Bazar',
    description: 'Mendaftarkan UMKM ke agenda bazar atau klinik perizinan.',
  },
  {
    key: 'canDeleteRegistration',
    label: 'Batalkan / Hapus Peserta Bazar',
    description: 'Mengeluarkan peserta terdaftar untuk membuka kembali slot kuota.',
  },
  {
    key: 'isReadOnlyBazar',
    label: 'Mode Pantau Bazar (Read-Only)',
    description: 'Menampilkan penanda pantau dan menyembunyikan form alokasi.',
  },
  {
    key: 'canViewSensitiveData',
    label: 'Akses Data Omzet & Catatan Kurasi',
    description: 'Melihat estimasi omzet bulanan dan catatan internal staf.',
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin Kecamatan',
  kasi: 'Kasi Perekonomian',
  camat: 'Pimpinan (Camat)',
  desa: 'Operator Kelurahan/Desa',
  publik: 'Publik / Pembeli',
};

export const ManajemenAkunRbac: React.FC<ManajemenAkunRbacProps> = ({
  users,
  currentUserId,
  villages,
  permissionsMap,
  onUpdateUser,
  onCreateUser,
  onDeleteUser,
  onToggleRolePermission,
  onToggleRoleMenu,
  onResetPermissionsDefault,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Form states for Edit / Add User
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formBadgeLabel, setFormBadgeLabel] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formPassword, setFormPassword] = useState('porong2026');
  const [formRole, setFormRole] = useState<UserRole>('desa');
  const [formVillageId, setFormVillageId] = useState<string>('v-candipari');
  const [formAccessSummary, setFormAccessSummary] = useState('');

  const openEditModal = (u: AuthUser) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormPosition(u.position);
    setFormUnit(u.unit);
    setFormBadgeLabel(u.badgeLabel);
    setFormEmail(u.email);
    setFormNip(u.nip);
    setFormPassword(u.password || 'porong2026');
    setFormRole(u.role);
    setFormVillageId(u.villageId ?? 'v-candipari');
    setFormAccessSummary(u.accessSummary);
    setIsAddUserOpen(false);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormPosition('Operator Kelurahan/Desa');
    setFormUnit('Pemerintah Desa/Kelurahan');
    setFormBadgeLabel('Desa Kedungsolo');
    setFormEmail('');
    setFormNip('');
    setFormPassword('porong2026');
    setFormRole('desa');
    setFormVillageId('v-kedungsolo');
    setFormAccessSummary('Input UMKM Desa & Daftar Bazar (No Self-Approve)');
    setIsAddUserOpen(true);
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    const roleLabel = ROLE_LABELS[formRole];

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: formName.trim(),
        position: formPosition.trim(),
        unit: formUnit.trim(),
        badgeLabel: formBadgeLabel.trim(),
        email: formEmail.trim(),
        nip: formNip.trim(),
        password: formPassword.trim() || editingUser.password,
        role: editingUser.role === 'superadmin' || editingUser.role === 'publik' ? editingUser.role : formRole,
        roleLabel:
          editingUser.role === 'superadmin' || editingUser.role === 'publik'
            ? editingUser.roleLabel
            : roleLabel,
        villageId: formRole === 'desa' ? formVillageId : undefined,
        accessSummary: formAccessSummary.trim() || editingUser.accessSummary,
      });
      setEditingUser(null);
    } else {
      onCreateUser({
        name: formName.trim(),
        position: formPosition.trim(),
        unit: formUnit.trim(),
        role: formRole,
        roleLabel,
        badgeLabel: formBadgeLabel.trim() || roleLabel,
        email: formEmail.trim(),
        nip: formNip.trim(),
        password: formPassword.trim() || 'porong2026',
        villageId: formRole === 'desa' ? formVillageId : undefined,
        accessSummary: formAccessSummary.trim() || 'Akun pengelola terverifikasi Super Admin',
      });
      setIsAddUserOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pusat Kendali Super Admin — Pengguna &amp; Hak Akses RBAC
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit nama pejabat/operator, tambah akun baru, dan tentukan matriks hak akses menu
              serta aksi operasional per peran secara real-time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Daftar Akun &amp; Edit Nama ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Atur Hak Akses RBAC
            </button>
          </div>
        </div>
      </section>

      {/* TAB 1: Daftar Akun & Edit Nama */}
      {activeTab === 'users' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Pengguna Terdaftar &amp; Penamaan Pejabat / Operator
              </h3>
              <p className="text-xs text-slate-500">
                Perubahan nama pada daftar ini langsung memperbarui tampilan Portal Login, Sesi
                Aktif, dan Jejak Audit.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Akun Pengguna
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">Nama Lengkap &amp; Jabatan</th>
                  <th className="py-3 px-3">Role RBAC</th>
                  <th className="py-3 px-3">NIP / Email Login</th>
                  <th className="py-3 px-3">Lingkup Wilayah / Ringkasan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => {
                  const isCurrent = u.id === currentUserId;
                  const isProtected = u.role === 'superadmin' || u.role === 'publik' || isCurrent;
                  const village = u.villageId
                    ? villages.find((v) => v.id === u.villageId)
                    : undefined;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200 rounded">
                              Sesi Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.position} · {u.unit}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded border ${
                            u.role === 'superadmin'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : u.role === 'admin'
                                ? 'bg-blue-50 text-[#1E3A8A] border-blue-200'
                                : u.role === 'publik'
                                  ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {u.role === 'superadmin' && <Shield className="w-3 h-3" />}
                          {u.roleLabel}
                        </span>
                        <div className="mt-0.5 text-[11px] text-slate-500">{u.badgeLabel}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                        {u.role === 'publik' ? (
                          <span className="text-slate-400">Tanpa Kredensial</span>
                        ) : (
                          <>
                            <div>{u.email || '-'}</div>
                            <div className="text-slate-400">NIP/ID: {u.nip || '-'}</div>
                          </>
                        )}
                      </td>

                      <td className="py-3 px-3 max-w-xs text-slate-600">
                        {village && (
                          <div className="font-semibold text-[#1E3A8A]">
                            {village.regionType} {village.name}
                          </div>
                        )}
                        <div className="text-[11px] truncate" title={u.accessSummary}>
                          {u.accessSummary}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit Nama &amp; Profil
                          </button>

                          {!isProtected ? (
                            <button
                              type="button"
                              onClick={() => onDeleteUser(u.id)}
                              title="Hapus akun pengguna"
                              className="p-1.5 text-slate-400 hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 text-slate-300"
                              title="Akun inti / sesi aktif tidak dapat dihapus"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: Matriks Pengaturan Hak Akses RBAC */}
      {activeTab === 'matrix' && (
        <div className="space-y-5">
          <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Matriks Penentuan Hak Akses Menu &amp; Aksi Operasional
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centang atau hapus centang izin di bawah untuk mengatur kewenangan tiap peran.
                Akun <strong>Super Admin</strong> selalu memiliki akses penuh (terkunci aman).
              </p>
            </div>
            <button
              type="button"
              onClick={onResetPermissionsDefault}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Pulihkan Default PRD
            </button>
          </section>

          {/* Tabel 1: Hak Akses Menu Navigasi */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#1E3A8A]">
                1. Pengaturan Akses Halaman / Menu Sidebar
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-600 bg-white">
                    <th className="py-3 px-4">Halaman / Modul Sistem</th>
                    <th className="py-3 px-3 text-center text-amber-800">Super Admin</th>
                    {CONFIGURABLE_ROLES.map((r) => (
                      <th key={r.role} className="py-3 px-3 text-center whitespace-nowrap">
                        <div>{r.label}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.subtitle}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {MENU_ROWS.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.label}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-50 text-amber-800 border border-amber-200"
                          title="Super Admin selalu memiliki akses"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </td>
                      {CONFIGURABLE_ROLES.map((r) => {
                        const checked = permissionsMap[r.role].allowedMenus.includes(row.key);
                        const isEtalaseLocked = row.key === 'etalase' && r.role === 'publik';
                        return (
                          <td key={r.role} className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isEtalaseLocked}
                              aria-label={`${row.label} untuk ${r.label}`}
                              onChange={(e) =>
                                onToggleRoleMenu(r.role, row.key, e.target.checked)
                              }
                              className="w-4 h-4 rounded accent-[#1E3A8A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tabel 2: Hak Aksi Operasional & Privasi */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[#1E3A8A]">
                2. Pengaturan Hak Aksi CRUD, Kurasi, Bazar &amp; Privasi Data
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-600 bg-white">
                    <th className="py-3 px-4">Kewenangan Aksi / Fitur</th>
                    <th className="py-3 px-3 text-center text-amber-800">Super Admin</th>
                    {CONFIGURABLE_ROLES.map((r) => (
                      <th key={r.role} className="py-3 px-3 text-center whitespace-nowrap">
                        <div>{r.label}</div>
                        <div className="text-[10px] font-normal text-slate-400">{r.subtitle}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {ACTION_ROWS.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{row.label}</div>
                        <div className="text-[11px] text-slate-500">{row.description}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-50 text-amber-800 border border-amber-200"
                          title="Hak penuh Super Admin"
                        >
                          {row.key === 'isReadOnlyBazar' ? (
                            <span className="text-[10px] font-bold">—</span>
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </td>
                      {CONFIGURABLE_ROLES.map((r) => {
                        const checked = Boolean(permissionsMap[r.role][row.key]);
                        return (
                          <td key={r.role} className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              aria-label={`${row.label} untuk ${r.label}`}
                              onChange={(e) =>
                                onToggleRolePermission(r.role, row.key, e.target.checked)
                              }
                              className="w-4 h-4 rounded accent-[#1E3A8A] cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Modal Edit Nama / Tambah Akun */}
      {(editingUser || isAddUserOpen) && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveUserForm}
            className="bg-white border border-slate-200 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#1E3A8A]">
                  Manajemen Identitas Pengguna (Super Admin)
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingUser ? `Edit Nama & Profil: ${editingUser.name}` : 'Tambah Akun Pengguna Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setIsAddUserOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Drs. H. Ahmad Fauzan, M.Si"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan / Posisi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit / Instansi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role RBAC *
                  </label>
                  <select
                    value={formRole}
                    disabled={
                      editingUser?.role === 'superadmin' || editingUser?.role === 'publik'
                    }
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white disabled:bg-slate-100"
                  >
                    {editingUser?.role === 'superadmin' && (
                      <option value="superadmin">Super Admin</option>
                    )}
                    <option value="admin">Admin Kecamatan</option>
                    <option value="kasi">Kasi Perekonomian</option>
                    <option value="camat">Pimpinan (Camat)</option>
                    <option value="desa">Operator Kelurahan/Desa</option>
                    {editingUser?.role === 'publik' && (
                      <option value="publik">Publik / Pembeli</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Label Lencana Ringkas *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBadgeLabel}
                    onChange={(e) => setFormBadgeLabel(e.target.value)}
                    placeholder="Contoh: Desa Kedungsolo / Full Access"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {formRole === 'desa' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lingkup Wilayah (Desa / Kelurahan) *
                  </label>
                  <select
                    value={formVillageId}
                    onChange={(e) => setFormVillageId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.regionType} {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formRole !== 'publik' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Login Resmi
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="nama@porong.sidoarjokab.go.id"
                      className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NIP / ID Pegawai
                    </label>
                    <input
                      type="text"
                      value={formNip}
                      onChange={(e) => setFormNip(e.target.value)}
                      className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kata Sandi Akun
                    </label>
                    <input
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ringkasan Kewenangan (Tampil di Portal Login)
                </label>
                <input
                  type="text"
                  value={formAccessSummary}
                  onChange={(e) => setFormAccessSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setIsAddUserOpen(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg"
              >
                {editingUser ? 'Simpan Perubahan Nama & Profil' : 'Buat Akun Pengguna'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
