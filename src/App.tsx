import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  FileOutput,
  LogOut,
  Menu,
  Plus,
  RotateCcw,
} from 'lucide-react';
import {
  AuditActionCategory,
  AuditLogEntry,
  AuthUser,
  BazarEvent,
  CurationStatus,
  EventRegistration,
  MenuKey,
  RolePermissions,
  RolePermissionsMap,
  UMKMProfile,
  UserRole,
} from './types/umkm';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_UMKM_LIST,
  VILLAGES,
} from './data/mockPorongData';
import {
  INITIAL_ROLE_PERMISSIONS,
  INITIAL_USERS,
  getDefaultMenuForRole,
  getEffectivePermissions,
} from './data/rbacConfig';
import { computeAnalytics } from './utils/analytics';
import { Sidebar } from './components/Sidebar';
import { DashboardPimpinan } from './components/DashboardPimpinan';
import { EtalasePublik } from './components/EtalasePublik';
import { DirektoriKurasi } from './components/DirektoriKurasi';
import { BazarPelatihan } from './components/BazarPelatihan';
import { ManagementBrief } from './components/ManagementBrief';
import { AuditLogView } from './components/AuditLogView';
import { LoginPortal } from './components/LoginPortal';
import { ManajemenAkunRbac } from './components/ManajemenAkunRbac';
import { CetakDataView } from './components/CetakDataView';
import { UmkmFormModal } from './components/UmkmFormModal';

const STORAGE_KEY = 'porong_umkm_hub_v2_rbac_state';
const SESSION_USER_KEY = 'porong_umkm_hub_active_user_id';

const MENU_TITLES: Record<MenuKey, { title: string; subtitle: string }> = {
  rbac: {
    title: 'Manajemen Akun & RBAC',
    subtitle: 'Kendali Super Admin untuk pengubahan nama akun, pengguna baru & matriks hak akses',
  },
  dashboard: {
    title: 'Dashboard Pimpinan',
    subtitle: 'Ringkasan KPI, sebaran NIB 19 wilayah, komposisi sektor & AI Insight',
  },
  etalase: {
    title: 'Katalog & Etalase Digital Publik',
    subtitle: 'Produk unggulan terkurasi dengan pemesanan langsung WhatsApp tanpa komisi',
  },
  direktori: {
    title: 'Direktori & Kurasi UMKM',
    subtitle: 'Pendataan pelaku usaha, verifikasi legalitas, dan persetujuan tayang katalog',
  },
  bazar: {
    title: 'Bazar & Pelatihan Kapasitas',
    subtitle: 'Jadwal kegiatan Seksi Perekonomian dan alokasi booth dengan validasi kuota',
  },
  brief: {
    title: 'Management Brief Otomatis',
    subtitle: 'Laporan eksekutif resmi berkop Kecamatan Porong siap cetak ke PDF',
  },
  cetak: {
    title: 'Cetak Data (PDF)',
    subtitle: 'Pratinjau & cetak tabel data UMKM, 19 Kelurahan/Desa, dan peserta bazar ke PDF',
  },
  audit: {
    title: 'Jejak Audit (RBAC Log)',
    subtitle: 'Rekam jejak autentikasi, kurasi produk, perubahan RBAC, dan validasi kuota bazar',
  },
};

interface SavedState {
  umkmList: UMKMProfile[];
  events: BazarEvent[];
  registrations: EventRegistration[];
  auditLogs: AuditLogEntry[];
  users?: AuthUser[];
  rolePermissionsMap?: RolePermissionsMap;
  cetakMenuMigrated?: boolean;
}

function formatNowLabel(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `17 Nov 2026 · ${hh}:${mm}`;
}

function loadSavedState(): Partial<SavedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SavedState;
    }
  } catch {
    // Ignore parse error
  }
  return {};
}

