import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  FileSpreadsheet,
  Filter,
  Printer,
  Table2,
} from 'lucide-react';
import {
  AuthUser,
  BazarEvent,
  BusinessStage,
  CurationStatus,
  EventRegistration,
  RolePermissions,
  UMKMProfile,
  Village,
} from '../types/umkm';
import { ComputedDashboardAnalytics, formatIDR } from '../utils/analytics';

export type PrintDatasetType = 'umkm' | 'wilayah' | 'bazar';

interface CetakDataViewProps {
  umkmList: UMKMProfile[];
  villages: Village[];
  events: BazarEvent[];
  registrations: EventRegistration[];
  analytics: ComputedDashboardAnalytics;
  currentUser: AuthUser;
  permissions: RolePermissions;
  onRecordPrintAudit: (datasetLabel: string, rowCount: number) => void;
}

export const CetakDataView: React.FC<CetakDataViewProps> = ({
  umkmList,
  villages,
  events,
  registrations,
  analytics,
  currentUser,
  permissions,
  onRecordPrintAudit,
}) => {
  const [datasetType, setDatasetType] = useState<PrintDatasetType>('umkm');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [villageFilter, setVillageFilter] = useState<string>(
    permissions.scopedVillageId ?? 'all'
  );
  const [stageFilter, setStageFilter] = useState<BusinessStage | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CurationStatus | 'all'>('all');
  const [nibFilter, setNibFilter] = useState<'all' | 'has_nib' | 'no_nib'>('all');

  React.useEffect(() => {
    setVillageFilter(permissions.scopedVillageId ?? 'all');
  }, [permissions.scopedVillageId]);

  const villageMap = useMemo(() => {
    const map = new Map<string, Village>();
    villages.forEach((v) => map.set(v.id, v));
    return map;
  }, [villages]);

  const umkmMap = useMemo(() => {
    const map = new Map<string, UMKMProfile>();
    umkmList.forEach((u) => map.set(u.id, u));
    return map;
  }, [umkmList]);

  const effectiveVillageFilter = permissions.scopedVillageId ?? villageFilter;

  const filteredUmkm = useMemo(() => {
    return umkmList.filter((u) => {
      if (effectiveVillageFilter !== 'all' && u.villageId !== effectiveVillageFilter) {
        return false;
      }
      if (stageFilter !== 'all' && u.businessStage !== stageFilter) return false;
      if (statusFilter !== 'all' && u.curationStatus !== statusFilter) return false;
      if (nibFilter === 'has_nib' && !u.certifications.hasNib) return false;
      if (nibFilter === 'no_nib' && u.certifications.hasNib) return false;
      return true;
    });
  }, [umkmList, effectiveVillageFilter, stageFilter, statusFilter, nibFilter]);

  const filteredVillageStats = useMemo(() => {
    if (effectiveVillageFilter === 'all') return analytics.villageMetrics;
    return analytics.villageMetrics.filter(
      (stat) => stat.village.id === effectiveVillageFilter
    );
  }, [analytics.villageMetrics, effectiveVillageFilter]);

  const bazarRows = useMemo(() => {
    const rows: {
      event: BazarEvent;
      filled: number;
      registration?: EventRegistration;
      umkm?: UMKMProfile;
      village?: Village;
    }[] = [];

    events.forEach((evt) => {
      const evtRegs = registrations.filter((r) => r.eventId === evt.id);
      if (evtRegs.length === 0) {
        rows.push({ event: evt, filled: 0 });
      } else {
        evtRegs.forEach((reg) => {
          const u = umkmMap.get(reg.umkmId);
          if (effectiveVillageFilter !== 'all' && u?.villageId !== effectiveVillageFilter) {
            return;
          }
          rows.push({
            event: evt,
            filled: evtRegs.length,
            registration: reg,
            umkm: u,
            village: u ? villageMap.get(u.villageId) : undefined,
          });
        });
      }
    });

    return rows;
  }, [events, registrations, umkmMap, villageMap, effectiveVillageFilter]);

  const activeRowCount =
    datasetType === 'umkm'
      ? filteredUmkm.length
      : datasetType === 'wilayah'
        ? filteredVillageStats.length
        : bazarRows.length;

  const selectedVillageLabel = useMemo(() => {
    if (effectiveVillageFilter === 'all') return 'Semua 13 Desa & 6 Kelurahan';
    const v = villageMap.get(effectiveVillageFilter);
    return v ? `${v.regionType} ${v.name}` : 'Wilayah Terpilih';
  }, [effectiveVillageFilter, villageMap]);

  const totalUmkmRevenue = useMemo(
    () => filteredUmkm.reduce((acc, u) => acc + u.estMonthlyRevenue, 0),
    [filteredUmkm]
  );

  const documentTitle =
    datasetType === 'umkm'
      ? 'Daftar Data Pelaku UMKM, Produk & Sertifikasi Legalitas'
      : datasetType === 'wilayah'
        ? 'Rekapitulasi Sebaran UMKM & Legalitas per Kelurahan/Desa'
        : 'Laporan Agenda Bazar, Pelatihan & Peserta Teralokasi';

  const handleTriggerPrintPdf = () => {
    onRecordPrintAudit(documentTitle, activeRowCount);
    window.print();
  };

  const todayDisplay = '17 November 2026';

  return (
    <div className="space-y-5">
      {/* Dynamic Print Page Orientation Rule */}
      <style media="print">
        {orientation === 'landscape'
          ? '@page { size: A4 landscape; margin: 10mm 12mm; }'
          : '@page { size: A4 portrait; margin: 12mm 14mm; }'}
      </style>

      {/* Toolbar Kontrol Cetak (Disembunyikan saat Print/PDF) */}
      <section className="no-print bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-[#1E3A8A] flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cetak / Print Halaman Data (Format Tabel PDF)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih jenis data, terapkan filter wilayah atau legalitas, lalu klik{' '}
                <strong>Cetak / Simpan Tabel PDF</strong> untuk menyimpan sebagai dokumen PDF resmi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  orientation === 'landscape'
                    ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Landscape
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  orientation === 'portrait'
                    ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Portrait
              </button>
            </div>

            <button
              type="button"
              onClick={handleTriggerPrintPdf}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan Tabel PDF</span>
            </button>
          </div>
        </div>

        {/* Pilihan Dataset Tabel */}
        <div className="pt-3 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setDatasetType('umkm')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                datasetType === 'umkm'
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              Data UMKM &amp; Legalitas ({filteredUmkm.length})
            </button>
            <button
              type="button"
              onClick={() => setDatasetType('wilayah')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                datasetType === 'wilayah'
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Rekap 19 Kelurahan/Desa ({filteredVillageStats.length})
            </button>
            <button
              type="button"
              onClick={() => setDatasetType('bazar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                datasetType === 'bazar'
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Data Bazar &amp; Peserta ({bazarRows.length})
            </button>
          </div>

          {/* Filter Data Sebelum Cetak */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>

            <select
              value={effectiveVillageFilter}
              disabled={Boolean(permissions.scopedVillageId)}
              onChange={(e) => setVillageFilter(e.target.value)}
              aria-label="Filter wilayah cetak"
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] disabled:opacity-75"
            >
              <option value="all">Semua 19 Kelurahan/Desa</option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.regionType === 'Kelurahan' ? 'Kel.' : 'Desa'} {v.name}
                </option>
              ))}
            </select>

            {datasetType === 'umkm' && (
              <>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as BusinessStage | 'all')}
                  aria-label="Filter tahap pembinaan cetak"
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="all">Semua Tahap</option>
                  <option value="Rintisan">Rintisan</option>
                  <option value="Berkembang">Berkembang</option>
                  <option value="Siap Naik Kelas">Siap Naik Kelas</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as CurationStatus | 'all')}
                  aria-label="Filter status kurasi cetak"
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="all">Semua Status Kurasi</option>
                  <option value="Approved">Approved (Tayang Publik)</option>
                  <option value="Menunggu Kurasi">Menunggu Kurasi</option>
                  <option value="Perlu Revisi">Perlu Revisi</option>
                </select>

                <select
                  value={nibFilter}
                  onChange={(e) =>
                    setNibFilter(e.target.value as 'all' | 'has_nib' | 'no_nib')
                  }
                  aria-label="Filter status NIB cetak"
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="all">Semua Status NIB</option>
                  <option value="has_nib">Sudah Memiliki NIB</option>
                  <option value="no_nib">Belum Memiliki NIB</option>
                </select>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Lembar Pratinjau & Cetak PDF Resmi */}
      <article className="print-only-container bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-sm text-slate-900">
        {/* Kop Surat Resmi */}
        <header className="border-b-[3px] border-double border-slate-900 pb-3.5 text-center">
          <div className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-700">
            Pemerintah Kabupaten Sidoarjo
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-wide uppercase text-[#1E3A8A] mt-0.5">
            Kecamatan Porong — Seksi Perekonomian
          </h1>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Jl. Bhayangkara No. 1, Porong, Kabupaten Sidoarjo 61274 · SIPANDA UMKM PORONG — Bersama
            Membangun UMKM yang Mandiri dan Berdaya Saing
          </p>
        </header>

        {/* Judul & Metadata Dokumen Tabel */}
        <div className="mt-4 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1E3A8A]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Dokumen Cetak Data Tabel (PDF)</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase mt-0.5">
              {documentTitle}
            </h2>
          </div>

          <div className="text-[11px] text-slate-600 sm:text-right tabular-nums space-y-0.5">
            <div>
              Wilayah: <strong className="text-slate-900">{selectedVillageLabel}</strong> · Total:{' '}
              <strong className="text-slate-900">{activeRowCount} baris</strong>
            </div>
            <div>
              Tanggal Cetak: <strong className="text-slate-900">{todayDisplay}</strong> · Pencetak:{' '}
              <strong className="text-slate-900">{currentUser.name}</strong>
            </div>
          </div>
        </div>

        {/* TABEL 1: Data UMKM & Legalitas */}
        {datasetType === 'umkm' && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="py-2 px-2 border border-slate-400 text-center w-8">No</th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Nama Usaha &amp; Pemilik
                  </th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Kelurahan / Desa
                  </th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Produk &amp; Klaster Sektor
                  </th>
                  <th className="py-2 px-2 border border-slate-400 text-left">Tahap</th>
                  <th className="py-2 px-2 border border-slate-400 text-center">NIB</th>
                  <th className="py-2 px-2 border border-slate-400 text-center">Halal</th>
                  <th className="py-2 px-2 border border-slate-400 text-center">P-IRT</th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">WhatsApp</th>
                  {permissions.canViewSensitiveData && (
                    <th className="py-2 px-2.5 border border-slate-400 text-right">
                      Est. Omzet / Bln
                    </th>
                  )}
                  <th className="py-2 px-2 border border-slate-400 text-left">Status Kurasi</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {filteredUmkm.length === 0 ? (
                  <tr>
                    <td
                      colSpan={permissions.canViewSensitiveData ? 11 : 10}
                      className="py-8 text-center text-slate-500 border border-slate-400"
                    >
                      Tidak ada data UMKM yang sesuai filter cetak.
                    </td>
                  </tr>
                ) : (
                  filteredUmkm.map((u, idx) => {
                    const v = villageMap.get(u.villageId);
                    return (
                      <tr key={u.id} className="even:bg-slate-50/60">
                        <td className="py-1.5 px-2 border border-slate-400 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2.5 border border-slate-400">
                          <div className="font-bold text-slate-900">{u.businessName}</div>
                          <div className="text-[10px] text-slate-600">{u.ownerName}</div>
                        </td>
                        <td className="py-1.5 px-2.5 border border-slate-400 whitespace-nowrap">
                          {v ? `${v.regionType === 'Kelurahan' ? 'Kel.' : 'Desa'} ${v.name}` : '-'}
                        </td>
                        <td className="py-1.5 px-2.5 border border-slate-400">
                          <div className="font-medium text-slate-900">{u.productTitle}</div>
                          <div className="text-[10px] text-slate-600">{u.category}</div>
                        </td>
                        <td className="py-1.5 px-2 border border-slate-400 whitespace-nowrap">
                          {u.businessStage}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-400 text-center font-mono">
                          {u.certifications.hasNib ? 'Ya' : '-'}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-400 text-center font-mono">
                          {u.certifications.hasHalal ? 'Ya' : '-'}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-400 text-center font-mono">
                          {u.certifications.hasPirt ? 'Ya' : '-'}
                        </td>
                        <td className="py-1.5 px-2.5 border border-slate-400 font-mono whitespace-nowrap">
                          +{u.whatsapp}
                        </td>
                        {permissions.canViewSensitiveData && (
                          <td className="py-1.5 px-2.5 border border-slate-400 text-right font-mono whitespace-nowrap">
                            {formatIDR(u.estMonthlyRevenue)}
                          </td>
                        )}
                        <td className="py-1.5 px-2 border border-slate-400 whitespace-nowrap font-semibold">
                          {u.curationStatus}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredUmkm.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 tabular-nums">
                    <td colSpan={5} className="py-2 px-2.5 border border-slate-400 text-right">
                      TOTAL ({filteredUmkm.length} UMKM):
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">
                      {filteredUmkm.filter((u) => u.certifications.hasNib).length}
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">
                      {filteredUmkm.filter((u) => u.certifications.hasHalal).length}
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-center font-mono">
                      {filteredUmkm.filter((u) => u.certifications.hasPirt).length}
                    </td>
                    <td className="py-2 px-2.5 border border-slate-400 text-center text-[10px]">
                      Tayang: {filteredUmkm.filter((u) => u.curationStatus === 'Approved').length}
                    </td>
                    {permissions.canViewSensitiveData && (
                      <td className="py-2 px-2.5 border border-slate-400 text-right font-mono whitespace-nowrap">
                        {formatIDR(totalUmkmRevenue)}
                      </td>
                    )}
                    <td className="py-2 px-2 border border-slate-400" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* TABEL 2: Rekapitulasi 19 Kelurahan/Desa */}
        {datasetType === 'wilayah' && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="py-2 px-2 border border-slate-400 text-center w-8">No</th>
                  <th className="py-2 px-2 border border-slate-400 text-left">Kode Wilayah</th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Nama Kelurahan / Desa
                  </th>
                  <th className="py-2 px-2 border border-slate-400 text-left">Jenis</th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">PIC Wilayah</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">Target</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">UMKM Terdata</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">Punya NIB</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">Rasio NIB</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">Halal</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">P-IRT</th>
                  <th className="py-2 px-2 border border-slate-400 text-right">Tayang Publik</th>
                  {permissions.canViewSensitiveData && (
                    <th className="py-2 px-2.5 border border-slate-400 text-right">
                      Akumulasi Omzet / Bln
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {filteredVillageStats.map((stat, idx) => (
                  <tr key={stat.village.id} className="even:bg-slate-50/60">
                    <td className="py-1.5 px-2 border border-slate-400 text-center font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 font-mono">
                      {stat.village.code}
                    </td>
                    <td className="py-1.5 px-2.5 border border-slate-400 font-bold text-slate-900">
                      {stat.village.name}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400">
                      {stat.village.regionType}
                    </td>
                    <td className="py-1.5 px-2.5 border border-slate-400">
                      {stat.village.picName}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono">
                      {stat.village.targetUmkm}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono font-bold">
                      {stat.totalUmkm}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono">
                      {stat.nibCount}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono font-semibold">
                      {stat.nibRatio.toFixed(0)}%
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono">
                      {stat.halalCount}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono">
                      {stat.pirtCount}
                    </td>
                    <td className="py-1.5 px-2 border border-slate-400 text-right font-mono">
                      {stat.approvedCount}
                    </td>
                    {permissions.canViewSensitiveData && (
                      <td className="py-1.5 px-2.5 border border-slate-400 text-right font-mono whitespace-nowrap">
                        {formatIDR(stat.totalRevenue)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {filteredVillageStats.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 tabular-nums">
                    <td colSpan={5} className="py-2 px-2.5 border border-slate-400 text-right">
                      TOTAL ({filteredVillageStats.length} WILAYAH):
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-right font-mono">
                      {filteredVillageStats.reduce((s, x) => s + x.village.targetUmkm, 0)}
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-right font-mono">
                      {filteredVillageStats.reduce((s, x) => s + x.totalUmkm, 0)}
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-right font-mono">
                      {filteredVillageStats.reduce((s, x) => s + x.nibCount, 0)}
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-right font-mono">
                      {(() => {
                        const totU = filteredVillageStats.reduce((s, x) => s + x.totalUmkm, 0);
                        const totN = filteredVillageStats.reduce((s, x) => s + x.nibCount, 0);
                        return totU > 0 ? `${((totN / totU) * 100).toFixed(0)}%` : '0%';
                      })()}
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-right font-mono">
                      {filteredVillageStats.reduce((s, x) => s + x.halalCount, 0)}
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-right font-mono">
                      {filteredVillageStats.reduce((s, x) => s + x.pirtCount, 0)}
                    </td>
                    <td className="py-2 px-2 border border-slate-400 text-right font-mono">
                      {filteredVillageStats.reduce((s, x) => s + x.approvedCount, 0)}
                    </td>
                    {permissions.canViewSensitiveData && (
                      <td className="py-2 px-2.5 border border-slate-400 text-right font-mono whitespace-nowrap">
                        {formatIDR(
                          filteredVillageStats.reduce((s, x) => s + x.totalRevenue, 0)
                        )}
                      </td>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* TABEL 3: Data Agenda Bazar & Peserta */}
        {datasetType === 'bazar' && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="py-2 px-2 border border-slate-400 text-center w-8">No</th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Agenda Kegiatan &amp; Kategori
                  </th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Jadwal &amp; Lokasi
                  </th>
                  <th className="py-2 px-2 border border-slate-400 text-center">Okupansi</th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Peserta UMKM Teralokasi
                  </th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Kelurahan / Desa
                  </th>
                  <th className="py-2 px-2.5 border border-slate-400 text-left">
                    Kebutuhan Fasilitas
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {bazarRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-slate-500 border border-slate-400"
                    >
                      Tidak ada data peserta bazar pada wilayah terpilih.
                    </td>
                  </tr>
                ) : (
                  bazarRows.map((row, idx) => (
                    <tr
                      key={`${row.event.id}-${row.registration?.id ?? 'empty'}`}
                      className="even:bg-slate-50/60"
                    >
                      <td className="py-1.5 px-2 border border-slate-400 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5 border border-slate-400">
                        <div className="font-bold text-slate-900">{row.event.title}</div>
                        <div className="text-[10px] text-slate-600">{row.event.category}</div>
                      </td>
                      <td className="py-1.5 px-2.5 border border-slate-400">
                        <div>{row.event.scheduleText}</div>
                        <div className="text-[10px] text-slate-600">{row.event.location}</div>
                      </td>
                      <td className="py-1.5 px-2 border border-slate-400 text-center font-mono whitespace-nowrap">
                        {row.filled}/{row.event.maxCapacity} {row.event.unitLabel}
                      </td>
                      <td className="py-1.5 px-2.5 border border-slate-400">
                        {row.umkm ? (
                          <>
                            <div className="font-bold text-slate-900">{row.umkm.businessName}</div>
                            <div className="text-[10px] text-slate-600">
                              {row.umkm.ownerName} · {row.umkm.productTitle}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada peserta</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2.5 border border-slate-400 whitespace-nowrap">
                        {row.village
                          ? `${row.village.regionType === 'Kelurahan' ? 'Kel.' : 'Desa'} ${row.village.name}`
                          : '-'}
                      </td>
                      <td className="py-1.5 px-2.5 border border-slate-400">
                        {row.registration?.facilityRequest ?? '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pengesahan Cetak */}
        <footer className="mt-8 pt-4 flex justify-end">
          <div className="text-xs text-left w-64 space-y-12">
            <div>
              <div>Porong, {todayDisplay}</div>
              <div className="font-semibold">Dicetak oleh ({currentUser.roleLabel}),</div>
              <div className="text-[11px] text-slate-600">{currentUser.unit}</div>
            </div>
            <div>
              <div className="font-bold underline underline-offset-2">{currentUser.name}</div>
              <div className="text-[11px] text-slate-600">{currentUser.position}</div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};
