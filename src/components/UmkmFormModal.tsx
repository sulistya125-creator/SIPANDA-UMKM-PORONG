import React, { useState } from 'react';
import {
  Eye,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  BusinessStage,
  CurationStatus,
  LegalDocumentAttachment,
  RolePermissions,
  SectorCategory,
  UMKMProfile,
  Village,
} from '../types/umkm';
import { SECTOR_CATEGORIES } from '../data/mockPorongData';
import { formatIDR, normalizeWhatsApp } from '../utils/analytics';
import { LegalDocPreviewModal, formatFileSize } from './LegalDocPreviewModal';

const MAX_DOC_BYTES = 1.5 * 1024 * 1024; // 1.5 MB agar aman di localStorage
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

type LegalityKey = 'nib' | 'halal' | 'pirt';

interface UmkmFormModalProps {
  initialData: UMKMProfile | null;
  villages: Village[];
  permissions: RolePermissions;
  onClose: () => void;
  onSave: (payload: Omit<UMKMProfile, 'id' | 'waClicks'>, existingId?: string) => void;
}

const ARTWORK_BY_CATEGORY: Record<SectorCategory, UMKMProfile['artworkVariant']> = {
  'Olahan Ikan & Pangan': 'bandeng',
  'Kuliner & Kue Tradisional': 'lumpur',
  'Jamu & Minuman Herbal': 'jamu',
  'Batik & Tekstil': 'batik',
  'Kerajinan Kulit & Kreatif': 'kulit',
};

