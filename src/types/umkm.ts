export type MenuKey =
  | 'dashboard'
  | 'etalase'
  | 'direktori'
  | 'bazar'
  | 'brief'
  | 'cetak'
  | 'audit'
  | 'rbac';

export type UserRole = 'superadmin' | 'admin' | 'kasi' | 'camat' | 'desa' | 'publik';

export interface AuthUser {
  id: string;
  name: string;
  position: string;
  unit: string;
  role: UserRole;
  roleLabel: string;
  badgeLabel: string;
  email: string;
  nip: string;
  password: string;
  villageId?: string;
  accessSummary: string;
}

export interface RolePermissions {
  allowedMenus: MenuKey[];
  canCreateUmkm: boolean;
  canEditUmkm: boolean;
  canDeleteUmkm: boolean;
  canCurateUmkm: boolean;
  canCreateEvent: boolean;
  canAllocateBooth: boolean;
  canDeleteRegistration: boolean;
  canViewSensitiveData: boolean;
  canViewBrief: boolean;
  canViewAuditLog: boolean;
  canManageRbac: boolean;
  isReadOnlyBazar: boolean;
  scopedVillageId?: string;
}

export type RolePermissionsMap = Record<UserRole, RolePermissions>;

export type RegionType = 'Desa' | 'Kelurahan';

export type BusinessStage = 'Rintisan' | 'Berkembang' | 'Siap Naik Kelas';

export type CurationStatus = 'Approved' | 'Menunggu Kurasi' | 'Perlu Revisi';

export type SectorCategory =
  | 'Olahan Ikan & Pangan'
  | 'Kuliner & Kue Tradisional'
  | 'Jamu & Minuman Herbal'
  | 'Batik & Tekstil'
  | 'Kerajinan Kulit & Kreatif';

export type EventCategory = 'Bazar UMKM' | 'Klinik Perizinan' | 'Pelatihan Kapasitas';

export interface Village {
  id: string;
  code: string;
  name: string;
  regionType: RegionType;
  picName: string;
  targetUmkm: number;
}

export interface LegalDocumentAttachment {
  fileName: string;
  fileSize: number;
  fileType: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface UMKMCertification {
  hasNib: boolean;
  nibCode: string;
  nibDocument?: LegalDocumentAttachment;
  hasHalal: boolean;
  halalCode: string;
  halalDocument?: LegalDocumentAttachment;
  hasPirt: boolean;
  pirtCode: string;
  pirtDocument?: LegalDocumentAttachment;
  updatedAt: string;
}

export interface UMKMProfile {
  id: string;
  businessName: string;
  ownerName: string;
  villageId: string;
  address: string;
  whatsapp: string;
  yearEstablished: number;
  businessStage: BusinessStage;
  estMonthlyRevenue: number;
  employeesCount: number;
  productTitle: string;
  category: SectorCategory;
  priceMin: number;
  priceMax: number;
  priceDisplay: string;
  productionCapacity: string;
  description: string;
  artworkVariant:
    | 'bandeng'
    | 'petis'
    | 'krupuk'
    | 'sambal'
    | 'jamu'
    | 'sinom'
    | 'wedang'
    | 'kue'
    | 'lumpur'
    | 'batik'
    | 'kulit'
    | 'anyaman';
  curationStatus: CurationStatus;
  curationNote: string;
  curatedBy?: string;
  curatedAt?: string;
  waClicks: number;
  certifications: UMKMCertification;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  umkmId: string;
  facilityRequest: string;
  registeredAt: string;
}

export interface BazarEvent {
  id: string;
  title: string;
  category: EventCategory;
  scheduleText: string;
  eventDate: string;
  location: string;
  maxCapacity: number;
  unitLabel: 'Booth' | 'Peserta';
  description: string;
}

export type AuditActionCategory =
  | 'Autentikasi'
  | 'Kurasi & UMKM'
  | 'Bazar & Kuota'
  | 'Laporan'
  | 'Manajemen RBAC';

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: UserRole;
  actorRoleLabel: string;
  category: AuditActionCategory;
  action: string;
  targetName: string;
  detail: string;
  timestamp: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
}
