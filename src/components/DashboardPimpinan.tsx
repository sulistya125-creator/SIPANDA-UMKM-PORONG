import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Building,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react';
import { ComputedDashboardAnalytics, formatCompactIDR, formatIDR } from '../utils/analytics';
import { CurationStatus, MenuKey } from '../types/umkm';

interface DashboardPimpinanProps {
  analytics: ComputedDashboardAnalytics;
  onNavigate: (menu: MenuKey) => void;
  onNavigateCurationQueue: (status: CurationStatus) => void;
  onNavigateEtalaseByVillage: (villageId: string) => void;
}

type VillageFilterMode = 'all' | 'Desa' | 'Kelurahan' | 'risk';

export const DashboardPimpinan: React.FC<DashboardPimpinanProps> = ({
  analytics,
  onNavigate,
  onNavigateCurationQueue,
  onNavigateEtalaseByVillage,
}) => {
  const [villageFilter, setVillageFilter] = useState<VillageFilterMode>('all');
  const [hoveredVillageId, setHoveredVillageId] = useState<string | null>(null);

  const filteredVillages = analytics.villageMetrics.filter((vm) => {
    if (villageFilter === 'Desa') return vm.village.regionType === 'Desa';
    if (villageFilter === 'Kelurahan') return vm.village.regionType === 'Kelurahan';
    if (villageFilter === 'risk') return vm.isLowNibRisk;
    return true;
  });

  const maxUmkmInChart = Math.max(
    ...filteredVillages.map((v) => v.totalUmkm),
    1
  );

  const sectorColors = [
    '#1E3A8A',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#64748B',
  ];

  return (
    <div className="space-y-6">
      {/* 5 Kartu KPI Utama */}
      <section aria-label="Ringkasan Kinerja Utama">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {/* KPI 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">
                Total UMKM Terdata
              </span>
              <Building className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {analytics.totalUmkm} <span className="text-sm font-medium text-slate-500">UMKM</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                13 Desa &amp; 6 Kelurahan aktif
              </p>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">
                Legalitas / NIB Aktif
              </span>
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {analytics.totalNib}{' '}
                <span className="text-sm font-semibold text-[#10B981]">
                  ({analytics.nibRatio.toFixed(1)}%)
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(analytics.nibRatio, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">
                Siap Marketplace / Etalase
              </span>
              <Store className="w-4 h-4 text-[#F59E0B] shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {analytics.approvedCount}{' '}
                <span className="text-sm font-semibold text-[#1E3A8A]">
                  ({analytics.approvedRatio.toFixed(1)}%)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateCurationQueue('Menunggu Kurasi')}
                className="mt-1 text-xs font-medium text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
              >
                {analytics.pendingCurationCount} antrean kurasi
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">
                Estimasi Omzet / Bulan
              </span>
              <TrendingUp className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatCompactIDR(analytics.totalMonthlyRevenue)}
              </div>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                {analytics.totalWaClicks} klik minat pesan WhatsApp
              </p>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">
                Agenda Bazar &amp; Pelatihan
              </span>
              <CalendarDays className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {analytics.totalEvents}{' '}
                <span className="text-sm font-medium text-slate-500">
                  Agenda ({analytics.totalBoothFilled}/{analytics.totalBoothCapacity} Slot)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('bazar')}
                className="mt-1 text-xs font-medium text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
              >
                Kelola alokasi kuota
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insight & Rekomendasi Otomatis */}
      <section aria-label="AI Insight dan Rekomendasi Kebijakan">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  AI Insight &amp; Rekomendasi Otomatis Perekonomian
                </h2>
                <p className="text-xs text-slate-500">
                  Analisis berbasis aturan langsung dari data 19 desa/kelurahan, legalitas NIB, dan antrean kurasi
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('brief')}
              className="text-xs font-semibold text-[#1E3A8A] hover:text-blue-950 inline-flex items-center gap-1 whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              Lihat di Management Brief
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Insight 1: Prioritas Pendampingan OSS */}
            <div className="p-4 rounded-lg bg-red-50/60 border border-red-200/80 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#EF4444]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Prioritas Pendampingan OSS-RBA</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {analytics.lowNibVillages.length > 0 ? (
                    <>
                      <span className="font-semibold text-slate-900">
                        {analytics.lowNibVillages
                          .map(
                            (v) =>
                              `${v.village.regionType} ${v.village.name} (${v.nibRatio.toFixed(0)}%)`
                          )
                          .join(' dan ')}
                      </span>{' '}
                      memiliki rasio kepemilikan NIB di bawah ambang batas 50%. Direkomendasikan
                      penjadwalan Klinik Jemput Bola NIB &amp; P-IRT di balai desa setempat.
                    </>
                  ) : (
                    <>
                      Seluruh 19 desa &amp; kelurahan saat ini telah melampaui ambang batas 50%
                      kepemilikan NIB. Pertahankan pembinaan lanjutan sertifikasi Halal &amp; P-IRT.
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('bazar')}
                className="text-xs font-semibold text-red-700 hover:text-red-900 inline-flex items-center gap-1 w-fit"
              >
                Alokasikan Klinik NIB
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Insight 2: Produk Unggulan Bazar */}
            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#047857]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Klaster Unggulan &amp; Minat Pasar</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {analytics.topCluster ? (
                    <>
                      Klaster{' '}
                      <span className="font-semibold text-slate-900">
                        {analytics.topCluster.category}
                      </span>{' '}
                      menyumbang{' '}
                      <span className="font-semibold tabular-nums">
                        {analytics.topClusterShare.toFixed(0)}%
                      </span>{' '}
                      minat pembeli katalog ({analytics.topCluster.waClicks} klik WA) dengan{' '}
                      <span className="font-semibold tabular-nums">
                        {analytics.topCluster.fullCertCount} usaha
                      </span>{' '}
                      berizin lengkap untuk prioritas pameran kabupaten.
                    </>
                  ) : (
                    'Belum ada data interaksi klaster produk.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('etalase')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 w-fit"
              >
                Tinjau Etalase Publik
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Insight 3: Antrean Kurasi Digital */}
            <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <ClipboardList className="w-4 h-4 shrink-0" />
                  <span>Rekomendasi Kurasi &amp; Revisi</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  Terdapat{' '}
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {analytics.pendingCurationCount} produk Menunggu Kurasi
                  </span>{' '}
                  dan{' '}
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {analytics.revisionCount} produk Perlu Revisi
                  </span>
                  . Segera tinjau kelayakan foto dan kemasan agar dapat tayang di etalase publik.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateCurationQueue('Menunggu Kurasi')}
                className="text-xs font-semibold text-amber-900 hover:text-amber-950 inline-flex items-center gap-1 w-fit"
              >
                Proses Antrean Kurasi
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Visualisasi Grafik Utama: Sebaran Desa vs NIB + Komposisi Sektor */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Grafik 1: Perbandingan UMKM vs NIB per Desa/Kelurahan */}
        <section
          className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-5"
          aria-label="Grafik Sebaran UMKM dan NIB per Wilayah"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Sebaran UMKM vs Kepemilikan NIB (19 Wilayah)
              </h2>
              <p className="text-xs text-slate-500">
                Klik wilayah untuk melihat produk terkurasi; wilayah dengan rasio NIB &lt;50% ditandai merah
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
              {(
                [
                  { id: 'all', label: 'Semua (19)' },
                  { id: 'Desa', label: '13 Desa' },
                  { id: 'Kelurahan', label: '6 Kel.' },
                  { id: 'risk', label: 'NIB <50%' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVillageFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    villageFilter === tab.id
                      ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#1E3A8A]" />
              Total UMKM Terdata
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#10B981]" />
              Memiliki NIB (≥50%)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#EF4444]" />
              Prioritas Klinik NIB (&lt;50%)
            </span>
          </div>

          {/* Bars List */}
          <div className="mt-4 space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
            {filteredVillages.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                Tidak ada wilayah dengan rasio NIB di bawah 50%.
              </div>
            ) : (
              filteredVillages.map((vm) => {
                const totalWidthPct = (vm.totalUmkm / maxUmkmInChart) * 100;
                const nibWidthPct = (vm.nibCount / maxUmkmInChart) * 100;
                const isHovered = hoveredVillageId === vm.village.id;

                return (
                  <button
                    key={vm.village.id}
                    type="button"
                    onMouseEnter={() => setHoveredVillageId(vm.village.id)}
                    onMouseLeave={() => setHoveredVillageId(null)}
                    onClick={() => onNavigateEtalaseByVillage(vm.village.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors border ${
                      isHovered
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-transparent border-transparent hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-slate-800 truncate">
                          {vm.village.regionType === 'Kelurahan' ? 'Kel.' : 'Desa'} {vm.village.name}
                        </span>
                        {vm.isLowNibRisk && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-50 text-[#EF4444] border border-red-200 rounded shrink-0">
                            Prioritas OSS
                          </span>
                        )}
                      </div>
                      <div className="font-mono tabular-nums text-slate-600 shrink-0">
                        <span className="font-semibold text-slate-900">{vm.nibCount}</span>/{vm.totalUmkm} NIB{' '}
                        <span
                          className={`ml-1 font-semibold ${
                            vm.isLowNibRisk ? 'text-[#EF4444]' : 'text-[#10B981]'
                          }`}
                        >
                          ({vm.nibRatio.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    {/* Paired Stacked/Overlaid Bars */}
                    <div className="relative h-4 bg-slate-100 rounded overflow-hidden">
                      {/* Total UMKM Bar */}
                      <div
                        className="absolute inset-y-0 left-0 bg-[#1E3A8A]/25 rounded transition-all duration-300"
                        style={{ width: `${Math.max(totalWidthPct, vm.totalUmkm > 0 ? 8 : 0)}%` }}
                      />
                      {/* NIB Owned Bar */}
                      <div
                        className={`absolute inset-y-0 left-0 rounded transition-all duration-300 ${
                          vm.isLowNibRisk ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${Math.max(nibWidthPct, vm.nibCount > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Grafik 2: Komposisi 5 Sektor Usaha */}
        <section
          className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
          aria-label="Grafik Komposisi Sektor Usaha"
        >
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Komposisi 5 Klaster Sektor Usaha
              </h2>
              <p className="text-xs text-slate-500">
                Distribusi unit UMKM, estimasi omzet, dan ketertarikan pembeli katalog
              </p>
            </div>

            {/* Proportional Multi-segment Strip */}
            <div className="mt-4">
              <div className="h-4 w-full rounded-md overflow-hidden flex bg-slate-100">
                {analytics.sectorMetrics.map((sec, idx) => (
                  <div
                    key={sec.category}
                    style={{
                      width: `${sec.percentage}%`,
                      backgroundColor: sectorColors[idx % sectorColors.length],
                    }}
                    title={`${sec.category}: ${sec.count} UMKM (${sec.percentage.toFixed(1)}%)`}
                    className="h-full transition-all duration-300 first:rounded-l-md last:rounded-r-md"
                  />
                ))}
              </div>
            </div>

            {/* Breakdown rows */}
            <div className="mt-5 space-y-4">
              {analytics.sectorMetrics.map((sec, idx) => {
                const color = sectorColors[idx % sectorColors.length];
                return (
                  <div key={sec.category} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 font-semibold text-slate-800 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate">{sec.category}</span>
                      </span>
                      <span className="font-mono tabular-nums text-slate-700 shrink-0">
                        {sec.count} unit ({sec.percentage.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${sec.percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                      <span>Omzet: {formatIDR(sec.totalRevenue)}/bln</span>
                      <span>
                        {sec.waClicks} klik WA · {sec.fullCertCount} berizin lengkap
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ringkasan Lencana Sertifikasi */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500">NIB OSS</div>
              <div className="mt-0.5 text-base font-bold text-[#1E3A8A] tabular-nums">
                {analytics.totalNib}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500">Halal</div>
              <div className="mt-0.5 text-base font-bold text-[#10B981] tabular-nums">
                {analytics.totalHalal}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500">P-IRT</div>
              <div className="mt-0.5 text-base font-bold text-amber-700 tabular-nums">
                {analytics.totalPirt}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