export const UmkmFormModal: React.FC<UmkmFormModalProps> = ({
  initialData,
  villages,
  permissions,
  onClose,
  onSave,
}) => {
  const isEdit = Boolean(initialData);

  const [businessName, setBusinessName] = useState(initialData?.businessName ?? '');
  const [ownerName, setOwnerName] = useState(initialData?.ownerName ?? '');
  const [villageId, setVillageId] = useState(
    permissions.scopedVillageId ?? initialData?.villageId ?? villages[0]?.id ?? 'v-candipari'
  );
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [whatsappInput, setWhatsappInput] = useState(initialData?.whatsapp ?? '0812');
  const [yearEstablished, setYearEstablished] = useState(
    initialData?.yearEstablished ?? 2023
  );
  const [businessStage, setBusinessStage] = useState<BusinessStage>(
    initialData?.businessStage ?? 'Rintisan'
  );
  const [estMonthlyRevenue, setEstMonthlyRevenue] = useState(
    initialData?.estMonthlyRevenue ?? 6000000
  );
  const [employeesCount, setEmployeesCount] = useState(initialData?.employeesCount ?? 2);

  const [productTitle, setProductTitle] = useState(initialData?.productTitle ?? '');
  const [category, setCategory] = useState<SectorCategory>(
    initialData?.category ?? 'Olahan Ikan & Pangan'
  );
  const [priceMin, setPriceMin] = useState(initialData?.priceMin ?? 20000);
  const [priceMax, setPriceMax] = useState(initialData?.priceMax ?? 45000);
  const [productionCapacity, setProductionCapacity] = useState(
    initialData?.productionCapacity ?? '50 pack / minggu'
  );
  const [description, setDescription] = useState(initialData?.description ?? '');

  const [hasNib, setHasNib] = useState(initialData?.certifications.hasNib ?? false);
  const [nibCode, setNibCode] = useState(initialData?.certifications.nibCode ?? '');
  const [nibDocument, setNibDocument] = useState<LegalDocumentAttachment | undefined>(
    initialData?.certifications.nibDocument
  );

  const [hasHalal, setHasHalal] = useState(initialData?.certifications.hasHalal ?? false);
  const [halalCode, setHalalCode] = useState(initialData?.certifications.halalCode ?? '');
  const [halalDocument, setHalalDocument] = useState<LegalDocumentAttachment | undefined>(
    initialData?.certifications.halalDocument
  );

  const [hasPirt, setHasPirt] = useState(initialData?.certifications.hasPirt ?? false);
  const [pirtCode, setPirtCode] = useState(initialData?.certifications.pirtCode ?? '');
  const [pirtDocument, setPirtDocument] = useState<LegalDocumentAttachment | undefined>(
    initialData?.certifications.pirtDocument
  );

  const [docErrors, setDocErrors] = useState<Partial<Record<LegalityKey, string>>>({});
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    document: LegalDocumentAttachment;
  } | null>(null);

  const [curationStatus, setCurationStatus] = useState<CurationStatus>(
    permissions.canCurateUmkm
      ? initialData?.curationStatus ?? 'Menunggu Kurasi'
      : 'Menunggu Kurasi'
  );
  const [curationNote, setCurationNote] = useState(
    initialData?.curationNote ?? 'Menunggu peninjauan kelayakan foto dan label oleh staf.'
  );
  const [formError, setFormError] = useState('');

  const handleUploadDocument = (
    key: LegalityKey,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isValidExt =
      lowerName.endsWith('.pdf') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.webp');

    if (!ALLOWED_MIME_TYPES.has(file.type) && !isValidExt) {
      setDocErrors((prev) => ({
        ...prev,
        [key]: 'Format tidak didukung. Gunakan PDF, JPG, PNG, atau WebP.',
      }));
      return;
    }

    if (file.size > MAX_DOC_BYTES) {
      setDocErrors((prev) => ({
        ...prev,
        [key]: 'Ukuran berkas melebihi 1,5 MB. Silakan kompres berkas.',
      }));
      return;
    }

    setDocErrors((prev) => ({ ...prev, [key]: undefined }));

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const attachment: LegalDocumentAttachment = {
        fileName: file.name,
        fileSize: file.size,
        fileType:
          file.type ||
          (lowerName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString().slice(0, 10),
      };
      if (key === 'nib') setNibDocument(attachment);
      if (key === 'halal') setHalalDocument(attachment);
      if (key === 'pirt') setPirtDocument(attachment);
    };
    reader.onerror = () => {
      setDocErrors((prev) => ({
        ...prev,
        [key]: 'Gagal membaca berkas. Coba pilih file lain.',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocument = (key: LegalityKey) => {
    setDocErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === 'nib') setNibDocument(undefined);
    if (key === 'halal') setHalalDocument(undefined);
    if (key === 'pirt') setPirtDocument(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedWa = normalizeWhatsApp(whatsappInput);
    if (normalizedWa.length < 10) {
      setFormError('Nomor WhatsApp aktif wajib diisi minimal 10 digit.');
      return;
    }
    if (priceMax < priceMin) {
      setFormError('Harga maksimum tidak boleh lebih kecil dari harga minimum.');
      return;
    }

    const priceDisplay =
      priceMin === priceMax
        ? formatIDR(priceMin)
        : `${formatIDR(priceMin)} – ${formatIDR(priceMax)}`;

    const effectiveVillageId = permissions.scopedVillageId ?? villageId;
    const effectiveCurationStatus: CurationStatus = permissions.canCurateUmkm
      ? curationStatus
      : 'Menunggu Kurasi';

    onSave(
      {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        villageId: effectiveVillageId,
        address: address.trim(),
        whatsapp: normalizedWa,
        yearEstablished: Number(yearEstablished) || 2023,
        businessStage,
        estMonthlyRevenue: Number(estMonthlyRevenue) || 0,
        employeesCount: Number(employeesCount) || 1,
        productTitle: productTitle.trim(),
        category,
        priceMin: Number(priceMin) || 0,
        priceMax: Number(priceMax) || 0,
        priceDisplay,
        productionCapacity: productionCapacity.trim(),
        description: description.trim(),
        artworkVariant: initialData?.artworkVariant ?? ARTWORK_BY_CATEGORY[category],
        curationStatus: effectiveCurationStatus,
        curationNote: curationNote.trim(),
        curatedBy:
          effectiveCurationStatus === 'Approved'
            ? 'Imambang Eka Sulistya, SE'
            : initialData?.curatedBy,
        curatedAt:
          effectiveCurationStatus === 'Approved'
            ? new Date().toISOString().slice(0, 10)
            : initialData?.curatedAt,
        certifications: {
          hasNib,
          nibCode: hasNib ? nibCode.trim() : '',
          nibDocument: hasNib ? nibDocument : undefined,
          hasHalal,
          halalCode: hasHalal ? halalCode.trim() : '',
          halalDocument: hasHalal ? halalDocument : undefined,
          hasPirt,
          pirtCode: hasPirt ? pirtCode.trim() : '',
          pirtDocument: hasPirt ? pirtDocument : undefined,
          updatedAt: new Date().toISOString().slice(0, 10),
        },
      },
      initialData?.id
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="umkm-form-title"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div>
            <div className="text-xs font-medium text-slate-500">
              Pendataan UMKM Kecamatan Porong
            </div>
            <h3 id="umkm-form-title" className="text-base font-bold text-slate-900">
              {isEdit ? `Edit Profil: ${initialData?.businessName}` : 'Registrasi UMKM & Produk Baru'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[#EF4444] font-semibold">
              {formError}
            </div>
          )}

          {/* Bagian 1: Identitas Pelaku Usaha */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide border-b border-slate-100 pb-1.5">
              1. Identitas Pelaku Usaha &amp; Lokasi Wilayah
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Usaha / Brand *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Keripik Tempe Pesawahan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pemilik Usaha *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Nama lengkap pemilik"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Desa / Kelurahan (19 Wilayah) *
                </label>
                <select
                  value={villageId}
                  disabled={Boolean(permissions.scopedVillageId)}
                  onChange={(e) => setVillageId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] disabled:bg-slate-100 disabled:text-slate-600"
                >
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif (otomatis format 62) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Usaha *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jalan / Dusun / RT & RW"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Produk Unggulan & Kinerja Usaha */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide border-b border-slate-100 pb-1.5">
              2. Produk Unggulan &amp; Klasifikasi Pembinaan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Produk Unggulan *
                </label>
                <input
                  type="text"
                  required
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="Contoh: Bandeng Presto Duri Lunak"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Klaster Sektor Usaha *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SectorCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  {SECTOR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Harga Minimum (Rp) *
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  required
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Harga Maksimum (Rp) *
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  required
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahap Pembinaan *
                </label>
                <select
                  value={businessStage}
                  onChange={(e) => setBusinessStage(e.target.value as BusinessStage)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="Rintisan">Rintisan</option>
                  <option value="Berkembang">Berkembang</option>
                  <option value="Siap Naik Kelas">Siap Naik Kelas</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimasi Omzet Bulanan (Rp) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={100000}
                  required
                  value={estMonthlyRevenue}
                  onChange={(e) => setEstMonthlyRevenue(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kapasitas Produksi
                </label>
                <input
                  type="text"
                  value={productionCapacity}
                  onChange={(e) => setProductionCapacity(e.target.value)}
                  placeholder="Contoh: 100 pack / minggu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahun Berdiri
                  </label>
                  <input
                    type="number"
                    min={1980}
                    max={2026}
                    value={yearEstablished}
                    onChange={(e) => setYearEstablished(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tenaga Kerja
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={employeesCount}
                    onChange={(e) => setEmployeesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Keunggulan Produk *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan bahan baku, daya tahan, kemasan, dan keunggulan produk..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>
          </div>

          {/* Bagian 3: Checklist Legalitas & Sertifikasi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wide border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>3. Checklist Legalitas &amp; Status Kurasi</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* NIB */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasNib}
                      onChange={(e) => setHasNib(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#10B981]"
                    />
                    <span>Memiliki NIB (OSS-RBA)</span>
                  </label>
                  <input
                    type="text"
                    disabled={!hasNib}
                    value={nibCode}
                    onChange={(e) => setNibCode(e.target.value)}
                    placeholder="Nomor NIB (13 digit)"
                    className="w-full px-2.5 py-1.5 font-mono text-[11px] bg-white border border-slate-200 rounded disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* Upload Dokumen NIB */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Dokumen Sertifikat NIB
                  </div>
                  {!hasNib ? (
                    <div className="px-2.5 py-2 rounded border border-dashed border-slate-200 bg-slate-100/70 text-[10px] text-slate-400 text-center">
                      Centang NIB untuk mengunggah berkas
                    </div>
                  ) : nibDocument ? (
                    <div className="p-2 rounded border border-emerald-200 bg-emerald-50/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {nibDocument.fileType.startsWith('image/') ? (
                          <ImageIcon className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                        )}
                        <span
                          className="text-[11px] font-semibold text-slate-800 truncate"
                          title={nibDocument.fileName}
                        >
                          {nibDocument.fileName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>{formatFileSize(nibDocument.fileSize)}</span>
                        <span>{nibDocument.uploadedAt}</span>
                      </div>
                      <div className="flex items-center gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({ title: 'NIB (OSS-RBA)', document: nibDocument })
                          }
                          className="flex-1 px-2 py-1 text-[10px] font-semibold text-[#1E3A8A] bg-white border border-slate-200 hover:bg-blue-50 rounded inline-flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Lihat
                        </button>
                        <label className="px-2 py-1 text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded inline-flex items-center justify-center gap-1 cursor-pointer">
                          <RefreshCw className="w-3 h-3" />
                          Ganti
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => handleUploadDocument('nib', e)}
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument('nib')}
                          aria-label="Hapus dokumen NIB"
                          className="p-1 text-slate-400 hover:text-[#EF4444] bg-white border border-slate-200 hover:border-red-200 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1 px-2.5 py-2.5 rounded border border-dashed border-slate-300 bg-white hover:border-[#1E3A8A] hover:bg-blue-50/40 cursor-pointer transition-colors text-center">
                      <Upload className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span className="text-[11px] font-semibold text-[#1E3A8A]">
                        Upload Dokumen NIB
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PDF / JPG / PNG · Maks. 1,5 MB
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleUploadDocument('nib', e)}
                        className="sr-only"
                      />
                    </label>
                  )}
                  {docErrors.nib && (
                    <p className="text-[10px] font-medium text-[#EF4444]">{docErrors.nib}</p>
                  )}
                </div>
              </div>

              {/* Halal */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasHalal}
                      onChange={(e) => setHasHalal(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#10B981]"
                    />
                    <span>Sertifikat Halal</span>
                  </label>
                  <input
                    type="text"
                    disabled={!hasHalal}
                    value={halalCode}
                    onChange={(e) => setHalalCode(e.target.value)}
                    placeholder="Nomor ID3511..."
                    className="w-full px-2.5 py-1.5 font-mono text-[11px] bg-white border border-slate-200 rounded disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* Upload Dokumen Halal */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Dokumen Sertifikat Halal
                  </div>
                  {!hasHalal ? (
                    <div className="px-2.5 py-2 rounded border border-dashed border-slate-200 bg-slate-100/70 text-[10px] text-slate-400 text-center">
                      Centang Halal untuk mengunggah berkas
                    </div>
                  ) : halalDocument ? (
                    <div className="p-2 rounded border border-emerald-200 bg-emerald-50/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {halalDocument.fileType.startsWith('image/') ? (
                          <ImageIcon className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                        )}
                        <span
                          className="text-[11px] font-semibold text-slate-800 truncate"
                          title={halalDocument.fileName}
                        >
                          {halalDocument.fileName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>{formatFileSize(halalDocument.fileSize)}</span>
                        <span>{halalDocument.uploadedAt}</span>
                      </div>
                      <div className="flex items-center gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({
                              title: 'Sertifikat Halal',
                              document: halalDocument,
                            })
                          }
                          className="flex-1 px-2 py-1 text-[10px] font-semibold text-[#1E3A8A] bg-white border border-slate-200 hover:bg-blue-50 rounded inline-flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Lihat
                        </button>
                        <label className="px-2 py-1 text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded inline-flex items-center justify-center gap-1 cursor-pointer">
                          <RefreshCw className="w-3 h-3" />
                          Ganti
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => handleUploadDocument('halal', e)}
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument('halal')}
                          aria-label="Hapus dokumen Halal"
                          className="p-1 text-slate-400 hover:text-[#EF4444] bg-white border border-slate-200 hover:border-red-200 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1 px-2.5 py-2.5 rounded border border-dashed border-slate-300 bg-white hover:border-[#1E3A8A] hover:bg-blue-50/40 cursor-pointer transition-colors text-center">
                      <Upload className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span className="text-[11px] font-semibold text-[#1E3A8A]">
                        Upload Dokumen Halal
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PDF / JPG / PNG · Maks. 1,5 MB
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleUploadDocument('halal', e)}
                        className="sr-only"
                      />
                    </label>
                  )}
                  {docErrors.halal && (
                    <p className="text-[10px] font-medium text-[#EF4444]">{docErrors.halal}</p>
                  )}
                </div>
              </div>

              {/* P-IRT */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPirt}
                      onChange={(e) => setHasPirt(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#F59E0B]"
                    />
                    <span>Izin Edar P-IRT</span>
                  </label>
                  <input
                    type="text"
                    disabled={!hasPirt}
                    value={pirtCode}
                    onChange={(e) => setPirtCode(e.target.value)}
                    placeholder="Nomor P-IRT..."
                    className="w-full px-2.5 py-1.5 font-mono text-[11px] bg-white border border-slate-200 rounded disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* Upload Dokumen P-IRT */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Dokumen Izin P-IRT
                  </div>
                  {!hasPirt ? (
                    <div className="px-2.5 py-2 rounded border border-dashed border-slate-200 bg-slate-100/70 text-[10px] text-slate-400 text-center">
                      Centang P-IRT untuk mengunggah berkas
                    </div>
                  ) : pirtDocument ? (
                    <div className="p-2 rounded border border-amber-200 bg-amber-50/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {pirtDocument.fileType.startsWith('image/') ? (
                          <ImageIcon className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        )}
                        <span
                          className="text-[11px] font-semibold text-slate-800 truncate"
                          title={pirtDocument.fileName}
                        >
                          {pirtDocument.fileName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between">
                        <span>{formatFileSize(pirtDocument.fileSize)}</span>
                        <span>{pirtDocument.uploadedAt}</span>
                      </div>
                      <div className="flex items-center gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({
                              title: 'Izin Edar P-IRT',
                              document: pirtDocument,
                            })
                          }
                          className="flex-1 px-2 py-1 text-[10px] font-semibold text-[#1E3A8A] bg-white border border-slate-200 hover:bg-blue-50 rounded inline-flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Lihat
                        </button>
                        <label className="px-2 py-1 text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded inline-flex items-center justify-center gap-1 cursor-pointer">
                          <RefreshCw className="w-3 h-3" />
                          Ganti
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => handleUploadDocument('pirt', e)}
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument('pirt')}
                          aria-label="Hapus dokumen P-IRT"
                          className="p-1 text-slate-400 hover:text-[#EF4444] bg-white border border-slate-200 hover:border-red-200 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1 px-2.5 py-2.5 rounded border border-dashed border-slate-300 bg-white hover:border-[#1E3A8A] hover:bg-blue-50/40 cursor-pointer transition-colors text-center">
                      <Upload className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span className="text-[11px] font-semibold text-[#1E3A8A]">
                        Upload Dokumen P-IRT
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PDF / JPG / PNG · Maks. 1,5 MB
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleUploadDocument('pirt', e)}
                        className="sr-only"
                      />
                    </label>
                  )}
                  {docErrors.pirt && (
                    <p className="text-[10px] font-medium text-[#EF4444]">{docErrors.pirt}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Kurasi Etalase
                </label>
                <select
                  value={curationStatus}
                  disabled={!permissions.canCurateUmkm}
                  onChange={(e) => setCurationStatus(e.target.value as CurationStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] disabled:bg-slate-100 disabled:text-slate-600"
                >
                  <option value="Menunggu Kurasi">Menunggu Kurasi</option>
                  {permissions.canCurateUmkm && (
                    <>
                      <option value="Approved">Approved (Langsung Tayang Publik)</option>
                      <option value="Perlu Revisi">Perlu Revisi</option>
                    </>
                  )}
                </select>
                {!permissions.canCurateUmkm && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    No Self-Approve: Pengajuan desa otomatis masuk antrean kurasi kecamatan.
                  </p>
                )}
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Kurasi Staf
                </label>
                <input
                  type="text"
                  value={curationNote}
                  onChange={(e) => setCurationNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg"
          >
            {isEdit ? 'Simpan Perubahan Data' : 'Simpan & Daftarkan UMKM'}
          </button>
        </div>
      </form>

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
