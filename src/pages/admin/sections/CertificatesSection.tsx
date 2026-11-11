import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  Eye,
  Mail,
  Plus,
  Send,
  ShieldCheck,
  ShieldOff,
  Trash2,
  X,
} from 'lucide-react';
import { CertificateView } from '../../../components/CertificateView';
import { useSite } from '../../../context/SiteContext';
import { api } from '../../../lib/api';
import { downloadCertificateAsPdf } from '../../../lib/certificatePdf';
import type { CertificateRecord } from '../../../types';

function buildCertificateEmailContent(cert: CertificateRecord) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verifyUrl = `${origin}/certificates?id=${encodeURIComponent(cert.certificateId)}`;
  const subject = `APJ Tech Certificate of Completion — ${cert.courseName} (${cert.certificateId})`;
  const body = [
    `Dear ${cert.studentName},`,
    '',
    `Congratulations on successfully completing the "${cert.courseName}" online course at APJ Tech!`,
    '',
    `Certificate Details:`,
    `- Student Name: ${cert.studentName}`,
    `- Course: ${cert.courseName}`,
    `- Certificate ID: ${cert.certificateId}`,
    `- Completion Date: ${cert.completionDate}`,
    '',
    `Verify & Download your official Certificate online:`,
    verifyUrl,
    '',
    `Best regards,`,
    `APJ Tech`,
    `Build & Inspire. Turning Ideas into Technology.`,
  ].join('\n');

  const to = encodeURIComponent(cert.studentEmail || '');
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return { mailtoUrl, gmailUrl };
}

