import React, { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Eye,
  Lock,
  MapPin,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  BazarEvent,
  EventCategory,
  EventRegistration,
  RolePermissions,
  UMKMProfile,
  Village,
} from '../types/umkm';

interface BazarPelatihanProps {
  events: BazarEvent[];
  registrations: EventRegistration[];
  umkmList: UMKMProfile[];
  villages: Village[];
  permissions: RolePermissions;
  onCreateEvent: (eventPayload: Omit<BazarEvent, 'id'>) => void;
  onAllocateBooth: (
    eventId: string,
    umkmId: string,
    facilityRequest: string
  ) => { ok: boolean; message: string };
  onRemoveRegistration: (registrationId: string) => void;
}

export const BazarPelatihan: React.FC<BazarPelatihanProps> = ({
  events,
  registrations,
  umkmList,
  villages,
  permissions,
  onCreateEvent,
  onAllocateBooth,
  onRemoveRegistration,
}) => {
  const villageMap = useMemo(() => {
    const map = new Map<string, Village>();
    villages.forEach((v) => map.set(v.id, v));
    return map;
  }, [villages]);

  const eligibleUmkmList = useMemo(() => {
    if (permissions.scopedVillageId) {
      return umkmList.filter((u) => u.villageId === permissions.scopedVillageId);
    }
    return umkmList;
  }, [umkmList, permissions.scopedVillageId]);

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id ?? '');
  const [selectedUmkmId, setSelectedUmkmId] = useState<string>(eligibleUmkmList[0]?.id ?? '');
  const [facilityRequest, setFacilityRequest] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal Tambah Agenda Baru (Admin Kecamatan)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('Bazar UMKM');
  const [newScheduleText, setNewScheduleText] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState(20);
  const [newUnitLabel, setNewUnitLabel] = useState<'Booth' | 'Peserta'>('Booth');
  const [newDesc, setNewDesc] = useState('');

  React.useEffect(() => {
    if (
      eligibleUmkmList.length > 0 &&
      !eligibleUmkmList.some((u) => u.id === selectedUmkmId)
    ) {
      setSelectedUmkmId(eligibleUmkmList[0].id);
    }
  }, [eligibleUmkmList, selectedUmkmId]);

  const umkmMap = useMemo(() => {
    const map = new Map<string, UMKMProfile>();
    umkmList.forEach((u) => map.set(u.id, u));
    return map;
  }, [umkmList]);

  const activeEvent = events.find((e) => e.id === selectedEventId) ?? events[0];

  const activeRegistrations = useMemo(
    () => registrations.filter((r) => r.eventId === activeEvent?.id),
    [registrations, activeEvent]
  );

  const activeFilledCount = activeRegistrations.length;
  const isEventFull = activeEvent ? activeFilledCount >= activeEvent.maxCapacity : false;
  const isDuplicateUmkm = activeRegistrations.some((r) => r.umkmId === selectedUmkmId);

  const handleSubmitAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !selectedUmkmId) return;

    const result = onAllocateBooth(
      activeEvent.id,
      selectedUmkmId,
      facilityRequest.trim() || 'Meja Display Standar'
    );

    setFeedback({
      type: result.ok ? 'success' : 'error',
      message: result.message,
    });
    if (result.ok) {
      setFacilityRequest('');
    }
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEvent({
      title: newTitle.trim(),
      category: newCategory,
      scheduleText: newScheduleText.trim(),
      eventDate: new Date().toISOString().slice(0, 10),
      location: newLocation.trim(),
      maxCapacity: Math.max(1, Number(newCapacity) || 10),
      unitLabel: newUnitLabel,
      description: newDesc.trim(),
    });
    setIsAddEventOpen(false);
    setNewTitle('');
    setNewScheduleText('');
    setNewLocation('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Jadwal Bazar, Klinik Perizinan &amp; Pelatihan Kapasitas
            </h2>
            {permissions.isReadOnlyBazar && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 rounded">
                <Eye className="w-3 h-3" />
                Mode Pantau (Read-Only)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem validasi otomatis kapasitas booth/kuota peserta dan pencegahan pendaftaran
            ganda antar-desa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
              Terbuka (&lt;80%)
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
              Hampir Penuh (≥80%)
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" />
              Penuh (100%)
            </span>
          </div>

          {permissions.canCreateEvent && (
            <button
              type="button"
              onClick={() => setIsAddEventOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Agenda Baru
            </button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Daftar Agenda Kegiatan (Kiri) */}
        <section className="xl:col-span-7 space-y-3" aria-label="Daftar Agenda Seksi Perekonomian">
          {events.map((evt) => {
            const eventRegs = registrations.filter((r) => r.eventId === evt.id);
            const filled = eventRegs.length;
            const pct = evt.maxCapacity > 0 ? Math.min((filled / evt.maxCapacity) * 100, 100) : 0;
            const full = filled >= evt.maxCapacity;
            const nearFull = !full && pct >= 80;
            const isSelected = evt.id === activeEvent?.id;

            return (
              <div
                key={evt.id}
                onClick={() => {
                  setSelectedEventId(evt.id);
                  setFeedback(null);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedEventId(evt.id);
                    setFeedback(null);
                  }
                }}
                className={`bg-white rounded-xl p-4 border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[#1E3A8A]">
                      {evt.category}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                  </div>

                  {/* Status Okupansi */}
                  <div className="shrink-0">
                    {full ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-red-50 text-[#EF4444] border border-red-200 rounded">
                        <Lock className="w-3 h-3" />
                        Kuota Penuh · Terkunci
                      </span>
                    ) : nearFull ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        Sisa {evt.maxCapacity - filled} {evt.unitLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Terbuka ({evt.maxCapacity - filled} sisa)
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{evt.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    {evt.scheduleText}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {evt.location}
                  </span>
                </div>

                {/* Progress Bar Okupansi */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">
                      Okupansi {evt.unitLabel}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {filled} / {evt.maxCapacity} {evt.unitLabel} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        full
                          ? 'bg-[#EF4444]'
                          : nearFull
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Formulir Alokasi & Daftar Peserta (Kanan) */}
        <section className="xl:col-span-5 space-y-5">
          {permissions.canAllocateBooth ? (
            <form
              onSubmit={handleSubmitAllocation}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
            >
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Form Alokasi Booth / Peserta
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dilengkapi deteksi kuota penuh otomatis
                  {permissions.scopedVillageId &&
                    ` · Terbatas untuk UMKM ${villageMap.get(permissions.scopedVillageId)?.regionType} ${villageMap.get(permissions.scopedVillageId)?.name}`}
                </p>
              </div>

              {activeEvent && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-slate-500">Agenda Terpilih</div>
                  <div className="font-bold text-slate-900 mt-0.5">{activeEvent.title}</div>
                  <div className="mt-1 font-mono tabular-nums text-slate-600">
                    Terisi: {activeFilledCount} / {activeEvent.maxCapacity} {activeEvent.unitLabel}
                  </div>
                </div>
              )}

              {isEventFull && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#EF4444] flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Kapasitas Penuh (100% Terkunci)</div>
                    <p className="mt-0.5 text-red-700">
                      Slot untuk agenda ini telah terisi penuh. Pengajuan tambahan akan ditolak
                      otomatis oleh sistem validasi kuota.
                    </p>
                  </div>
                </div>
              )}

              {!isEventFull && isDuplicateUmkm && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Deteksi Duplikasi Peserta</div>
                    <p className="mt-0.5">
                      UMKM terpilih sudah terdaftar pada agenda ini. Silakan pilih pelaku UMKM lain.
                    </p>
                  </div>
                </div>
              )}

              {feedback && (
                <div
                  className={`p-3 rounded-lg border text-xs font-medium flex items-start gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-[#047857]'
                      : 'bg-red-50 border-red-200 text-[#EF4444]'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilih Agenda Kegiatan *
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      setFeedback(null);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  >
                    {events.map((evt) => {
                      const filled = registrations.filter((r) => r.eventId === evt.id).length;
                      return (
                        <option key={evt.id} value={evt.id}>
                          {evt.title} ({filled}/{evt.maxCapacity} {evt.unitLabel})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilih Pelaku UMKM Binaan *
                  </label>
                  <select
                    value={selectedUmkmId}
                    onChange={(e) => {
                      setSelectedUmkmId(e.target.value);
                      setFeedback(null);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  >
                    {eligibleUmkmList.map((u) => {
                      const v = villageMap.get(u.villageId);
                      const already = activeRegistrations.some((r) => r.umkmId === u.id);
                      return (
                        <option key={u.id} value={u.id}>
                          {u.businessName} — {v?.regionType} {v?.name}{' '}
                          {already ? '(Sudah Terdaftar)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kebutuhan Fasilitas / Nomor Booth
                  </label>
                  <input
                    type="text"
                    value={facilityRequest}
                    onChange={(e) => setFacilityRequest(e.target.value)}
                    placeholder="Contoh: Booth A-04, butuh colokan listrik"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 ${
                  isEventFull
                    ? 'bg-[#EF4444] hover:bg-red-600 text-white'
                    : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'
                }`}
              >
                {isEventFull ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Uji Validasi: Kuota Terkunci (100% Penuh)
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Daftarkan &amp; Kunci Slot Booth
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Eye className="w-4 h-4 text-[#1E3A8A]" />
                <span>Mode Pantau Pimpinan (Read-Only)</span>
              </div>
              <p>
                Pimpinan (Camat) memantau keterisian kuota booth dan daftar peserta lintas 19
                desa/kelurahan. Pengelolaan alokasi slot dilakukan oleh Seksi Perekonomian.
              </p>
            </div>
          )}

          {/* Daftar Peserta Terdaftar di Agenda Aktif */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E3A8A]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Peserta Terdaftar ({activeRegistrations.length})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                Maks. {activeEvent?.maxCapacity}
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {activeRegistrations.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Belum ada peserta terdaftar pada agenda ini.
                </div>
              ) : (
                activeRegistrations.map((reg, index) => {
                  const u = umkmMap.get(reg.umkmId);
                  const v = u ? villageMap.get(u.villageId) : undefined;
                  return (
                    <div
                      key={reg.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          <span className="font-mono text-slate-400 mr-1.5 tabular-nums">
                            {String(index + 1).padStart(2, '0')}.
                          </span>
                          {u?.businessName ?? 'UMKM'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {v ? `${v.regionType} ${v.name}` : '-'} · {reg.facilityRequest}
                        </div>
                      </div>
                      {permissions.canDeleteRegistration && (
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveRegistration(reg.id);
                            setFeedback(null);
                          }}
                          title="Batalkan alokasi peserta (Admin Kecamatan)"
                          className="p-1.5 text-slate-400 hover:text-[#EF4444] hover:bg-red-50 rounded transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal Tambah Agenda Baru (Admin Kecamatan) */}
      {isAddEventOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleCreateEventSubmit}
            className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Tambah Agenda Bazar / Pelatihan Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Agenda Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Bazar Peringatan Hari Jadi Sidoarjo"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Agenda *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Bazar UMKM">Bazar UMKM</option>
                    <option value="Klinik Perizinan">Klinik Perizinan</option>
                    <option value="Pelatihan Kapasitas">Pelatihan Kapasitas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jadwal Pelaksanaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={newScheduleText}
                    onChange={(e) => setNewScheduleText(e.target.value)}
                    placeholder="Sabtu, 12 Des 2026 · 08.00 WIB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kuota Maks *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Satuan Kuota *
                  </label>
                  <select
                    value={newUnitLabel}
                    onChange={(e) => setNewUnitLabel(e.target.value as 'Booth' | 'Peserta')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Booth">Booth Pameran</option>
                    <option value="Peserta">Peserta Klinik / Pelatihan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lokasi Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Halaman Pendopo Kecamatan Porong"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Singkat *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Deskripsi tujuan agenda..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg"
              >
                Publikasikan Agenda
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
