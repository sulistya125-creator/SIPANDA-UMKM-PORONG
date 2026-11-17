import {
  BazarEvent,
  EventRegistration,
  SectorCategory,
  UMKMProfile,
  Village,
} from '../types/umkm';
import { SECTOR_CATEGORIES } from '../data/mockPorongData';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactIDR(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2).replace('.', ',')} Miliar`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace('.', ',')} Juta`;
  }
  return formatIDR(amount);
}

export function normalizeWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

export function formatWhatsAppDisplay(normalized: string): string {
  if (!normalized) return '-';
  if (normalized.startsWith('62')) {
    return `+${normalized.slice(0, 2)} ${normalized.slice(2, 5)}-${normalized.slice(5, 9)}-${normalized.slice(9)}`;
  }
  return normalized;
}

export function buildWhatsAppOrderUrl(umkm: UMKMProfile, villageName: string): string {
  const phone = normalizeWhatsApp(umkm.whatsapp);
  const text = [
    `Halo ${umkm.ownerName} (${umkm.businessName}),`,
    `Saya tertarik memesan produk *${umkm.productTitle}* (${umkm.priceDisplay}) yang tayang di Etalase Digital SIPANDA UMKM PORONG (${villageName}, Kec. Porong).`,
    `Apakah produk tersedia untuk pemesanan? Terima kasih.`,
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export interface VillageMetric {
  village: Village;
  totalUmkm: number;
  nibCount: number;
  halalCount: number;
  pirtCount: number;
  approvedCount: number;
  nibRatio: number;
  isLowNibRisk: boolean;
  totalRevenue: number;
}

export interface SectorMetric {
  category: SectorCategory;
  count: number;
  percentage: number;
  totalRevenue: number;
  waClicks: number;
  fullCertCount: number;
}

export interface ComputedDashboardAnalytics {
  totalUmkm: number;
  totalNib: number;
  nibRatio: number;
  totalHalal: number;
  totalPirt: number;
  approvedCount: number;
  approvedRatio: number;
  pendingCurationCount: number;
  revisionCount: number;
  totalMonthlyRevenue: number;
  totalWaClicks: number;
  totalEvents: number;
  totalBoothCapacity: number;
  totalBoothFilled: number;
  villageMetrics: VillageMetric[];
  lowNibVillages: VillageMetric[];
  sectorMetrics: SectorMetric[];
  topCluster: SectorMetric | null;
  topClusterShare: number;
  fullEventsCount: number;
  warningEventsCount: number;
}

export function computeAnalytics(
  umkmList: UMKMProfile[],
  villages: Village[],
  events: BazarEvent[],
  registrations: EventRegistration[]
): ComputedDashboardAnalytics {
  const totalUmkm = umkmList.length;
  const totalNib = umkmList.filter((u) => u.certifications.hasNib).length;
  const totalHalal = umkmList.filter((u) => u.certifications.hasHalal).length;
  const totalPirt = umkmList.filter((u) => u.certifications.hasPirt).length;
  const approvedCount = umkmList.filter((u) => u.curationStatus === 'Approved').length;
  const pendingCurationCount = umkmList.filter((u) => u.curationStatus === 'Menunggu Kurasi').length;
  const revisionCount = umkmList.filter((u) => u.curationStatus === 'Perlu Revisi').length;

  const nibRatio = totalUmkm > 0 ? (totalNib / totalUmkm) * 100 : 0;
  const approvedRatio = totalUmkm > 0 ? (approvedCount / totalUmkm) * 100 : 0;

  const totalMonthlyRevenue = umkmList.reduce((acc, u) => acc + u.estMonthlyRevenue, 0);
  const totalWaClicks = umkmList.reduce((acc, u) => acc + u.waClicks, 0);

  const villageMetrics: VillageMetric[] = villages.map((village) => {
    const inVillage = umkmList.filter((u) => u.villageId === village.id);
    const count = inVillage.length;
    const nibCount = inVillage.filter((u) => u.certifications.hasNib).length;
    const halalCount = inVillage.filter((u) => u.certifications.hasHalal).length;
    const pirtCount = inVillage.filter((u) => u.certifications.hasPirt).length;
    const vApproved = inVillage.filter((u) => u.curationStatus === 'Approved').length;
    const vNibRatio = count > 0 ? (nibCount / count) * 100 : 0;
    const vRevenue = inVillage.reduce((s, u) => s + u.estMonthlyRevenue, 0);

    return {
      village,
      totalUmkm: count,
      nibCount,
      halalCount,
      pirtCount,
      approvedCount: vApproved,
      nibRatio: vNibRatio,
      isLowNibRisk: count > 0 && vNibRatio < 50,
      totalRevenue: vRevenue,
    };
  });

  const lowNibVillages = villageMetrics
    .filter((v) => v.isLowNibRisk)
    .sort((a, b) => a.nibRatio - b.nibRatio);

  const sectorMetrics: SectorMetric[] = SECTOR_CATEGORIES.map((category) => {
    const inSector = umkmList.filter((u) => u.category === category);
    const count = inSector.length;
    const percentage = totalUmkm > 0 ? (count / totalUmkm) * 100 : 0;
    const rev = inSector.reduce((s, u) => s + u.estMonthlyRevenue, 0);
    const clicks = inSector.reduce((s, u) => s + u.waClicks, 0);
    const fullCertCount = inSector.filter(
      (u) => u.certifications.hasNib && (u.certifications.hasHalal || u.certifications.hasPirt)
    ).length;

    return {
      category,
      count,
      percentage,
      totalRevenue: rev,
      waClicks: clicks,
      fullCertCount,
    };
  }).sort((a, b) => b.waClicks - a.waClicks);

  const topCluster = sectorMetrics[0] ?? null;
  const topClusterShare =
    topCluster && totalWaClicks > 0 ? (topCluster.waClicks / totalWaClicks) * 100 : 0;

  const totalEvents = events.length;
  const totalBoothCapacity = events.reduce((acc, e) => acc + e.maxCapacity, 0);
  const totalBoothFilled = registrations.length;

  let fullEventsCount = 0;
  let warningEventsCount = 0;
  events.forEach((evt) => {
    const filled = registrations.filter((r) => r.eventId === evt.id).length;
    const pct = evt.maxCapacity > 0 ? (filled / evt.maxCapacity) * 100 : 0;
    if (filled >= evt.maxCapacity) {
      fullEventsCount += 1;
    } else if (pct >= 80) {
      warningEventsCount += 1;
    }
  });

  return {
    totalUmkm,
    totalNib,
    nibRatio,
    totalHalal,
    totalPirt,
    approvedCount,
    approvedRatio,
    pendingCurationCount,
    revisionCount,
    totalMonthlyRevenue,
    totalWaClicks,
    totalEvents,
    totalBoothCapacity,
    totalBoothFilled,
    villageMetrics,
    lowNibVillages,
    sectorMetrics,
    topCluster,
    topClusterShare,
    fullEventsCount,
    warningEventsCount,
  };
}
