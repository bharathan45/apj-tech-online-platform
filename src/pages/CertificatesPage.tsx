import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Download, Search, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CertificateView } from '../components/CertificateView';
import { useSite } from '../context/SiteContext';
import { api } from '../lib/api';
import { downloadCertificateAsPdf } from '../lib/certificatePdf';
import type { CertificateRecord } from '../types';

export function CertificatesPage() {
  const { content, settings } = useSite();
  const [searchParams] = useSearchParams();
  const demoCertRef = useRef<HTMLDivElement | null>(null);
  const verifiedCertRef = useRef<HTMLDivElement | null>(null);

  const [lookupId, setLookupId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifiedResult, setVerifiedResult] = useState<{
    verified: boolean;
    revoked?: boolean;
    message?: string;
    certificate?: CertificateRecord;
  } | null>(null);

  const [downloadingDemo, setDownloadingDemo] = useState(false);
  const [downloadingVerified, setDownloadingVerified] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const demoCertificate: CertificateRecord = {
    id: 'cert-demo-001',
    certificateId: 'APJ-DEMO-001',
    studentName: 'Sample Student',
    studentEmail: '',
    courseName: 'Python + AI',
    completionDate: 'Sample Date',
    issuedAt: '',
    isDemo: true,
    verifiedCompletion: true,
    status: 'Active',
    authorizedSignatory: settings.authorizedSignatory || 'Authorized Signature',
  };

  async function runVerification(idToVerify: string) {
    if (!idToVerify.trim()) return;
    setVerifying(true);
    setVerifyError(null);
    setVerifiedResult(null);

    try {
      const res = await api.verifyCertificate(idToVerify.trim());
      setVerifiedResult(res);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId && queryId.trim()) {
      setLookupId(queryId.trim().toUpperCase());
      runVerification(queryId.trim());
    }
  }, [searchParams]);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    await runVerification(lookupId);
  }

  async function handleDownloadDemoPdf() {
    if (!demoCertRef.current) return;
    setDownloadingDemo(true);
    setPdfError(null);
    try {
      await downloadCertificateAsPdf(
        demoCertRef.current,
        demoCertificate.certificateId,
        demoCertificate.studentName
      );
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Unable to generate PDF.');
    } finally {
      setDownloadingDemo(false);
    }
  }

  async function handleDownloadVerifiedPdf() {
    if (!verifiedCertRef.current || !verifiedResult?.certificate) return;
    setDownloadingVerified(true);
    setPdfError(null);
    try {
      await downloadCertificateAsPdf(
        verifiedCertRef.current,
        verifiedResult.certificate.certificateId,
        verifiedResult.certificate.studentName
      );
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Unable to generate PDF.');
    } finally {
      setDownloadingVerified(false);
    }
  }

  return (
    <div>
      <section className="bg-[#071426] text-white py-16 border-b border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm font-semibold text-[#E5AC32]">
            {content.onlineBanner}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance max-w-3xl">
            Certificates &amp; Online Verification
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Verify any APJ Tech Certificate of Completion using its unique Certificate ID, or
            preview and download our official Demo Certificate sample below.
          </p>
        </div>
      </section>

      <section className="py-14 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Verification Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#258BFF]">
                <ShieldCheck className="h-4 w-4" />
                <span>Certificate Verification</span>
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#071426]">
                Verify a Unique Certificate ID
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter an issued APJ Tech Certificate ID (for example, try{' '}
                <button
                  type="button"
                  onClick={() => setLookupId('APJ-DEMO-001')}
                  className="font-mono font-semibold text-[#258BFF] hover:underline cursor-pointer"
                >
                  APJ-DEMO-001
                </button>
                ) to verify the record directly from our server database.
              </p>

              <form onSubmit={handleVerify} className="mt-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value)}
                    placeholder="Enter Certificate ID (e.g. APJ-2026-1042)"
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-6 py-3 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {verifying ? 'Verifying...' : 'Verify Certificate'}
                </button>
              </form>
            </div>

            {verifyError && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Certificate Not Found</p>
                  <p className="mt-0.5">{verifyError}</p>
                </div>
              </div>
            )}

            {verifiedResult?.revoked && verifiedResult.certificate && (
              <div className="mt-6 p-5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-sm text-amber-900">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    Certificate Revoked ({verifiedResult.certificate.certificateId})
                  </p>
                  <p className="mt-1">{verifiedResult.message}</p>
                </div>
              </div>
            )}

            {verifiedResult?.verified && verifiedResult.certificate && (
              <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-950">
                        {verifiedResult.certificate.isDemo
                          ? 'Verified Demo Sample Certificate (SAMPLE ONLY)'
                          : 'Verified Authentic APJ Tech Certificate'}
                      </p>
                      <p className="mt-1 text-xs text-emerald-800">
                        Student: <strong>{verifiedResult.certificate.studentName}</strong> ·
                        Course: <strong>{verifiedResult.certificate.courseName}</strong> ·
                        Completion Date: <strong>{verifiedResult.certificate.completionDate}</strong> ·
                        ID:{' '}
                        <span className="font-mono font-semibold">
                          {verifiedResult.certificate.certificateId}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadVerifiedPdf}
                    disabled={downloadingVerified}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#071426] hover:bg-[#102B50] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-[#E5AC32]" />
                    <span>{downloadingVerified ? 'Generating PDF...' : 'Download A4 PDF'}</span>
                  </button>
                </div>

                <CertificateView
                  certificate={verifiedResult.certificate}
                  settings={settings}
                  exportRef={verifiedCertRef}
                />
              </div>
            )}
          </div>

          {/* Official Demo Sample Certificate Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#258BFF]">
                  Demo Certificate Preview
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-[#071426]">
                  Official Landscape A4 Certificate Format (Sample)
                </h2>
                <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                  Student Name: <strong>Sample Student</strong> · Course:{' '}
                  <strong>Python + AI</strong> · Certificate ID:{' '}
                  <span className="font-mono font-semibold">APJ-DEMO-001</span> · Completion Date:{' '}
                  <strong>Sample Date</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadDemoPdf}
                disabled={downloadingDemo}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#071426] hover:bg-[#102B50] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#E5AC32]" />
                <span>{downloadingDemo ? 'Exporting Landscape A4 PDF...' : 'Download Demo PDF'}</span>
              </button>
            </div>

            {pdfError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {pdfError}
              </div>
            )}

            <div className="mt-8">
              <CertificateView
                certificate={demoCertificate}
                settings={settings}
                exportRef={demoCertRef}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p>
                Real certificates without the SAMPLE watermark are issued strictly by authorized
                APJ Tech administrators only after verifying course completion.
              </p>
              <p className="shrink-0 font-medium text-slate-600">
                Internal Completion Record · No external or government accreditation claimed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
