import React, { useState } from 'react';
import { Check, Copy, FileText, Printer } from 'lucide-react';
import { ComputedDashboardAnalytics, formatCompactIDR } from '../utils/analytics';

interface ManagementBriefProps {
  analytics: ComputedDashboardAnalytics;
  reportPeriod: string;
  onChangeReportPeriod: (val: string) => void;
}

export const ManagementBrief: React.FC<ManagementBriefProps> = ({
  analytics,
  reportPeriod,
  onChangeReportPeriod,
}) => {
  const [copied, setCopied] = useState(false);

  const todayDisplay = '17 November 2026';

  const lowNibText =
    analytics.lowNibVillages.length > 0
      ? analytics.lowNibVillages
          .map((v) => `${v.village.regionType} ${v.village.name} (${v.nibRatio.toFixed(0)}%)`)
          .join(', ')
      : 'Tidak ada wilayah di bawah ambang batas 50%';

  const topClusterText = analytics.topCluster
    ? `${analytics.topCluster.category} (${analytics.topClusterShare.toFixed(0)}% minat katalog WA)`
    : '-';

  const buildPlainTextBrief = () => {
    return [
      'PEMERINTAH KABUPATEN SIDOARJO',
      'KECAMATAN PORONG — SEKSI PEREKONOMIAN',
      'Jl. Bhayangkara No. 1, Porong, Kab. Sidoarjo 61274',
      '================================================================',
      `MANAGEMENT BRIEF PEMBINAAN & PEMASARAN UMKM`,
      `Periode Laporan : ${reportPeriod}`,
      `Tanggal Cetak   : ${todayDisplay}`,
      `Kepada Yth.     : Camat Porong & Kepala Seksi Perekonomian`,
      '',
      '1. RINGKASAN EKSEKUTIF',
      `Hingga periode ${reportPeriod}, tercatat ${analytics.totalUmkm} pelaku UMKM aktif tersebar di 13 desa dan 6 kelurahan se-Kecamatan Porong. Sebanyak ${analytics.totalNib} UMKM (${analytics.nibRatio.toFixed(1)}%) telah memiliki NIB OSS-RBA aktif, dan ${analytics.approvedCount} produk (${analytics.approvedRatio.toFixed(1)}%) telah lolos kurasi mutu serta tayang pada Etalase Digital Publik SIPANDA UMKM PORONG. Akumulasi estimasi perputaran omzet seluruh klaster binaan mencapai ${formatCompactIDR(analytics.totalMonthlyRevenue)} per bulan.`,
      '',
      '2. SNAPSHOT KPI UTAMA',
      `- Total UMKM Terdata        : ${analytics.totalUmkm} UMKM (13 Desa & 6 Kelurahan)`,
      `- Kepemilikan NIB Aktif     : ${analytics.totalNib} UMKM (${analytics.nibRatio.toFixed(1)}%)`,
      `- Sertifikat Halal / P-IRT  : ${analytics.totalHalal} Halal / ${analytics.totalPirt} P-IRT`,
      `- Produk Tayang Etalase     : ${analytics.approvedCount} Produk (${analytics.approvedRatio.toFixed(1)}%)`,
      `- Estimasi Omzet / Bulan    : ${formatCompactIDR(analytics.totalMonthlyRevenue)}`,
      `- Partisipasi Agenda Bazar  : ${analytics.totalEvents} Agenda (${analytics.totalBoothFilled}/${analytics.totalBoothCapacity} Slot Terisi)`,
      '',
      '3. KENDALA & RISIKO LAPANGAN',
      `- Kesenjangan Legalitas Desa: Wilayah dengan rasio NIB di bawah 50% meliputi ${lowNibText}.`,
      `- Antrean Kurasi Mutu       : Terdapat ${analytics.pendingCurationCount} produk berstatus Menunggu Kurasi dan ${analytics.revisionCount} produk berstatus Perlu Revisi kemasan/foto.`,
      `- Kapasitas Booth Bazar     : Terdapat ${analytics.fullEventsCount} agenda berstatus Kuota Penuh (terkunci 100%) dan ${analytics.warningEventsCount} agenda dengan okupansi >=80%.`,
      '',
      '4. RENCANA TINDAK LANJUT',
      `a) Klinik Jemput Bola NIB OSS-RBA & P-IRT -> Sasaran: ${lowNibText} (Target: peningkatan rasio NIB minimal 70%).`,
      `b) Workshop Foto Produk Kemasan & WA Business -> Sasaran: UMKM tahap Rintisan & produk Perlu Revisi (Target: seluruh antrean kurasi lolos tayang etalase).`,
      `c) Rotasi Zona Booth Bazar & Prioritas Klaster -> Sasaran: Klaster ${topClusterText} & pemerataan peserta lintas 19 desa/kelurahan.`,
      '',
      `Porong, ${todayDisplay}`,
      'Penyusun,',
      'Staf Seksi Perekonomian Kecamatan Porong',
      'Imambang Eka Sulistya, SE',
    ].join('\n');
  };

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextBrief());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Toolbar Aksi (disembunyikan saat cetak A4) */}
      <section className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Generator Management Brief Pimpinan
            </h2>
            <p className="text-xs text-slate-500">
              Data terisi otomatis secara real-time dari direktori UMKM &amp; agenda bazar
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={reportPeriod}
            onChange={(e) => onChangeReportPeriod(e.target.value)}
            aria-label="Periode Pelaporan"
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
          <button
            type="button"
            onClick={handleCopyBrief}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                Teks Tersalin
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Salin Teks Brief
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Simpan PDF
          </button>
        </div>
      </section>

      {/* Dokumen Lembar A4 Resmi */}
      <article className="print-only-container bg-white border border-slate-200 rounded-xl p-6 sm:p-10 max-w-4xl mx-auto shadow-sm text-slate-900">
        {/* 1. Kop Surat Resmi Instansi */}
        <header className="border-b-[3px] border-double border-slate-900 pb-4 text-center">
          <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-700">
            Pemerintah Kabupaten Sidoarjo
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-wide uppercase text-[#1E3A8A] mt-0.5">
            Kecamatan Porong — Seksi Perekonomian
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-600 mt-1">
            Jl. Bhayangkara No. 1, Porong, Kabupaten Sidoarjo 61274 · Portal:
            umkm.porong.sidoarjokab.go.id
          </p>
        </header>

        {/* Identitas Dokumen */}
        <div className="mt-5 text-center">
          <h2 className="text-base font-bold uppercase tracking-wide underline underline-offset-4">
            Management Brief Pembinaan &amp; Pemasaran UMKM
          </h2>
          <div className="mt-2 text-xs text-slate-600">
            Periode Pelaporan: <strong className="text-slate-900">{reportPeriod}</strong> ·
            Kepada Yth. <strong>Camat Porong</strong>
          </div>
        </div>

        {/* 2. Ringkasan Eksekutif */}
        <section className="mt-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-slate-200 pb-1">
            1. Ringkasan Eksekutif
          </h3>
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 text-justify">
            Hingga periode <strong>{reportPeriod}</strong>, Seksi Perekonomian Kecamatan Porong
            telah menghimpun sebanyak{' '}
            <strong className="tabular-nums">{analytics.totalUmkm} pelaku UMKM aktif</strong> yang
            tersebar di 13 desa dan 6 kelurahan. Dari basis data tersebut, sebanyak{' '}
            <strong className="tabular-nums">
              {analytics.totalNib} UMKM ({analytics.nibRatio.toFixed(1)}%)
            </strong>{' '}
            telah memiliki Nomor Induk Berusaha (NIB OSS-RBA), dan sebanyak{' '}
            <strong className="tabular-nums">
              {analytics.approvedCount} produk unggulan ({analytics.approvedRatio.toFixed(1)}%)
            </strong>{' '}
            telah lolos kurasi mutu untuk tayang di Etalase Digital Publik SIPANDA UMKM PORONG dengan
            tautan transaksi langsung ke WhatsApp pelaku usaha tanpa komisi. Total estimasi
            perputaran omzet bulanan seluruh klaster binaan mencapai{' '}
            <strong className="tabular-nums">
              {formatCompactIDR(analytics.totalMonthlyRevenue)}
            </strong>
            .
          </p>
        </section>

        {/* 3. Snapshot KPI Utama */}
        <section className="mt-6 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-slate-200 pb-1">
            2. Snapshot Indikator Kinerja Utama (KPI)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="py-2 px-3 border border-slate-300 text-left font-bold">
                    Indikator Kinerja
                  </th>
                  <th className="py-2 px-3 border border-slate-300 text-right font-bold">
                    Capaian Aktual
                  </th>
                  <th className="py-2 px-3 border border-slate-300 text-left font-bold">
                    Keterangan Operasional
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-medium">
                    Total UMKM Terdata
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-right font-bold font-mono">
                    {analytics.totalUmkm} UMKM
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-slate-600">
                    Cakupan 13 Desa &amp; 6 Kelurahan se-Kecamatan Porong
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-medium">
                    Legalitas / NIB Aktif
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-right font-bold font-mono">
                    {analytics.totalNib} ({analytics.nibRatio.toFixed(1)}%)
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-slate-600">
                    Sertifikat Halal: {analytics.totalHalal} UMKM · Izin P-IRT:{' '}
                    {analytics.totalPirt} UMKM
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-medium">
                    Produk Lolos Kurasi Etalase
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-right font-bold font-mono">
                    {analytics.approvedCount} ({analytics.approvedRatio.toFixed(1)}%)
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-slate-600">
                    {analytics.pendingCurationCount} menunggu kurasi ·{' '}
                    {analytics.revisionCount} perlu revisi
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-medium">
                    Estimasi Omzet Agregat / Bulan
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-right font-bold font-mono">
                    {formatCompactIDR(analytics.totalMonthlyRevenue)}
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-slate-600">
                    Total interaksi pemesanan WhatsApp katalog: {analytics.totalWaClicks} klik
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-medium">
                    Fasilitasi Bazar &amp; Pelatihan
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-right font-bold font-mono">
                    {analytics.totalEvents} Agenda ({analytics.totalBoothFilled}/
                    {analytics.totalBoothCapacity} Slot)
                  </td>
                  <td className="py-2 px-3 border border-slate-300 text-slate-600">
                    {analytics.fullEventsCount} agenda kuota penuh (terkunci otomatis)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Kendala & Risiko Lapangan */}
        <section className="mt-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-slate-200 pb-1">
            3. Kendala &amp; Risiko Lapangan
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
            <li>
              <strong>Kesenjangan Kepemilikan NIB Wilayah:</strong> Wilayah dengan rasio kepemilikan
              NIB terendah di bawah ambang 50% adalah <strong>{lowNibText}</strong> sehingga
              memerlukan intervensi jemput bola perizinan OSS-RBA.
            </li>
            <li>
              <strong>Standardisasi Foto &amp; Kemasan Rintisan:</strong> Masih terdapat{' '}
              <strong>{analytics.revisionCount} produk berstatus Perlu Revisi</strong> karena
              pencahayaan foto belum standar serta pencantuman informasi berat bersih/kedaluwarsa
              pada label kemasan yang belum seragam, ditambah{' '}
              <strong>{analytics.pendingCurationCount} produk dalam antrean kurasi</strong>.
            </li>
            <li>
              <strong>Keterbatasan Kuota Booth Pameran:</strong> Tingginya minat pelaku usaha
              menyebabkan <strong>{analytics.fullEventsCount} agenda mencapai okupansi 100%</strong>{' '}
              dan <strong>{analytics.warningEventsCount} agenda di atas 80%</strong> sehingga perlu
              pengaturan rotasi peserta antar-desa secara adil.
            </li>
          </ul>
        </section>

        {/* 5. Rencana Tindak Lanjut */}
        <section className="mt-6 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] border-b border-slate-200 pb-1">
            4. Rencana Tindak Lanjut Seksi Perekonomian
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="py-2 px-3 border border-slate-300 text-left font-bold">
                    Program Intervensi
                  </th>
                  <th className="py-2 px-3 border border-slate-300 text-left font-bold">
                    Sasaran Wilayah / Klaster
                  </th>
                  <th className="py-2 px-3 border border-slate-300 text-left font-bold">
                    Target Output
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-semibold">
                    Klinik Jemput Bola NIB OSS-RBA &amp; P-IRT
                  </td>
                  <td className="py-2 px-3 border border-slate-300">{lowNibText}</td>
                  <td className="py-2 px-3 border border-slate-300">
                    Penerbitan NIB &amp; pendampingan P-IRT hingga rasio wilayah ≥70%
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-semibold">
                    Workshop Foto Produk &amp; WA Business
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    UMKM Rintisan &amp; {analytics.revisionCount} produk berstatus Revisi
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    100% antrean kurasi terselesaikan &amp; siap tayang di etalase publik
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border border-slate-300 font-semibold">
                    Rotasi Zona Booth Bazar &amp; Kurasi Kabupaten
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    Klaster {topClusterText} &amp; pemerataan 19 wilayah
                  </td>
                  <td className="py-2 px-3 border border-slate-300">
                    Pemerataan slot pameran kecamatan dan seleksi peserta pameran kabupaten
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Pengesahan Penyusun */}
        <footer className="mt-10 pt-4 flex justify-end">
          <div className="text-xs text-left w-64 space-y-14">
            <div>
              <div>Porong, {todayDisplay}</div>
              <div className="font-semibold">Penyusun,</div>
              <div>Staf Seksi Perekonomian Kecamatan Porong</div>
            </div>
            <div>
              <div className="font-bold underline underline-offset-2">
                Imambang Eka Sulistya, SE
              </div>
              <div className="text-[11px] text-slate-600">
                Seksi Perekonomian · Kec. Porong, Kab. Sidoarjo
              </div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};
