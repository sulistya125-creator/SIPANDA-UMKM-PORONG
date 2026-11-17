import {
  AuthUser,
  MenuKey,
  RolePermissions,
  RolePermissionsMap,
  UserRole,
} from '../types/umkm';

export const INITIAL_USERS: AuthUser[] = [
  {
    id: 'usr-superadmin',
    name: 'Administrator Utama Porong',
    position: 'Super Admin Sistem & Tata Kelola RBAC',
    unit: 'Kecamatan Porong',
    role: 'superadmin',
    roleLabel: 'Super Admin',
    badgeLabel: 'Root RBAC',
    email: 'superadmin@porong.sidoarjokab.go.id',
    nip: 'SUPER-PORONG-01',
    password: 'porong2026',
    accessSummary: 'Kelola Pengguna, Edit Nama & Atur Matriks Hak Akses RBAC',
  },
  {
    id: 'usr-admin',
    name: 'Imambang Eka Sulistya, SE',
    position: 'Staf Seksi Perekonomian',
    unit: 'Kecamatan Porong',
    role: 'admin',
    roleLabel: 'Admin Kecamatan',
    badgeLabel: 'Full Access',
    email: 'admin@porong.sidoarjokab.go.id',
    nip: '199104122020121004',
    password: 'porong2026',
    accessSummary: 'Staf Ekonomi · Kurasi, CRUD, Bazar, Brief & Audit',
  },
  {
    id: 'usr-kasi',
    name: 'Dra. Hj. Nurul Hidayati, M.Si',
    position: 'Kepala Seksi Perekonomian',
    unit: 'Kecamatan Porong',
    role: 'kasi',
    roleLabel: 'Kasi Perekonomian',
    badgeLabel: 'Supervisor',
    email: 'kasi.ekonomi@porong.sidoarjokab.go.id',
    nip: '197808172005012008',
    password: 'porong2026',
    accessSummary: 'Approve Kurasi, Monitoring & Brief (No Delete)',
  },
  {
    id: 'usr-camat',
    name: 'Choirul Anam, S.STP, M.HP',
    position: 'Camat Porong',
    unit: 'Pimpinan Kecamatan Porong',
    role: 'camat',
    roleLabel: 'Pimpinan (Camat)',
    badgeLabel: 'Eksekutif',
    email: 'camat@porong.sidoarjokab.go.id',
    nip: '198005202001121002',
    password: 'porong2026',
    accessSummary: 'Dashboard KPI, AI Insight & Cetak Brief (Read-Only)',
  },
  {
    id: 'usr-desa-candipari',
    name: 'Siti Aminah',
    position: 'Operator Kelurahan/Desa (Desa Candipari)',
    unit: 'Pemerintah Desa Candipari',
    role: 'desa',
    roleLabel: 'Operator Kelurahan/Desa',
    badgeLabel: 'Desa Candipari',
    email: 'candipari@porong.sidoarjokab.go.id',
    nip: 'OPR-3515042001',
    password: 'porong2026',
    villageId: 'v-candipari',
    accessSummary: 'Input UMKM Desa & Daftar Bazar (No Self-Approve)',
  },
  {
    id: 'usr-publik',
    name: 'Pengunjung Umum / Pembeli',
    position: 'Akses Masyarakat Terbuka',
    unit: 'Etalase Digital Publik',
    role: 'publik',
    roleLabel: 'Publik / Pembeli',
    badgeLabel: 'Tanpa Login',
    email: '',
    nip: '',
    password: '',
    accessSummary: 'Etalase Digital Produk Unggulan & WhatsApp Penjual (Data sensitif tersembunyi)',
  },
];