export function CertificatesSection({ onStatsChanged }: { onStatsChanged: () => void }) {
  const { courses, settings } = useSite();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [courseName, setCourseName] = useState('Python + AI');
  const [completionDate, setCompletionDate] = useState(
    new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  );
  const [certificateId, setCertificateId] = useState('');
  const [verifiedCompletion, setVerifiedCompletion] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [lastIssued, setLastIssued] = useState<CertificateRecord | null>(null);

  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const previewExportRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    setLoading(true);
    try {
      const list = await api.getAdminCertificates();
      setCertificates(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load certificates.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openIssueModal() {
    setError(null);
    setShowIssueModal(true);
    try {
      const { nextCertificateId } = await api.getNextCertificateId();
      setCertificateId(nextCertificateId);
    } catch {
      setCertificateId('');
    }
  }

  function triggerMailDirect(cert: CertificateRecord) {
    const { mailtoUrl } = buildCertificateEmailContent(cert);
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function submitIssue(sendMailImmediately: boolean) {
    setError(null);
    setIssuing(true);
    try {
      const issued = await api.issueCertificate({
        studentName,
        studentEmail,
        courseName,
        completionDate,
        certificateId: certificateId.trim() || undefined,
        verifiedCompletion,
        authorizedSignatory: settings.authorizedSignatory,
      });
      setShowIssueModal(false);
      setStudentName('');
      setStudentEmail('');
      setCertificateId('');
      setVerifiedCompletion(false);
      setLastIssued(issued);
      await load();
      onStatsChanged();
      if (sendMailImmediately) {
        triggerMailDirect(issued);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to issue certificate.');
    } finally {
      setIssuing(false);
    }
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    submitIssue(false);
  }

  async function toggleStatus(cert: CertificateRecord) {
    if (cert.isDemo) return;
    const next = cert.status === 'Active' ? 'Revoked' : 'Active';
    await api.updateCertificateStatus(cert.id, next);
    await load();
    onStatsChanged();
  }

  async function handleDelete(cert: CertificateRecord) {
    if (cert.isDemo) return;
    await api.deleteCertificate(cert.id);
    if (previewCert?.id === cert.id) setPreviewCert(null);
    if (lastIssued?.id === cert.id) setLastIssued(null);
    await load();
    onStatsChanged();
  }

  async function handleDownloadPdf() {
    if (!previewExportRef.current || !previewCert) return;
    setDownloadingPdf(true);
    try {
      await downloadCertificateAsPdf(
        previewExportRef.current,
        previewCert.certificateId,
        previewCert.studentName
      );
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#071426]">
            Certificate Management
          </h2>
          <p className="text-xs text-slate-500">
            Unique IDs are generated automatically in ascending sequence. Click Send to open the student&apos;s email directly.
          </p>
        </div>

        <button
          type="button"
          onClick={openIssueModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Issue Real Certificate</span>
        </button>
      </div>

      {lastIssued && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-xs text-emerald-950">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                Certificate {lastIssued.certificateId} issued for {lastIssued.studentName}
              </p>
              <p className="text-emerald-800 mt-0.5">
                {lastIssued.studentEmail
                  ? `Ready to send directly to ${lastIssued.studentEmail}.`
                  : 'Open mail or preview to download Landscape A4 PDF.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={buildCertificateEmailContent(lastIssued).mailtoUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send to Mail</span>
            </a>
            <a
              href={buildCertificateEmailContent(lastIssued).gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#071426] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Open Gmail</span>
            </a>
            <button
              type="button"
              onClick={() => setPreviewCert(lastIssued)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#071426] hover:bg-[#102B50] rounded-lg cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#E5AC32]" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading certificates...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Certificate ID</th>
                  <th className="py-3.5 px-5">Student Name</th>
                  <th className="py-3.5 px-5">Course</th>
                  <th className="py-3.5 px-5">Completion Date</th>
                  <th className="py-3.5 px-5">Type / Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => {
                  const { mailtoUrl } = buildCertificateEmailContent(cert);
                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-mono text-xs font-bold text-[#102B50] tabular-nums">
                        {cert.certificateId}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#071426]">
                        <div>{cert.studentName}</div>
                        {cert.studentEmail && (
                          <div className="text-[11px] font-normal text-slate-500">
                            {cert.studentEmail}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-700">{cert.courseName}</td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 tabular-nums">
                        {cert.completionDate}
                      </td>
                      <td className="py-3.5 px-5 text-xs">
                        {cert.isDemo ? (
                          <span className="font-semibold text-amber-700">Demo Sample</span>
                        ) : (
                          <span
                            className={`font-semibold ${
                              cert.status === 'Active' ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            Official · {cert.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={mailtoUrl}
                            title={
                              cert.studentEmail
                                ? `Send certificate email directly to ${cert.studentEmail}`
                                : 'Open email compose for this certificate'
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-md"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Send</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setPreviewCert(cert)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#071426] bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview &amp; PDF</span>
                          </button>
                          {!cert.isDemo && (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleStatus(cert)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-md cursor-pointer"
                              >
                                {cert.status === 'Active' ? (
                                  <>
                                    <ShieldOff className="h-3.5 w-3.5 text-amber-600" />
                                    <span>Revoke</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                                    <span>Restore</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(cert)}
                                className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-md cursor-pointer"
                                title="Delete certificate"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue New Certificate Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-[#071426]/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#E5AC32]" />
                <h3 className="font-display text-lg font-bold text-[#071426]">
                  Issue Verified Certificate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Exact name to appear on certificate"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Student Email (for direct Send to Mail) *
                </label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Completed Course *
                </label>
                <select
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Completion Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    placeholder="Nov 09, 2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Unique Certificate ID (Auto Ascending)
                  </label>
                  <input
                    type="text"
                    value={certificateId}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono uppercase text-[#102B50] font-semibold"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#F4F7FC] border border-slate-200 text-xs text-[#071426] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={verifiedCompletion}
                  onChange={(e) => setVerifiedCompletion(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 shrink-0"
                />
                <span>
                  I confirm that this student has verified online course completion and satisfies
                  APJ Tech internal completion criteria.
                </span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#071426] hover:bg-[#102B50] disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  {issuing ? 'Issuing...' : 'Issue Certificate'}
                </button>
                <button
                  type="button"
                  disabled={issuing || !studentName.trim() || !studentEmail.trim() || !verifiedCompletion}
                  onClick={() => submitIssue(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Issue &amp; Send to Mail</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Certificate & Export PDF Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-[#071426]/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-slate-500">{previewCert.certificateId}</p>
                <h3 className="font-display text-lg font-bold text-[#071426]">
                  {previewCert.studentName} — {previewCert.courseName}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={buildCertificateEmailContent(previewCert).mailtoUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send to Mail</span>
                </a>
                <a
                  href={buildCertificateEmailContent(previewCert).gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#071426] bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Gmail</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#071426] hover:bg-[#102B50] rounded-lg cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-[#E5AC32]" />
                  <span>{downloadingPdf ? 'Generating PDF...' : 'Download Landscape A4 PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCert(null)}
                  className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-[#F4F7FC]">
              <CertificateView
                certificate={previewCert}
                settings={settings}
                exportRef={previewExportRef}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
