import React from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LogOut,
  Printer,
  ShieldAlert,
  Store,
  UserCog,
  X,
} from 'lucide-react';
import { AuthUser, MenuKey, RolePermissions } from '../types/umkm';

interface SidebarProps {
  activeMenu: MenuKey;
  onSelectMenu: (menu: MenuKey) => void;
  currentUser: AuthUser;
  users: AuthUser[];
  permissions: RolePermissions;
  pendingCurationCount: number;
  fullEventsCount: number;
  auditCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSwitchUser: (user: AuthUser) => void;
  onOpenRoleSwitcher: () => void;
  onLogout: () => void;
}

interface NavItem {
  key: MenuKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeTone?: 'amber' | 'red' | 'slate';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onSelectMenu,
  currentUser,
  users,
  permissions,
  pendingCurationCount,
  fullEventsCount,
  auditCount,
  isOpenMobile,
  onCloseMobile,
  onSwitchUser,
  onOpenRoleSwitcher,
  onLogout,
}) => {
  const allNavItems: NavItem[] = [
    { key: 'rbac', label: 'Manajemen Akun & RBAC', icon: UserCog },
    { key: 'dashboard', label: 'Dashboard Pimpinan', icon: BarChart3 },
    { key: 'etalase', label: 'Katalog & Etalase Digital', icon: Store },
    {
      key: 'direktori',
      label: 'Direktori & Kurasi UMKM',
      icon: ClipboardCheck,
      badge: pendingCurationCount > 0 ? pendingCurationCount : undefined,
      badgeTone: 'amber',
    },
    {
      key: 'bazar',
      label: 'Bazar & Pelatihan',
      icon: CalendarDays,
      badge: fullEventsCount > 0 ? fullEventsCount : undefined,
      badgeTone: 'red',
    },
    { key: 'brief', label: 'Management Brief', icon: FileText },
    { key: 'cetak', label: 'Cetak Data (PDF)', icon: Printer },
    {
      key: 'audit',
      label: 'Jejak Audit (RBAC Log)',
      icon: ShieldAlert,
      badge: auditCount > 0 ? auditCount : undefined,
      badgeTone: 'slate',
    },
  ];

  const visibleNavItems = allNavItems.filter((item) =>
    permissions.allowedMenus.includes(item.key)
  );

  const handleNav = (key: MenuKey) => {
    onSelectMenu(key);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1E3A8A] text-white select-none">
      {/* Brand Header */}
      <div className="px-3.5 py-4 border-b border-blue-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/20">
            <img
              src="/assets/aistudio/squareImage-1200x1200__1__7bf14be3.png"
              alt="Logo SIPANDA UMKM PORONG"
              className="w-full h-full object-contain scale-[1.26]"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[11.5px] font-bold tracking-tight leading-tight text-white">
              SIPANDA UMKM PORONG
            </div>
            <div className="text-[9.5px] leading-snug text-blue-200 mt-0.5">
              Pemasaran &amp; Pendampingan UMKM
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Tutup menu navigasi"
          className="lg:hidden p-1.5 rounded-md text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Sesi, Pilih Login Menjadi Siapa & Logout */}
      <div className="mx-3 mt-4 p-3 rounded-xl bg-blue-950/50 border border-blue-800/80 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 truncate">
            Sesi Aktif · {currentUser.roleLabel}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
          <div className="text-[11px] text-blue-200/90 truncate">{currentUser.position}</div>
        </div>

        {/* Pilihan Login Cepat: Menjadi Siapa */}
        <div className="space-y-1">
          <label
            htmlFor="sidebar-user-switcher"
            className="block text-[10px] font-semibold text-blue-200"
          >
            Login / Masuk Sebagai:
          </label>
          <select
            id="sidebar-user-switcher"
            value={currentUser.id}
            onChange={(e) => {
              const target = users.find((u) => u.id === e.target.value);
              if (target && target.id !== currentUser.id) {
                onSwitchUser(target);
                onCloseMobile();
              }
            }}
            className="w-full px-2 py-1.5 text-[11px] font-medium text-slate-900 bg-white border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.roleLabel})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onOpenRoleSwitcher();
            }}
            className="px-2 py-1.5 text-[11px] font-semibold text-blue-950 bg-[#F59E0B] hover:bg-amber-400 rounded-md transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap"
          >
            <ArrowLeftRight className="w-3 h-3 shrink-0" />
            Portal Login
          </button>
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onLogout();
            }}
            className="px-2 py-1.5 text-[11px] font-semibold text-white bg-[#EF4444]/90 hover:bg-[#EF4444] rounded-md transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap"
          >
            <LogOut className="w-3 h-3 shrink-0" />
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Links (RBAC Filtered) */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Menu Utama">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNav(item.key)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                isActive
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                  : 'text-blue-100 hover:bg-blue-800/70 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#1E3A8A]' : 'text-blue-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded tabular-nums shrink-0 ${
                    item.badgeTone === 'red'
                      ? isActive
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[#EF4444] text-white'
                      : item.badgeTone === 'slate'
                        ? isActive
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-blue-800 text-blue-100'
                        : isActive
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#F59E0B] text-blue-950'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Institutional Footer */}
      <div className="p-4 border-t border-blue-800/80 bg-blue-950/35">
        <div className="flex items-start gap-2.5">
          <Building2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-blue-100">
            <div className="font-semibold text-white">Kecamatan Porong</div>
            <div className="text-blue-200/90">Kab. Sidoarjo · 13 Desa &amp; 6 Kel.</div>
            <div className="mt-1 text-[11px] text-amber-300/95 font-medium">
              Bela Beli Produk Porong
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 border-r border-blue-950/20 no-print">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
