import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Filter,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import { SectorCategory, UMKMProfile, Village } from '../types/umkm';
import { SECTOR_CATEGORIES } from '../data/mockPorongData';
import { buildWhatsAppOrderUrl, formatWhatsAppDisplay } from '../utils/analytics';
import { ProductArtwork } from './ProductArtwork';

interface EtalasePublikProps {
  umkmList: UMKMProfile[];
  villages: Village[];
  selectedVillageFilter: string;
  onChangeVillageFilter: (villageId: string) => void;
  onTrackWaClick: (umkmId: string) => void;
}

type CertFilter = 'all' | 'nib' | 'halal' | 'pirt';

export const EtalasePublik: React.FC<EtalasePublikProps> = ({
  umkmList,
  villages,
  selectedVillageFilter,
  onChangeVillageFilter,
  onTrackWaClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [certFilter, setCertFilter] = useState<CertFilter>('all');
  const [detailUmkm, setDetailUmkm] = useState<UMKMProfile | null>(null);

  const villageMap = useMemo(() => {
    const map = new Map<string, Village>();
    villages.forEach((v) => map.set(v.id, v));
    return map;
  }, [villages]);

  // NFR-04 & FR-03: Etalase Digital Publik HANYA menampilkan produk berstatus Approved
  const approvedProducts = useMemo(
    () => umkmList.filter((u) => u.curationStatus === 'Approved'),
    [umkmList]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return approvedProducts.filter((u) => {
      if (selectedVillageFilter !== 'all' && u.villageId !== selectedVillageFilter) {
        return false;
      }
      if (selectedCategory !== 'all' && u.category !== (selectedCategory as SectorCategory)) {
        return false;
      }
      if (certFilter === 'nib' && !u.certifications.hasNib) return false;
      if (certFilter === 'halal' && !u.certifications.hasHalal) return false;
      if (certFilter === 'pirt' && !u.certifications.hasPirt) return false;

      if (q) {
        const villageName = villageMap.get(u.villageId)?.name.toLowerCase() ?? '';
        const haystack =
          `${u.productTitle} ${u.businessName} ${u.ownerName} ${u.description} ${u.category} ${villageName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    approvedProducts,
    searchQuery,
    selectedVillageFilter,
    selectedCategory,
    certFilter,
    villageMap,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    onChangeVillageFilter('all');
    setSelectedCategory('all');
    setCertFilter('all');
  };

  const hasActiveFilter =
    searchQuery.trim() !== '' ||
    selectedVillageFilter !== 'all' ||
    selectedCategory !== 'all' ||
    certFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Banner Pengenalan Etalase Publik */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
            <Store className="w-4 h-4 text-[#F59E0B]" />
            <span>
              SIPANDA UMKM PORONG · Pusat Pemasaran, Pembinaan &amp; Pengembangan UMKM
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Etalase Digital SIPANDA UMKM PORONG — Produk Unggulan Terkurasi
          </h2>
          <p className="text-xs leading-relaxed text-slate-600">
            Menampilkan {approvedProducts.length} produk UMKM dari 13 desa &amp; 6 kelurahan binaan
            Seksi Perekonomian Kecamatan Porong.{' '}
            <span className="font-semibold text-[#1E3A8A]">
              Bersama Membangun UMKM yang Mandiri dan Berdaya Saing.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
          <div>
            <div className="text-[11px] text-slate-500">Produk Tayang</div>
            <div className="text-xl font-bold text-[#1E3A8A] tabular-nums">
              {approvedProducts.length}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] text-slate-500">Terverifikasi Halal</div>
            <div className="text-xl font-bold text-[#10B981] tabular-nums">
              {approvedProducts.filter((p) => p.certifications.hasHalal).length}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Multi-Kriteria */}
      <section
        aria-label="Filter Katalog Produk"
        className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk, nama usaha, atau komoditas..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white transition-colors"
            />
          </div>

          {/* Village Filter (13 Desa & 6 Kelurahan) */}
          <div className="md:col-span-4">
            <select
              value={selectedVillageFilter}
              onChange={(e) => onChangeVillageFilter(e.target.value)}
              aria-label="Filter Desa atau Kelurahan"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white transition-colors"
            >
              <option value="all">Semua Wilayah (13 Desa &amp; 6 Kelurahan)</option>
              <optgroup label="13 Desa">
                {villages
                  .filter((v) => v.regionType === 'Desa')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      Desa {v.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="6 Kelurahan">
                {villages
                  .filter((v) => v.regionType === 'Kelurahan')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      Kelurahan {v.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Sector Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter Kategori Produk"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white transition-colors"
            >
              <option value="all">Semua Sektor Usaha</option>
              {SECTOR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Certification Filter Segmented Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              Sertifikasi Legalitas:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'nib', label: 'Memiliki NIB' },
                  { id: 'halal', label: 'Bersertifikat Halal' },
                  { id: 'pirt', label: 'Izin P-IRT' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCertFilter(item.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    certFilter === item.id
                      ? 'bg-white text-[#1E3A8A] shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="tabular-nums">
              Menampilkan <strong className="text-slate-900">{filteredProducts.length}</strong> produk
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[#1E3A8A] font-semibold hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid Produk Etalase */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-bold text-slate-900">
            Tidak ada produk yang cocok dengan filter
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Coba ubah kata kunci pencarian, pilih wilayah desa/kelurahan lain, atau atur ulang
            filter sertifikasi.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            Tampilkan Semua Produk
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((item) => {
            const village = villageMap.get(item.villageId);
            const villageLabel = village
              ? `${village.regionType} ${village.name}`
              : 'Kec. Porong';
            const waUrl = buildWhatsAppOrderUrl(item, villageLabel);

            return (
              <article
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  {/* Gambar Ilustrasi Studio Produk */}
                  <div className="aspect-[16/10] w-full border-b border-slate-100">
                    <ProductArtwork
                      variant={item.artworkVariant}
                      title={item.productTitle}
                      className="h-full"
                    />
                  </div>

                  {/* Konten Kartu */}
                  <div className="p-4 space-y-3">
                    {/* Metadata tanpa kapsul/pill */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                      <span className="font-medium text-slate-700">{villageLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{item.category}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.productTitle}
                      </h3>
                      <div className="mt-0.5 text-xs font-medium text-slate-600">
                        {item.businessName} · {item.ownerName}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Lencana Sertifikasi Resmi (persegi bersih dengan label & ikon) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {item.certifications.hasNib && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-[#047857] border border-emerald-200 rounded">
                          <ShieldCheck className="w-3 h-3" />
                          NIB
                        </span>
                      )}
                      {item.certifications.hasHalal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-[#047857] border border-emerald-200 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Halal
                        </span>
                      )}
                      {item.certifications.hasPirt && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          P-IRT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Harga & Tombol Aksi */}
                <div className="px-4 py-3.5 bg-slate-50/70 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11px] text-slate-500">Kisaran Harga</span>
                    <span className="text-sm font-bold text-[#1E3A8A] font-mono tabular-nums">
                      {item.priceDisplay}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailUmkm(item)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap"
                    >
                      Detail Usaha
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onTrackWaClick(item.id)}
                      className="px-3 py-2 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      Pesan WA
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Detail Profil Usaha (Publik — tanpa data omzet sensitif sesuai NFR-04) */}
      {detailUmkm && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 z-10">
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-500">
                  Profil UMKM Terkurasi · Kecamatan Porong
                </div>
                <h3
                  id="detail-modal-title"
                  className="text-base font-bold text-slate-900 truncate"
                >
                  {detailUmkm.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailUmkm(null)}
                aria-label="Tutup modal detail"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-slate-200">
                <ProductArtwork
                  variant={detailUmkm.artworkVariant}
                  title={detailUmkm.productTitle}
                  className="h-full"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  {detailUmkm.category} ·{' '}
                  {villageMap.get(detailUmkm.villageId)?.regionType}{' '}
                  {villageMap.get(detailUmkm.villageId)?.name}
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  {detailUmkm.productTitle}
                </h4>
                <div className="text-lg font-bold text-[#1E3A8A] font-mono tabular-nums">
                  {detailUmkm.priceDisplay}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pt-1">
                  {detailUmkm.description}
                </p>
              </div>

              {/* Informasi Identitas Usaha Publik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-500">Pemilik Usaha</div>
                  <div className="mt-0.5 font-semibold text-slate-900">
                    {detailUmkm.ownerName}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Tahun Berdiri &amp; Kapasitas</div>
                  <div className="mt-0.5 font-semibold text-slate-900 tabular-nums">
                    Sejak {detailUmkm.yearEstablished} · {detailUmkm.productionCapacity}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-500">Alamat Lokasi Produksi</div>
                  <div className="mt-0.5 font-semibold text-slate-900">
                    {detailUmkm.address}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-500">Nomor WhatsApp Resmi</div>
                  <div className="mt-0.5 font-mono font-semibold text-[#047857]">
                    {formatWhatsAppDisplay(detailUmkm.whatsapp)}
                  </div>
                </div>
              </div>

              {/* Legalitas & Sertifikasi */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900">
                  Status Legalitas &amp; Sertifikasi Terverifikasi
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div
                    className={`p-3 rounded-lg border ${
                      detailUmkm.certifications.hasNib
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-slate-800">NIB OSS-RBA</div>
                    <div className="mt-1 font-mono text-[11px] text-slate-600">
                      {detailUmkm.certifications.hasNib
                        ? detailUmkm.certifications.nibCode || 'Terdaftar'
                        : 'Belum Terdaftar'}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${
                      detailUmkm.certifications.hasHalal
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-slate-800">Sertifikat Halal</div>
                    <div className="mt-1 font-mono text-[11px] text-slate-600">
                      {detailUmkm.certifications.hasHalal
                        ? detailUmkm.certifications.halalCode || 'Terdaftar'
                        : 'Dalam Proses / Belum'}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${
                      detailUmkm.certifications.hasPirt
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-slate-800">Izin Edar P-IRT</div>
                    <div className="mt-1 font-mono text-[11px] text-slate-600">
                      {detailUmkm.certifications.hasPirt
                        ? detailUmkm.certifications.pirtCode || 'Terdaftar'
                        : 'Belum / Non-Pangan'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Pemesanan langsung ke pelaku UMKM tanpa potongan komisi.
              </div>
              <a
                href={buildWhatsAppOrderUrl(
                  detailUmkm,
                  `${villageMap.get(detailUmkm.villageId)?.regionType ?? ''} ${villageMap.get(detailUmkm.villageId)?.name ?? ''}`.trim()
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrackWaClick(detailUmkm.id)}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi &amp; Pesan via WhatsApp
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
