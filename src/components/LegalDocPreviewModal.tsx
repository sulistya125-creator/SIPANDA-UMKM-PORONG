import React from 'react';
import { Download, FileText, Image as ImageIcon, X } from 'lucide-react';
import { LegalDocumentAttachment } from '../types/umkm';

interface LegalDocPreviewModalProps {
  title: string;
  document: LegalDocumentAttachment;
  onClose: () => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const LegalDocPreviewModal: React.FC<LegalDocPreviewModalProps> = ({
  title,
  document,
  onClose,
}) => {
  const isImage = document.fileType.startsWith('image/');
  const isPdf =
    document.fileType === 'application/pdf' ||
    document.fileName.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/65 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-doc-preview-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#1E3A8A] flex items-center justify-center shrink-0">
              {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[#1E3A8A] uppercase tracking-wide">
                Pratinjau Dokumen {title}
              </div>
              <h4
                id="legal-doc-preview-title"
                className="text-sm font-bold text-slate-900 truncate"
              >
                {document.fileName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={document.dataUrl}
              download={document.fileName}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau dokumen"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
          <span>
            Ukuran: <strong className="text-slate-800">{formatFileSize(document.fileSize)}</strong> ·
            Tipe: <strong className="text-slate-800">{document.fileType || 'Dokumen'}</strong>
          </span>
          <span>
            Diunggah: <strong className="text-slate-800">{document.uploadedAt}</strong>
          </span>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4 flex items-center justify-center min-h-[340px]">
          {isImage ? (
            <img
              src={document.dataUrl}
              alt={`Dokumen ${title} - ${document.fileName}`}
              className="max-w-full max-h-[65vh] object-contain rounded-lg border border-slate-200 bg-white shadow-sm"
            />
          ) : isPdf ? (
            <iframe
              src={document.dataUrl}
              title={`Pratinjau PDF ${document.fileName}`}
              className="w-full h-[65vh] rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200 max-w-md space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-900">{document.fileName}</div>
              <p className="text-xs text-slate-500">
                Pratinjau langsung tidak tersedia untuk tipe berkas ini. Silakan unduh berkas untuk
                membukanya.
              </p>
              <a
                href={document.dataUrl}
                download={document.fileName}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-900 rounded-lg"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Dokumen
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