export default function App() {
  const [users, setUsers] = useState<AuthUser[]>(() => {
    const parsed = loadSavedState();
    if (Array.isArray(parsed.users) && parsed.users.length > 0) {
      const normalizedUsers = parsed.users.map((u) =>
        u.role === 'desa'
          ? {
              ...u,
              roleLabel:
                u.roleLabel === 'Kontributor Desa' || u.roleLabel === 'Operator Desa'
                  ? 'Operator Kelurahan/Desa'
                  : u.roleLabel,
              position: u.position.startsWith('Operator Desa ')
                ? u.position.replace(/^Operator Desa /, 'Operator Kelurahan/Desa ')
                : u.position,
            }
          : u
      );
      const hasSuperAdmin = normalizedUsers.some((u) => u.role === 'superadmin');
      return hasSuperAdmin ? normalizedUsers : [INITIAL_USERS[0], ...normalizedUsers];
    }
    return INITIAL_USERS;
  });

  const [rolePermissionsMap, setRolePermissionsMap] = useState<RolePermissionsMap>(() => {
    const parsed = loadSavedState();
    if (parsed.rolePermissionsMap) {
      const merged: RolePermissionsMap = {
        ...INITIAL_ROLE_PERMISSIONS,
        ...parsed.rolePermissionsMap,
        superadmin: INITIAL_ROLE_PERMISSIONS.superadmin,
      };
      if (!parsed.cetakMenuMigrated) {
        (['admin', 'kasi', 'camat', 'desa'] as UserRole[]).forEach((roleKey) => {
          const currentMenus = merged[roleKey].allowedMenus;
          if (!currentMenus.includes('cetak')) {
            merged[roleKey] = {
              ...merged[roleKey],
              allowedMenus: [...currentMenus, 'cetak'],
            };
          }
        });
      }
      return merged;
    }
    return INITIAL_ROLE_PERMISSIONS;
  });

  // Store active user ID so edits to name/profile in `users` reflect live in active session
  const [activeUserId, setActiveUserId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_USER_KEY);
    } catch {
      return null;
    }
  });

  const currentUser = useMemo(() => {
    if (!activeUserId) return null;
    return users.find((u) => u.id === activeUserId) ?? null;
  }, [activeUserId, users]);

  const [isLoginPortalOpen, setIsLoginPortalOpen] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem(SESSION_USER_KEY);
    } catch {
      return true;
    }
  });

  const [activeMenu, setActiveMenu] = useState<MenuKey>(() => {
    try {
      const savedId = sessionStorage.getItem(SESSION_USER_KEY);
      const matched = savedId ? INITIAL_USERS.find((u) => u.id === savedId) : null;
      if (matched) {
        return getDefaultMenuForRole(matched.role);
      }
    } catch {
      // Ignore
    }
    return 'dashboard';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [umkmList, setUmkmList] = useState<UMKMProfile[]>(() => {
    const parsed = loadSavedState();
    if (Array.isArray(parsed.umkmList) && parsed.umkmList.length > 0) {
      return parsed.umkmList;
    }
    return INITIAL_UMKM_LIST;
  });

  const [events, setEvents] = useState<BazarEvent[]>(() => {
    const parsed = loadSavedState();
    if (Array.isArray(parsed.events) && parsed.events.length > 0) {
      return parsed.events;
    }
    return INITIAL_EVENTS;
  });

  const [registrations, setRegistrations] = useState<EventRegistration[]>(() => {
    const parsed = loadSavedState();
    if (Array.isArray(parsed.registrations)) {
      return parsed.registrations;
    }
    return INITIAL_REGISTRATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const parsed = loadSavedState();
    if (Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0) {
      return parsed.auditLogs;
    }
    return INITIAL_AUDIT_LOGS;
  });

  // Cross-view filter handoff states
  const [etalaseVillageFilter, setEtalaseVillageFilter] = useState<string>('all');
  const [direktoriStatusFilter, setDirektoriStatusFilter] = useState<CurationStatus | 'all'>('all');

  // Form Modal
  const [isUmkmModalOpen, setIsUmkmModalOpen] = useState(false);
  const [editingUmkm, setEditingUmkm] = useState<UMKMProfile | null>(null);

  // Brief Period
  const [reportPeriod, setReportPeriod] = useState('November 2026');

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: SavedState = {
        umkmList,
        events,
        registrations,
        auditLogs,
        users,
        rolePermissionsMap,
        cetakMenuMigrated: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [umkmList, events, registrations, auditLogs, users, rolePermissionsMap]);

  const permissions = useMemo(() => {
    const fallbackUser = users.find((u) => u.role === 'publik') ?? INITIAL_USERS[INITIAL_USERS.length - 1];
    return getEffectivePermissions(currentUser ?? fallbackUser, rolePermissionsMap);
  }, [currentUser, users, rolePermissionsMap]);

  // Ensure activeMenu stays valid when switching role or editing permissions
  useEffect(() => {
    if (currentUser && !permissions.allowedMenus.includes(activeMenu)) {
      setActiveMenu(getDefaultMenuForRole(currentUser.role, rolePermissionsMap));
    }
  }, [currentUser, permissions, activeMenu, rolePermissionsMap]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const appendAudit = (
    category: AuditActionCategory,
    action: string,
    targetName: string,
    detail: string,
    tone: AuditLogEntry['tone'] = 'info',
    actorOverride?: AuthUser
  ) => {
    const actorUser = actorOverride ?? currentUser ?? users[0] ?? INITIAL_USERS[0];
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actor: actorUser.name,
      actorRole: actorUser.role,
      actorRoleLabel: actorUser.roleLabel,
      category,
      action,
      targetName,
      detail,
      timestamp: formatNowLabel(),
      tone,
    };
    setAuditLogs((prev) => [entry, ...prev].slice(0, 60));
  };

  const analytics = useMemo(
    () => computeAnalytics(umkmList, VILLAGES, events, registrations),
    [umkmList, events, registrations]
  );

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser, methodLabel: string) => {
    try {
      sessionStorage.setItem(SESSION_USER_KEY, user.id);
    } catch {
      // Ignore
    }
    const previousUser = currentUser;
    setActiveUserId(user.id);
    setIsLoginPortalOpen(false);
    setActiveMenu(getDefaultMenuForRole(user.role, rolePermissionsMap));

    appendAudit(
      'Autentikasi',
      previousUser ? 'Pergantian Role RBAC' : 'Login Sistem',
      `${user.roleLabel} (${user.badgeLabel})`,
      `${methodLabel} · ${user.accessSummary}`,
      'info',
      user
    );
    showToast(`Masuk sebagai ${user.name} (${user.roleLabel}).`);
  };

  const handleLogout = () => {
    if (currentUser) {
      appendAudit(
        'Autentikasi',
        'Logout Sistem',
        currentUser.roleLabel,
        `Sesi ${currentUser.name} ditutup oleh pengguna.`,
        'warning',
        currentUser
      );
    }
    try {
      sessionStorage.removeItem(SESSION_USER_KEY);
    } catch {
      // Ignore
    }
    setActiveUserId(null);
    setIsLoginPortalOpen(true);
    showToast('Anda telah keluar (Logout) dari sesi sistem.');
  };

  // Super Admin Handlers: User Management & Dynamic RBAC
  const handleUpdateUser = (updatedUser: AuthUser) => {
    if (!permissions.canManageRbac) return;
    const prevUser = users.find((u) => u.id === updatedUser.id);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    const nameChanged = prevUser && prevUser.name !== updatedUser.name;
    appendAudit(
      'Manajemen RBAC',
      nameChanged ? 'Mengubah nama & profil akun' : 'Memperbarui profil akun pengguna',
      updatedUser.name,
      nameChanged
        ? `Nama diubah dari "${prevUser.name}" menjadi "${updatedUser.name}" (${updatedUser.roleLabel}).`
        : `Pembaruan jabatan/unit/kredensial untuk peran ${updatedUser.roleLabel}.`,
      'info',
      updatedUser.id === currentUser?.id ? updatedUser : undefined
    );
    showToast(`Profil ${updatedUser.name} berhasil diperbarui.`);
  };

  const handleCreateUser = (newUserPayload: Omit<AuthUser, 'id'>) => {
    if (!permissions.canManageRbac) return;
    const created: AuthUser = {
      ...newUserPayload,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, created]);
    appendAudit(
      'Manajemen RBAC',
      'Menambahkan akun pengguna baru',
      created.name,
      `Peran: ${created.roleLabel} (${created.badgeLabel}) · ${created.email || created.nip || 'Akun internal'}.`,
      'success'
    );
    showToast(`Akun ${created.name} (${created.roleLabel}) berhasil dibuat.`);
  };

  const handleRegisterVillageOperator = (
    newUserPayload: Omit<AuthUser, 'id'>,
    autoLogin: boolean
  ): { ok: boolean; message: string; user?: AuthUser } => {
    const cleanEmail = newUserPayload.email.trim().toLowerCase();
    const cleanNip = newUserPayload.nip.trim().toLowerCase();

    const duplicateEmail = users.some(
      (u) => u.email && u.email.trim().toLowerCase() === cleanEmail
    );
    if (duplicateEmail) {
      return {
        ok: false,
        message: `Email "${newUserPayload.email}" sudah terdaftar. Gunakan alamat email lain.`,
      };
    }

    const duplicateNip =
      cleanNip.length > 0 &&
      users.some((u) => u.nip && u.nip.trim().toLowerCase() === cleanNip);
    if (duplicateNip) {
      return {
        ok: false,
        message: `NIP/ID "${newUserPayload.nip}" sudah digunakan akun lain.`,
      };
    }

    const created: AuthUser = {
      ...newUserPayload,
      role: 'desa',
      roleLabel: 'Operator Kelurahan/Desa',
      id: `usr-desa-${Date.now()}`,
    };

    setUsers((prev) => [...prev, created]);
    appendAudit(
      'Autentikasi',
      'Pendaftaran Akun Operator Kelurahan/Desa',
      `${created.name} (${created.badgeLabel})`,
      `Akun baru Operator Kelurahan/Desa terdaftar dengan email ${created.email}.`,
      'success',
      created
    );

    if (autoLogin) {
      handleLoginSuccess(created, 'Registrasi Akun Operator Kelurahan/Desa');
    } else {
      showToast(`Akun Operator Kelurahan/Desa ${created.badgeLabel} (${created.name}) berhasil dibuat.`);
    }

    return {
      ok: true,
      message: `Akun Operator Kelurahan/Desa ${created.badgeLabel} berhasil didaftarkan.`,
      user: created,
    };
  };

  const handleDeleteUser = (userId: string) => {
    if (!permissions.canManageRbac) return;
    const target = users.find((u) => u.id === userId);
    if (!target || target.role === 'superadmin' || target.role === 'publik' || target.id === currentUser?.id) {
      showToast('Akun inti atau sesi yang sedang aktif tidak dapat dihapus.');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    appendAudit(
      'Manajemen RBAC',
      'Menghapus akun pengguna',
      target.name,
      `Akun ${target.roleLabel} (${target.badgeLabel}) dihapus oleh Super Admin.`,
      'danger'
    );
    showToast(`Akun ${target.name} telah dihapus.`);
  };

  const handleToggleRolePermission = (
    role: UserRole,
    key: keyof Omit<RolePermissions, 'allowedMenus' | 'scopedVillageId' | 'canManageRbac'>,
    value: boolean
  ) => {
    if (!permissions.canManageRbac || role === 'superadmin') return;
    setRolePermissionsMap((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: value,
      },
    }));
    appendAudit(
      'Manajemen RBAC',
      value ? 'Mengaktifkan izin aksi RBAC' : 'Menonaktifkan izin aksi RBAC',
      `Role ${role.toUpperCase()} · ${key}`,
      `Hak akses "${key}" diubah menjadi ${value ? 'AKTIF' : 'NONAKTIF'} oleh Super Admin.`,
      value ? 'success' : 'warning'
    );
    showToast(`Hak akses "${key}" untuk role ${role} diperbarui.`);
  };

  const handleToggleRoleMenu = (role: UserRole, menu: MenuKey, enabled: boolean) => {
    if (!permissions.canManageRbac || role === 'superadmin') return;
    if (role === 'publik' && menu === 'etalase' && !enabled) return;

    setRolePermissionsMap((prev) => {
      const currentMenus = prev[role].allowedMenus;
      const nextMenus = enabled
        ? Array.from(new Set([...currentMenus, menu]))
        : currentMenus.filter((m) => m !== menu);
      return {
        ...prev,
        [role]: {
          ...prev[role],
          allowedMenus: nextMenus,
          canViewBrief: menu === 'brief' ? enabled : prev[role].canViewBrief,
          canViewAuditLog: menu === 'audit' ? enabled : prev[role].canViewAuditLog,
        },
      };
    });

    appendAudit(
      'Manajemen RBAC',
      enabled ? 'Membuka akses menu RBAC' : 'Menutup akses menu RBAC',
      `Role ${role.toUpperCase()} · Menu ${menu}`,
      `Visibilitas menu "${menu}" diubah menjadi ${enabled ? 'DIIZINKAN' : 'DITUTUP'}.`,
      enabled ? 'info' : 'warning'
    );
    showToast(`Akses menu "${menu}" untuk role ${role} diperbarui.`);
  };

  const handleResetPermissionsDefault = () => {
    if (!permissions.canManageRbac) return;
    setRolePermissionsMap(INITIAL_ROLE_PERMISSIONS);
    appendAudit(
      'Manajemen RBAC',
      'Memulihkan matriks RBAC default PRD',
      'Semua Role RBAC',
      'Seluruh izin menu dan aksi dikembalikan ke konfigurasi standar PRD v2.0.',
      'warning'
    );
    showToast('Matriks hak akses RBAC dipulihkan ke standar awal PRD.');
  };

  // UMKM CRUD & Kurasi Handlers
  const handleSaveUmkm = (
    payload: Omit<UMKMProfile, 'id' | 'waClicks'>,
    existingId?: string
  ) => {
    const attachedDocs = [
      payload.certifications.nibDocument ? 'NIB' : null,
      payload.certifications.halalDocument ? 'Halal' : null,
      payload.certifications.pirtDocument ? 'P-IRT' : null,
    ].filter(Boolean);
    const docsNote =
      attachedDocs.length > 0 ? ` · Dokumen terunggah: ${attachedDocs.join(', ')}` : '';

    if (existingId) {
      setUmkmList((prev) =>
        prev.map((item) => (item.id === existingId ? { ...item, ...payload } : item))
      );
      appendAudit(
        'Kurasi & UMKM',
        'Memperbarui data UMKM',
        payload.businessName,
        `Perubahan profil & legalitas (${payload.curationStatus})${docsNote}.`,
        'info'
      );
      showToast(`Data ${payload.businessName} berhasil diperbarui.`);
    } else {
      const newEntry: UMKMProfile = {
        ...payload,
        id: `umkm-${Date.now()}`,
        waClicks: 0,
      };
      setUmkmList((prev) => [newEntry, ...prev]);
      appendAudit(
        'Kurasi & UMKM',
        'Menambahkan data UMKM baru',
        payload.businessName,
        `Produk: ${payload.productTitle} · Status awal: ${payload.curationStatus}${docsNote}.`,
        'success'
      );
      showToast(`${payload.businessName} ditambahkan (${payload.curationStatus}).`);
    }
    setIsUmkmModalOpen(false);
    setEditingUmkm(null);
  };

  const handleApproveUmkm = (umkmId: string) => {
    if (!permissions.canCurateUmkm) {
      showToast('Akses ditolak: Role Anda tidak memiliki izin kurasi.');
      return;
    }
    const target = umkmList.find((u) => u.id === umkmId);
    if (!target) return;
    setUmkmList((prev) =>
      prev.map((u) =>
        u.id === umkmId
          ? {
              ...u,
              curationStatus: 'Approved',
              curationNote: 'Disetujui tayang di Etalase Digital Publik.',
              curatedBy: currentUser?.name ?? 'Seksi Perekonomian',
              curatedAt: new Date().toISOString().slice(0, 10),
            }
          : u
      )
    );
    appendAudit(
      'Kurasi & UMKM',
      'Menyetujui tayang etalase publik',
      target.businessName,
      `Produk ${target.productTitle} disetujui tayang di Etalase Digital Publik.`,
      'success'
    );
    showToast(`${target.businessName} kini tayang di Etalase Digital Publik.`);
  };

  const handleRequestRevision = (umkmId: string, note: string) => {
    if (!permissions.canCurateUmkm) {
      showToast('Akses ditolak: Role Anda tidak memiliki izin kurasi.');
      return;
    }
    const target = umkmList.find((u) => u.id === umkmId);
    if (!target) return;
    setUmkmList((prev) =>
      prev.map((u) =>
        u.id === umkmId
          ? {
              ...u,
              curationStatus: 'Perlu Revisi',
              curationNote: note,
              curatedBy: currentUser?.name ?? 'Seksi Perekonomian',
              curatedAt: new Date().toISOString().slice(0, 10),
            }
          : u
      )
    );
    appendAudit(
      'Kurasi & UMKM',
      'Meminta revisi kurasi',
      target.businessName,
      `Catatan revisi: ${note}`,
      'warning'
    );
    showToast(`Status ${target.businessName} diubah menjadi Perlu Revisi.`);
  };

  const handleDeleteUmkm = (umkmId: string) => {
    if (!permissions.canDeleteUmkm) {
      showToast('Akses ditolak: Role Anda tidak memiliki izin hapus data.');
      return;
    }
    const target = umkmList.find((u) => u.id === umkmId);
    if (!target) return;
    setUmkmList((prev) => prev.filter((u) => u.id !== umkmId));
    setRegistrations((prev) => prev.filter((r) => r.umkmId !== umkmId));
    appendAudit(
      'Kurasi & UMKM',
      'Menghapus data UMKM',
      target.businessName,
      `Penghapusan permanen oleh ${currentUser?.roleLabel ?? 'Pengelola'} dari direktori & jadwal bazar.`,
      'danger'
    );
    showToast(`Data ${target.businessName} telah dihapus dari direktori.`);
  };

  const handleTrackWaClick = (umkmId: string) => {
    setUmkmList((prev) =>
      prev.map((u) => (u.id === umkmId ? { ...u, waClicks: u.waClicks + 1 } : u))
    );
  };

  // Bazar & Event Handlers
  const handleCreateEvent = (eventPayload: Omit<BazarEvent, 'id'>) => {
    if (!permissions.canCreateEvent) return;
    const newEvt: BazarEvent = {
      ...eventPayload,
      id: `evt-${Date.now()}`,
    };
    setEvents((prev) => [newEvt, ...prev]);
    appendAudit(
      'Bazar & Kuota',
      'Memublikasikan agenda bazar baru',
      newEvt.title,
      `Kapasitas maksimal ${newEvt.maxCapacity} ${newEvt.unitLabel} · ${newEvt.location}.`,
      'success'
    );
    showToast(`Agenda "${newEvt.title}" berhasil dipublikasikan.`);
  };

  const handleAllocateBooth = (
    eventId: string,
    umkmId: string,
    facilityRequest: string
  ): { ok: boolean; message: string } => {
    if (!permissions.canAllocateBooth) {
      return { ok: false, message: 'Akses ditolak: Role Anda tidak memiliki izin alokasi booth.' };
    }
    const evt = events.find((e) => e.id === eventId);
    const umkm = umkmList.find((u) => u.id === umkmId);
    if (!evt || !umkm) {
      return { ok: false, message: 'Agenda atau pelaku UMKM tidak ditemukan.' };
    }

    const currentEventRegs = registrations.filter((r) => r.eventId === eventId);

    if (currentEventRegs.length >= evt.maxCapacity) {
      appendAudit(
        'Bazar & Kuota',
        'Menolak alokasi (kuota penuh 100%)',
        evt.title,
        `Pengajuan ${umkm.businessName} ditolak otomatis karena slot ${currentEventRegs.length}/${evt.maxCapacity} penuh.`,
        'danger'
      );
      return {
        ok: false,
        message: `DITOLAK OTOMATIS: Kapasitas ${evt.title} telah 100% penuh (${currentEventRegs.length}/${evt.maxCapacity} ${evt.unitLabel}). Pendaftaran terkunci.`,
      };
    }

    if (currentEventRegs.some((r) => r.umkmId === umkmId)) {
      return {
        ok: false,
        message: `DITOLAK OTOMATIS: ${umkm.businessName} sudah terdaftar pada agenda ${evt.title}.`,
      };
    }

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId,
      umkmId,
      facilityRequest,
      registeredAt: formatNowLabel(),
    };

    setRegistrations((prev) => [...prev, newReg]);
    appendAudit(
      'Bazar & Kuota',
      `Mengalokasikan ${evt.unitLabel}`,
      `${umkm.businessName} → ${evt.title}`,
      `Fasilitas: ${facilityRequest} (${currentEventRegs.length + 1}/${evt.maxCapacity}).`,
      'success'
    );
    showToast(`${umkm.businessName} berhasil dialokasikan ke ${evt.title}.`);
    return {
      ok: true,
      message: `BERHASIL: ${umkm.businessName} dialokasikan ke ${evt.title} (${currentEventRegs.length + 1}/${evt.maxCapacity} ${evt.unitLabel}).`,
    };
  };

  const handleRemoveRegistration = (registrationId: string) => {
    if (!permissions.canDeleteRegistration) {
      showToast('Akses ditolak: Role Anda tidak memiliki izin membatalkan slot peserta.');
      return;
    }
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return;
    const umkm = umkmList.find((u) => u.id === reg.umkmId);
    const evt = events.find((e) => e.id === reg.eventId);
    setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
    appendAudit(
      'Bazar & Kuota',
      'Membatalkan alokasi peserta',
      `${umkm?.businessName ?? 'UMKM'} · ${evt?.title ?? 'Agenda'}`,
      `Slot kuota dibuka kembali oleh ${currentUser?.roleLabel ?? 'Pengelola'}.`,
      'warning'
    );
    showToast('Alokasi peserta dihapus dan slot kuota dibuka kembali.');
  };

  const handleRecordPrintAudit = (datasetLabel: string, rowCount: number) => {
    appendAudit(
      'Laporan',
      'Mencetak tabel data (PDF)',
      datasetLabel,
      `Dokumen tabel PDF dicetak (${rowCount} baris data) oleh ${currentUser?.name ?? 'Pengguna'}.`,
      'info'
    );
    showToast(`Menyiapkan dokumen tabel PDF (${rowCount} baris)...`);
  };

  const handleResetDemoData = () => {
    setUmkmList(INITIAL_UMKM_LIST);
    setEvents(INITIAL_EVENTS);
    setRegistrations(INITIAL_REGISTRATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setUsers(INITIAL_USERS);
    setRolePermissionsMap(INITIAL_ROLE_PERMISSIONS);
    setEtalaseVillageFilter('all');
    setDirektoriStatusFilter('all');
    localStorage.removeItem(STORAGE_KEY);
    showToast('Data simulasi 13 Desa & 6 Kelurahan, akun, dan RBAC dikembalikan ke awal.');
  };

  // Render Portal Autentikasi jika belum login atau sedang Ganti Role
  if (isLoginPortalOpen || !currentUser) {
    return (
      <>
        <LoginPortal
          users={users}
          villages={VILLAGES}
          onLoginSuccess={handleLoginSuccess}
          onRegisterVillageOperator={handleRegisterVillageOperator}
          currentActiveUser={currentUser}
          onCancelSwitch={currentUser ? () => setIsLoginPortalOpen(false) : undefined}
          onLogout={currentUser ? handleLogout : undefined}
        />
        {toastMessage && (
          <div
            role="status"
            className="no-print fixed bottom-5 right-5 z-50 max-w-sm bg-[#1E3A8A] text-white px-4 py-3 rounded-xl shadow-lg border border-blue-800 flex items-center gap-2.5 text-xs font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  const currentMeta = MENU_TITLES[activeMenu];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar Navigasi Kiri (RBAC Filtered) */}
      <Sidebar
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        currentUser={currentUser}
        users={users}
        permissions={permissions}
        pendingCurationCount={analytics.pendingCurationCount}
        fullEventsCount={analytics.fullEventsCount}
        auditCount={auditLogs.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSwitchUser={(targetUser) => handleLoginSuccess(targetUser, 'Pilih Akun Sidebar')}
        onOpenRoleSwitcher={() => setIsLoginPortalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Area Konten Kanan */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Kontekstual */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-3.5 no-print">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            {/* Zona Kiri */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Buka menu navigasi"
                className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {currentMeta.title}
                </h1>
                <p className="hidden sm:block text-xs text-slate-500 truncate">
                  {currentMeta.subtitle}
                </p>
              </div>
            </div>

            {/* Zona Kanan: Pemilih Akun Login + Aksi Cepat sesuai RBAC + Logout */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
                <label
                  htmlFor="header-user-switcher"
                  className="text-[11px] font-semibold text-slate-600 whitespace-nowrap"
                >
                  Masuk sebagai:
                </label>
                <select
                  id="header-user-switcher"
                  value={currentUser.id}
                  onChange={(e) => {
                    const targetUser = users.find((u) => u.id === e.target.value);
                    if (targetUser && targetUser.id !== currentUser.id) {
                      handleLoginSuccess(targetUser, 'Pilih Akun Header Aplikasi');
                    }
                  }}
                  className="bg-white text-xs font-semibold text-slate-800 px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] max-w-[180px]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleLabel})
                    </option>
                  ))}
                </select>
              </div>

              {permissions.canCreateUmkm && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUmkm(null);
                    setIsUmkmModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Daftarkan UMKM Baru</span>
                  <span className="sm:hidden">UMKM Baru</span>
                </button>
              )}

              {permissions.canViewBrief && permissions.allowedMenus.includes('brief') && (
                <button
                  type="button"
                  onClick={() => setActiveMenu('brief')}
                  className="hidden xl:inline-flex px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <FileOutput className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Export Laporan</span>
                </button>
              )}

              {currentUser.role === 'publik' ? (
                <button
                  type="button"
                  onClick={() => setIsLoginPortalOpen(true)}
                  className="px-3 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar dari sesi aktif"
                  className="px-3 py-2 text-xs font-semibold text-[#EF4444] bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Konten Utama */}
        <main className="flex-1 px-4 sm:px-6 py-6">
          <div className="max-w-[1400px] mx-auto">
            {activeMenu === 'rbac' && permissions.canManageRbac && (
              <ManajemenAkunRbac
                users={users}
                currentUserId={currentUser.id}
                villages={VILLAGES}
                permissionsMap={rolePermissionsMap}
                onUpdateUser={handleUpdateUser}
                onCreateUser={handleCreateUser}
                onDeleteUser={handleDeleteUser}
                onToggleRolePermission={handleToggleRolePermission}
                onToggleRoleMenu={handleToggleRoleMenu}
                onResetPermissionsDefault={handleResetPermissionsDefault}
              />
            )}

            {activeMenu === 'dashboard' && permissions.allowedMenus.includes('dashboard') && (
              <DashboardPimpinan
                analytics={analytics}
                onNavigate={(menu) => {
                  if (permissions.allowedMenus.includes(menu)) {
                    setActiveMenu(menu);
                  }
                }}
                onNavigateCurationQueue={(status) => {
                  if (permissions.allowedMenus.includes('direktori')) {
                    setDirektoriStatusFilter(status);
                    setActiveMenu('direktori');
                  } else {
                    showToast('Role Anda tidak memiliki akses ke Direktori Kurasi.');
                  }
                }}
                onNavigateEtalaseByVillage={(villageId) => {
                  setEtalaseVillageFilter(villageId);
                  setActiveMenu('etalase');
                }}
              />
            )}

            {activeMenu === 'etalase' && permissions.allowedMenus.includes('etalase') && (
              <EtalasePublik
                umkmList={umkmList}
                villages={VILLAGES}
                selectedVillageFilter={etalaseVillageFilter}
                onChangeVillageFilter={setEtalaseVillageFilter}
                onTrackWaClick={handleTrackWaClick}
              />
            )}

            {activeMenu === 'direktori' && permissions.allowedMenus.includes('direktori') && (
              <DirektoriKurasi
                umkmList={umkmList}
                villages={VILLAGES}
                permissions={permissions}
                initialStatusFilter={direktoriStatusFilter}
                onResetInitialStatusFilter={() => setDirektoriStatusFilter('all')}
                onOpenAddForm={() => {
                  setEditingUmkm(null);
                  setIsUmkmModalOpen(true);
                }}
                onOpenEditForm={(umkm) => {
                  setEditingUmkm(umkm);
                  setIsUmkmModalOpen(true);
                }}
                onApproveUmkm={handleApproveUmkm}
                onRequestRevision={handleRequestRevision}
                onDeleteUmkm={handleDeleteUmkm}
              />
            )}

            {activeMenu === 'bazar' && permissions.allowedMenus.includes('bazar') && (
              <BazarPelatihan
                events={events}
                registrations={registrations}
                umkmList={umkmList}
                villages={VILLAGES}
                permissions={permissions}
                onCreateEvent={handleCreateEvent}
                onAllocateBooth={handleAllocateBooth}
                onRemoveRegistration={handleRemoveRegistration}
              />
            )}

            {activeMenu === 'brief' && permissions.allowedMenus.includes('brief') && (
              <ManagementBrief
                analytics={analytics}
                reportPeriod={reportPeriod}
                onChangeReportPeriod={setReportPeriod}
              />
            )}

            {activeMenu === 'cetak' && permissions.allowedMenus.includes('cetak') && (
              <CetakDataView
                umkmList={umkmList}
                villages={VILLAGES}
                events={events}
                registrations={registrations}
                analytics={analytics}
                currentUser={currentUser}
                permissions={permissions}
                onRecordPrintAudit={handleRecordPrintAudit}
              />
            )}

            {activeMenu === 'audit' && permissions.allowedMenus.includes('audit') && (
              <AuditLogView auditLogs={auditLogs} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="no-print border-t border-slate-200 bg-white px-4 sm:px-6 py-3.5">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              <strong className="text-slate-700">SIPANDA UMKM PORONG</strong> · Sistem Informasi
              Pemasaran &amp; Pendampingan UMKM Kec. Porong —{' '}
              <span className="italic">
                Bersama Membangun UMKM yang Mandiri dan Berdaya Saing
              </span>
            </div>
            <div className="flex items-center gap-4">
              {permissions.canViewAuditLog &&
                permissions.allowedMenus.includes('audit') &&
                auditLogs[0] && (
                  <button
                    type="button"
                    onClick={() => setActiveMenu('audit')}
                    className="tabular-nums hover:text-[#1E3A8A] text-left truncate max-w-xs"
                  >
                    Audit terbaru: {auditLogs[0].action} ({auditLogs[0].targetName})
                  </button>
                )}
              {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-[#1E3A8A] font-medium whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Data Simulasi
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Modal Tambah / Edit UMKM */}
      {isUmkmModalOpen &&
        (permissions.canCreateUmkm || (Boolean(editingUmkm) && permissions.canEditUmkm)) && (
          <UmkmFormModal
            initialData={editingUmkm}
            villages={VILLAGES}
            permissions={permissions}
            onClose={() => {
              setIsUmkmModalOpen(false);
              setEditingUmkm(null);
            }}
            onSave={handleSaveUmkm}
          />
        )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="no-print fixed bottom-5 right-5 z-50 max-w-sm bg-[#1E3A8A] text-white px-4 py-3 rounded-xl shadow-lg border border-blue-800 flex items-center gap-2.5 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