export const INITIAL_ROLE_PERMISSIONS: RolePermissionsMap = {
  superadmin: {
    allowedMenus: ['rbac', 'dashboard', 'etalase', 'direktori', 'bazar', 'brief', 'cetak', 'audit'],
    canCreateUmkm: true,
    canEditUmkm: true,
    canDeleteUmkm: true,
    canCurateUmkm: true,
    canCreateEvent: true,
    canAllocateBooth: true,
    canDeleteRegistration: true,
    canViewSensitiveData: true,
    canViewBrief: true,
    canViewAuditLog: true,
    canManageRbac: true,
    isReadOnlyBazar: false,
  },
  admin: {
    allowedMenus: ['dashboard', 'etalase', 'direktori', 'bazar', 'brief', 'cetak', 'audit'],
    canCreateUmkm: true,
    canEditUmkm: true,
    canDeleteUmkm: true,
    canCurateUmkm: true,
    canCreateEvent: true,
    canAllocateBooth: true,
    canDeleteRegistration: true,
    canViewSensitiveData: true,
    canViewBrief: true,
    canViewAuditLog: true,
    canManageRbac: false,
    isReadOnlyBazar: false,
  },
  kasi: {
    allowedMenus: ['dashboard', 'etalase', 'direktori', 'bazar', 'brief', 'cetak', 'audit'],
    canCreateUmkm: true,
    canEditUmkm: true,
    canDeleteUmkm: false,
    canCurateUmkm: true,
    canCreateEvent: false,
    canAllocateBooth: true,
    canDeleteRegistration: false,
    canViewSensitiveData: true,
    canViewBrief: true,
    canViewAuditLog: true,
    canManageRbac: false,
    isReadOnlyBazar: false,
  },
  camat: {
    allowedMenus: ['dashboard', 'etalase', 'bazar', 'brief', 'cetak'],
    canCreateUmkm: false,
    canEditUmkm: false,
    canDeleteUmkm: false,
    canCurateUmkm: false,
    canCreateEvent: false,
    canAllocateBooth: false,
    canDeleteRegistration: false,
    canViewSensitiveData: true,
    canViewBrief: true,
    canViewAuditLog: false,
    canManageRbac: false,
    isReadOnlyBazar: true,
  },
  desa: {
    allowedMenus: ['etalase', 'direktori', 'bazar', 'cetak'],
    canCreateUmkm: true,
    canEditUmkm: true,
    canDeleteUmkm: false,
    canCurateUmkm: false,
    canCreateEvent: false,
    canAllocateBooth: true,
    canDeleteRegistration: false,
    canViewSensitiveData: true,
    canViewBrief: false,
    canViewAuditLog: false,
    canManageRbac: false,
    isReadOnlyBazar: false,
  },
  publik: {
    allowedMenus: ['etalase'],
    canCreateUmkm: false,
    canEditUmkm: false,
    canDeleteUmkm: false,
    canCurateUmkm: false,
    canCreateEvent: false,
    canAllocateBooth: false,
    canDeleteRegistration: false,
    canViewSensitiveData: false,
    canViewBrief: false,
    canViewAuditLog: false,
    canManageRbac: false,
    isReadOnlyBazar: true,
  },
};

export function getEffectivePermissions(
  user: AuthUser,
  permissionsMap: RolePermissionsMap
): RolePermissions {
  const base = permissionsMap[user.role] ?? INITIAL_ROLE_PERMISSIONS[user.role];
  return {
    ...base,
    scopedVillageId: user.role === 'desa' ? user.villageId : undefined,
  };
}

export function getDefaultMenuForRole(
  role: UserRole,
  permissionsMap: RolePermissionsMap = INITIAL_ROLE_PERMISSIONS
): MenuKey {
  if (role === 'superadmin') return 'rbac';
  const allowed = permissionsMap[role]?.allowedMenus ?? ['etalase'];
  if (role === 'publik') return 'etalase';
  if (role === 'desa') return allowed.includes('direktori') ? 'direktori' : allowed[0] ?? 'etalase';
  if (allowed.includes('dashboard')) return 'dashboard';
  return allowed[0] ?? 'etalase';
}

export function authenticateByCredential(
  users: AuthUser[],
  identifier: string,
  password: string
): AuthUser | null {
  const cleanId = identifier.trim().toLowerCase();
  if (!cleanId || !password) return null;

  return (
    users.find(
      (u) =>
        u.role !== 'publik' &&
        (u.email.toLowerCase() === cleanId || u.nip.toLowerCase() === cleanId) &&
        u.password === password
    ) ?? null
  );
}
