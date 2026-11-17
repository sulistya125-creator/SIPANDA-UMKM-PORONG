import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Edit3,
  Lock,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  BusinessStage,
  CurationStatus,
  LegalDocumentAttachment,
  RolePermissions,
  UMKMProfile,
  Village,
} from '../types/umkm';
import { formatIDR } from '../utils/analytics';
import { LegalDocPreviewModal } from './LegalDocPreviewModal';

interface DirektoriKurasiProps {
  umkmList: UMKMProfile[];
  villages: Village[];
  permissions: RolePermissions;
  initialStatusFilter: CurationStatus | 'all';
  onResetInitialStatusFilter: () => void;
  onOpenAddForm: () => void;
  onOpenEditForm: (umkm: UMKMProfile) => void;
  onApproveUmkm: (umkmId: string) => void;
  onRequestRevision: (umkmId: string, note: string) => void;
  onDeleteUmkm: (umkmId: string) => void;
}

export const DirektoriKurasi: React.FC<DirektoriKurasiProps> = ({
  umkmList,
  villages,
  permissions,
  initialStatusFilter,
  onResetInitialStatusFilter,
  onOpenAddForm,
  onOpenEditForm,
  onApproveUmkm,
  onRequestRevision,
  onDeleteUmkm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<BusinessStage | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CurationStatus | 'all'>(
    initialStatusFilter
  );
  const [villageFilter, setVillageFilter] = useState<string>(
    permissions.scopedVillageId ?? 'all'
  );

  // Revision modal state
  const [revisionTarget, setRevisionTarget] = useState<UMKMProfile | null>(null);
  const [revisionNoteInput, setRevisionNoteInput] = useState('');

  // Delete confirmation modal state (Admin only)
  const [deleteTarget, setDeleteTarget] = useState<UMKMProfile | null>(null);

  // Legal document preview modal state
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    document: LegalDocumentAttachment;
  } | null>(null);

  React.useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  React.useEffect(() => {
    setVillageFilter(permissions.scopedVillageId ?? 'all');
  }, [permissions.scopedVillageId]);

  const villageMap = useMemo(() => {
    const map = new Map<string, Village>();
    villages.forEach((v) => map.set(v.id, v));
    return map;
  }, [villages]);

  // If scoped to a village (e.g. Operator Kelurahan/Desa Candipari), show their village or allow viewing
  const scopedBaseList = useMemo(() => {
    if (permissions.scopedVillageId) {
      return umkmList.filter((u) => u.villageId === permissions.scopedVillageId);
    }
    return umkmList;
  }, [umkmList, permissions.scopedVillageId]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedBaseList.filter((u) => {
      if (stageFilter !== 'all' && u.businessStage !== stageFilter) return false;
      if (statusFilter !== 'all' && u.curationStatus !== statusFilter) return false;
      if (!permissions.scopedVillageId && villageFilter !== 'all' && u.villageId !== villageFilter) {
        return false;
      }
      if (q) {
        const villageName = villageMap.get(u.villageId)?.name.toLowerCase() ?? '';
        const text = `${u.businessName} ${u.ownerName} ${u.productTitle} ${villageName}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [
    scopedBaseList,
    stageFilter,
    statusFilter,
    villageFilter,
    searchQuery,
    villageMap,
    permissions.scopedVillageId,
  ]);

  const stageCounts = useMemo(
    () => ({
      all: scopedBaseList.length,
      Rintisan: scopedBaseList.filter((u) => u.businessStage === 'Rintisan').length,
      Berkembang: scopedBaseList.filter((u) => u.businessStage === 'Berkembang').length,
      'Siap Naik Kelas': scopedBaseList.filter((u) => u.businessStage === 'Siap Naik Kelas').length,
    }),
    [scopedBaseList]
  );

  const scopedVillageName = permissions.scopedVillageId
    ? villageMap.get(permissions.scopedVillageId)?.name
    : null;

  const openRevisionModal = (umkm: UMKMProfile) => {
    setRevisionTarget(umkm);
    setRevisionNoteInput(
      umkm.curationNote || 'Mohon perbaiki pencahayaan foto produk dan lengkapi label kemasan.'
    );
  };

  const submitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionTarget) return;
    onRequestRevision(
      revisionTarget.id,
      revisionNoteInput.trim() || 'Perlu perbaikan kelayakan foto/deskripsi produk.'
    );
    setRevisionTarget(null);
    setRevisionNoteInput('');
  };

  return (
    <div className="space-y-5">
      {/* RBAC Notice untuk Operator Kelurahan/Desa */}
      {scopedVillageName && (
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#1E3A8A]">
              Lingkup Akses Operator Kelurahan/Desa ({scopedVillageName})
            </div>
            <p className="mt-0.5">
              Menampilkan data UMKM binaan wilayah <strong>{scopedVillageName}</strong>. Anda
              dapat mengusulkan UMKM baru dan memperbarui profil usaha wilayah, namun{' '}
              <strong>persetujuan tayang publik (Approve / Revisi)</strong> hanya dapat dilakukan
              oleh Admin atau Kasi Seksi Perekonomian Kecamatan (<em>No Self-Approve</em>).
            </p>
          </div>
        </div>
      )}

      {/* Header & Filter Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Direktori Terpadu &amp; Meja Kurasi Produk UMKM
            </h2>
            <p className="text-xs text-slate-500">
              Kelola data pelaku usaha 19 wilayah, verifikasi NIB/Halal/P-IRT, serta kurasi
              kelayakan tayang ke Etalase Publik.
            </p>
          </div>
          {permissions.canCreateUmkm && (
            <button
              type="button"
              onClick={onOpenAddForm}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Tambah Data UMKM
            </button>
          )}
        </div>

        {/* Stage Tabs & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: `Semua (${stageCounts.all})` },
                { id: 'Rintisan', label: `Rintisan (${stageCounts.Rintisan})` },
                { id: 'Berkembang', label: `Berkembang (${stageCounts.Berkembang})` },
                {
                  id: 'Siap Naik Kelas',
                  label: `Siap Naik Kelas (${stageCounts['Siap Naik Kelas']})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStageFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  stageFilter === tab.id
                    ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 lg:max-w-xl">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari usaha / pemilik..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white"
              />
            </div>

            <select
              value={villageFilter}
              disabled={Boolean(permissions.scopedVillageId)}
              onChange={(e) => setVillageFilter(e.target.value)}
              aria-label="Filter wilayah desa/kelurahan"
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white disabled:opacity-70"
            >
              <option value="all">Semua 19 Wilayah</option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.regionType === 'Kelurahan' ? 'Kel.' : 'Desa'} {v.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as CurationStatus | 'all');
                onResetInitialStatusFilter();
              }}
              aria-label="Filter status kurasi"
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white"
            >
              <option value="all">Semua Status Kurasi</option>
              <option value="Approved">Approved (Tayang Publik)</option>
              <option value="Menunggu Kurasi">Menunggu Kurasi</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
            </select>
          </div>
        </div>
      </section>

      {/* Data Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">Pelaku Usaha &amp; Produk</th>
                <th className="py-3 px-3">Wilayah</th>
                <th className="py-3 px-3">Tahap</th>
                <th className="py-3 px-3">Legalitas</th>
                <th className="py-3 px-3 text-right">Est. Omzet / Bln</th>
                <th className="py-3 px-3">Status Kurasi</th>
                <th className="py-3 px-4 text-right">Aksi Kurasi &amp; Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada data UMKM yang sesuai dengan kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((u) => {
                  const village = villageMap.get(u.villageId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 max-w-[260px]">
                        <div className="font-bold text-slate-900 truncate">
                          {u.businessName}
                        </div>
                        <div className="text-slate-600 truncate">{u.productTitle}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {u.ownerName} · {u.category}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {village
                          ? `${village.regionType === 'Kelurahan' ? 'Kel.' : 'Desa'} ${village.name}`
                          : '-'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        {u.businessStage}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${
                              u.certifications.hasNib
                                ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            NIB
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${
                              u.certifications.hasHalal
                                ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            Halal
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${
                              u.certifications.hasPirt
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            P-IRT
                          </span>
                        </div>
                        {(u.certifications.nibDocument ||
                          u.certifications.halalDocument ||
                          u.certifications.pirtDocument) && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {u.certifications.nibDocument && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewDoc({
                                    title: `NIB · ${u.businessName}`,
                                    document: u.certifications.nibDocument!,
                                  })
                                }
                                title={`Lihat dokumen NIB: ${u.certifications.nibDocument.fileName}`}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                Dok. NIB
                              </button>
                            )}
                            {u.certifications.halalDocument && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewDoc({
                                    title: `Halal · ${u.businessName}`,
                                    document: u.certifications.halalDocument!,
                                  })
                                }
                                title={`Lihat dokumen Halal: ${u.certifications.halalDocument.fileName}`}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                Dok. Halal
                              </button>
                            )}
                            {u.certifications.pirtDocument && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewDoc({
                                    title: `P-IRT · ${u.businessName}`,
                                    document: u.certifications.pirtDocument!,
                                  })
                                }
                                title={`Lihat dokumen P-IRT: ${u.certifications.pirtDocument.fileName}`}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                Dok. P-IRT
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                        {permissions.canViewSensitiveData ? (
                          formatIDR(u.estMonthlyRevenue)
                        ) : (
                          <span className="text-slate-400 font-sans italic">Tersembunyi</span>
                        )}
                      </td>

                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="inline-flex items-center gap-1.5">
                          {u.curationStatus === 'Approved' && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-[#047857] border border-emerald-200 rounded whitespace-nowrap">
                              Tayang Publik
                            </span>
                          )}
                          {u.curationStatus === 'Menunggu Kurasi' && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded whitespace-nowrap">
                              Menunggu Kurasi
                            </span>
                          )}
                          {u.curationStatus === 'Perlu Revisi' && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-50 text-[#EF4444] border border-red-200 rounded whitespace-nowrap">
                              Perlu Revisi
                            </span>
                          )}
                        </div>
                        {permissions.canViewSensitiveData && u.curationNote && (
                          <div
                            className="mt-1 text-[11px] text-slate-500 truncate"
                            title={u.curationNote}
                          >
                            {u.curationNote}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {permissions.canCurateUmkm ? (
                            <>
                              {u.curationStatus !== 'Approved' && (
                                <button
                                  type="button"
                                  onClick={() => onApproveUmkm(u.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-md transition-colors inline-flex items-center gap-1"
                                  title="Setujui tayang di Etalase Digital Publik"
                                >
                                  <Check className="w-3 h-3" />
                                  Approve
                                </button>
                              )}
                              {u.curationStatus !== 'Perlu Revisi' && (
                                <button
                                  type="button"
                                  onClick={() => openRevisionModal(u)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-[#EF4444] bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors inline-flex items-center gap-1"
                                  title="Tandai perlu revisi foto/kemasan"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Revisi
                                </button>
                              )}
                            </>
                          ) : (
                            <span
                              className="px-2 py-1 text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded inline-flex items-center gap-1"
                              title="Hak kurasi hanya dimiliki Admin atau Kasi Perekonomian Kecamatan"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              Kurasi Kecamatan
                            </span>
                          )}

                          {permissions.canEditUmkm && (
                            <button
                              type="button"
                              onClick={() => onOpenEditForm(u)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors inline-flex items-center gap-1"
                              title="Edit profil usaha & legalitas"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit
                            </button>
                          )}

                          {permissions.canDeleteUmkm ? (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              className="p-1.5 text-slate-400 hover:text-[#EF4444] hover:bg-red-50 border border-transparent hover:border-red-200 rounded-md transition-colors"
                              title="Hapus data UMKM (Khusus Admin Kecamatan)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            permissions.canCurateUmkm && (
                              <span
                                className="p-1.5 text-slate-300 cursor-not-allowed"
                                title="RBAC Supervisor: Kasi Perekonomian tidak memiliki izin hapus data (No Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Catatan Revisi */}
      {revisionTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={submitRevision}
            className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                <span>Catatan Perbaikan Kurasi</span>
              </div>
              <button
                type="button"
                onClick={() => setRevisionTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-xs text-slate-600">
                Menandai{' '}
                <strong className="text-slate-900">{revisionTarget.businessName}</strong> (
                {revisionTarget.productTitle}) sebagai <strong>Perlu Revisi</strong> akan menarik
                produk dari Etalase Publik sampai diperbaiki.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan untuk Pelaku UMKM / Operator Kelurahan/Desa
                </label>
                <textarea
                  rows={3}
                  required
                  value={revisionNoteInput}
                  onChange={(e) => setRevisionNoteInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  placeholder="Contoh: Foto kemasan kurang jelas dan belum mencantumkan berat bersih."
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevisionTarget(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#EF4444] hover:bg-red-600 rounded-lg"
              >
                Simpan Status Revisi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Konfirmasi Hapus (Admin Kecamatan) */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Trash2 className="w-4 h-4 text-[#EF4444]" />
                <span>Konfirmasi Hapus Data UMKM</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-600 space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus data{' '}
                <strong className="text-slate-900">{deleteTarget.businessName}</strong> dari
                direktori?
              </p>
              <p className="text-slate-500">
                Tindakan ini akan menghapus data usaha dari daftar etalase dan kepesertaan bazar,
                serta dicatat pada Jejak Audit RBAC.
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUmkm(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#EF4444] hover:bg-red-600 rounded-lg"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
      {previewDoc && (
        <LegalDocPreviewModal
          title={previewDoc.title}
          document={previewDoc.document}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
