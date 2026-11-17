import React, { useMemo, useState } from 'react';
import { Filter, Search, ShieldAlert } from 'lucide-react';
import { AuditActionCategory, AuditLogEntry, UserRole } from '../types/umkm';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AuditActionCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return auditLogs.filter((log) => {
      if (roleFilter !== 'all' && log.actorRole !== roleFilter) return false;
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
      if (q) {
        const text = `${log.actor} ${log.actorRoleLabel} ${log.action} ${log.targetName} ${log.detail}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [auditLogs, roleFilter, categoryFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Header & Filter */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Jejak Audit Sistem &amp; Keamanan RBAC (Audit Log)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan kronologis aktivitas login, logout, persetujuan kurasi, penambahan data
                UMKM, dan alokasi booth bazar sesuai Bagian 12 PRD.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
            Total Catatan: <strong className="text-slate-900">{auditLogs.length}</strong>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Filter Kategori */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            {(
              [
                { id: 'all', label: 'Semua Kategori' },
                { id: 'Autentikasi', label: 'Autentikasi' },
                { id: 'Manajemen RBAC', label: 'Manajemen RBAC' },
                { id: 'Kurasi & UMKM', label: 'Kurasi & UMKM' },
                { id: 'Bazar & Kuota', label: 'Bazar & Kuota' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === tab.id
                    ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter Role & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:w-[460px]">
            <div className="relative">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                aria-label="Filter Role Pengguna"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white"
              >
                <option value="all">Semua Role Pengguna</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin Kecamatan</option>
                <option value="kasi">Kasi Perekonomian</option>
                <option value="camat">Pimpinan (Camat)</option>
                <option value="desa">Operator Kelurahan/Desa</option>
                <option value="publik">Publik / Pembeli</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aktivitas atau target..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabel Jejak Audit */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4 whitespace-nowrap">Waktu</th>
                <th className="py-3 px-3">Aktivitas</th>
                <th className="py-3 px-3">Pengguna &amp; Role RBAC</th>
                <th className="py-3 px-3 whitespace-nowrap">Kategori Aksi</th>
                <th className="py-3 px-3">Entitas / Target</th>
                <th className="py-3 px-4">Detail Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Belum ada catatan audit yang cocok dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded border ${
                          log.tone === 'success'
                            ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                            : log.tone === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : log.tone === 'danger'
                                ? 'bg-red-50 text-[#EF4444] border-red-200'
                                : 'bg-blue-50 text-[#1E3A8A] border-blue-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{log.actor}</div>
                      <div className="text-[11px] text-slate-500">{log.actorRoleLabel}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {log.category}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {log.targetName}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      {log.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
