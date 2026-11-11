import { useEffect, useRef, useState } from 'react';
import type { CertificateRecord, SiteSettings } from '../types';
import { APJ_LOGO_SRC } from './ApjLogo';

const APJ_SIGNATURE_SRC = '/assets/aistudio/signature_283df036.jpg';

interface CertificateViewProps {
  certificate: Pick<
    CertificateRecord,
    'certificateId' | 'studentName' | 'courseName' | 'completionDate' | 'isDemo' | 'authorizedSignatory'
  >;
  settings?: Pick<SiteSettings, 'email' | 'whatsappNumber' | 'websiteDomain'>;
  exportRef?: React.RefObject<HTMLDivElement | null>;
}

const CANONICAL_WIDTH = 1122;
const CANONICAL_HEIGHT = 794;

function useTransparentSignature(src: string): string {
  const [dataUrl, setDataUrl] = useState(src);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = (r + g + b) / 3;
          // Remove white/near-white paper background cleanly while preserving dark blue ink
          if (luminance > 212) {
            data[i + 3] = 0;
          } else if (luminance > 175) {
            data[i + 3] = Math.round(((212 - luminance) / 37) * 255);
          }
        }
        ctx.putImageData(imgData, 0, 0);
        const processed = canvas.toDataURL('image/png');
        if (!cancelled) setDataUrl(processed);
      } catch {
        // Fallback to raw image with multiply blend
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return dataUrl;
}

export function CertificateView({ certificate, exportRef }: CertificateViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const signatureUrl = useTransparentSignature(APJ_SIGNATURE_SRC);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(Math.min(1, width / CANONICAL_WIDTH));
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scaledHeight = Math.round(CANONICAL_HEIGHT * scale);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <div
        className="relative overflow-hidden shadow-lg border border-slate-200 bg-[#FAF8F2]"
        style={{
          width: `${Math.round(CANONICAL_WIDTH * scale)}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <div
          ref={exportRef}
          className="certificate-bg-pattern relative select-none overflow-hidden text-[#071426]"
          style={{
            width: `${CANONICAL_WIDTH}px`,
            height: `${CANONICAL_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Outer subtle ivory margin & Double Gold Rectangular Frame */}
          <div className="absolute inset-[18px] border-[2.5px] border-[#C89B3C] pointer-events-none z-10" />
          <div className="absolute inset-[24px] border border-[#E2C16B]/70 pointer-events-none z-10" />

          {/* Corner Geometric Navy & Gold Artwork + Circuit Traces */}
          <svg
            viewBox="0 0 1122 794"
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8DF8B" />
                <stop offset="50%" stopColor="#D3A23B" />
                <stop offset="100%" stopColor="#9A6F1E" />
              </linearGradient>
              <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D284D" />
                <stop offset="100%" stopColor="#061224" />
              </linearGradient>
            </defs>

            {/* Top-left corner ribbon */}
            <polygon points="0,0 135,0 0,135" fill="url(#navyGrad)" />
            <polygon points="105,0 138,0 0,138 0,105" fill="url(#goldGrad)" />
            <polygon points="0,0 64,0 0,64" fill="#040C18" />

            {/* Top-right geometric layered navy/gold ribbons + circuit traces */}
            <polygon points="785,0 1122,0 1122,315" fill="url(#navyGrad)" />
            <polygon points="758,0 808,0 1122,272 1122,312" fill="url(#goldGrad)" />
            <polygon points="845,0 885,0 1122,198 1122,232" fill="url(#goldGrad)" />
            <polygon points="908,0 1122,0 1122,188" fill="#061224" />
            <g stroke="#E5AC32" strokeWidth="1.2" fill="none" strokeOpacity="0.65">
              <path d="M950 28 H1025 L1045 48 H1095" />
              <circle cx="950" cy="28" r="2.5" fill="#E5AC32" />
              <circle cx="1095" cy="48" r="2.5" fill="#E5AC32" />
              <path d="M985 52 H1038 L1062 76 H1102" />
              <circle cx="985" cy="52" r="2.5" fill="#E5AC32" />
              <path d="M1040 16 V36 L1068 64 V115" />
              <circle cx="1068" cy="115" r="2.5" fill="#E5AC32" />
            </g>

            {/* Middle-left geometric chevron + circuit traces */}
            <polygon points="0,335 162,482 0,628" fill="url(#navyGrad)" />
            <polygon points="0,315 182,482 0,648 0,626 158,482 0,338" fill="url(#goldGrad)" />
            <polygon points="0,382 110,482 0,582" fill="#061224" />
            <g stroke="#E5AC32" strokeWidth="1.1" fill="none" strokeOpacity="0.65">
              <path d="M14 420 L58 462 L58 518 L24 552" />
              <circle cx="14" cy="420" r="2.2" fill="#E5AC32" />
              <circle cx="24" cy="552" r="2.2" fill="#E5AC32" />
              <path d="M22 392 L84 448 L112 448" />
              <circle cx="112" cy="448" r="2.2" fill="#E5AC32" />
              <path d="M30 482 H96 L114 500" />
              <circle cx="114" cy="500" r="2.2" fill="#E5AC32" />
            </g>

            {/* Bottom-right corner navy ribbon */}
            <polygon points="1122,520 1122,794 845,794" fill="url(#navyGrad)" />
            <polygon points="1122,502 1122,526 855,794 832,794" fill="url(#goldGrad)" />

            {/* Clean Bottom Navy & Gold Decorative Border (No mail/address/contact text) */}
            <polygon points="0,760 1122,760 1122,794 0,794" fill="#071426" />
            <polygon points="0,760 165,760 205,794 0,794" fill="url(#goldGrad)" />
            <polygon points="0,760 92,760 130,794 0,794" fill="#081830" />
            <polygon points="940,760 1018,760 980,794 902,794" fill="url(#goldGrad)" />
            <line x1="0" y1="760" x2="1122" y2="760" stroke="#E5AC32" strokeWidth="2.5" />
          </svg>

          {/* Top-Left Exact Original APJ Logo */}
          <div className="absolute top-[36px] left-[66px] z-20">
            <img
              src={APJ_LOGO_SRC}
              alt="APJ Tech Official Logo"
              className="w-[172px] h-[172px] rounded-full object-contain bg-white shadow-md"
            />
          </div>

          {/* Main Header & Body Content */}
          <div className="relative z-20 flex flex-col items-center text-center pt-[34px] px-[96px]">
            {/* Company Title & Tagline */}
            <h2 className="font-display text-[46px] font-bold tracking-tight text-[#071426] leading-none">
              APJ Tech
            </h2>

            <div className="mt-2 flex items-center justify-center gap-4 w-full max-w-[460px]">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#D4A035] to-[#D4A035]" />
              <span className="font-display italic font-semibold text-[25px] text-[#071426] leading-none">
                Build &amp; Inspire
              </span>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#D4A035] to-[#D4A035]" />
            </div>

            <p className="mt-1.5 font-serif-cert text-[19px] font-semibold text-[#0F2442]">
              Turning Ideas into Technology.
            </p>

            {/* Dark Navy Ribbon Banner: CERTIFICATE OF COMPLETION */}
            <div className="relative mt-4 flex items-center justify-center">
              <div
                className="h-[46px] w-[28px] bg-gradient-to-b from-[#E5AC32] to-[#9A6F1E] -mr-2 translate-y-2"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 42% 50%)' }}
              />
              <div
                className="relative px-14 py-2.5 bg-gradient-to-b from-[#102B50] to-[#071426] border-y-2 border-[#E5AC32] shadow-sm"
                style={{
                  clipPath: 'polygon(18px 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 18px 100%, 0 50%)',
                }}
              >
                <span className="font-display text-[26px] font-semibold tracking-[0.14em] text-white uppercase whitespace-nowrap">
                  CERTIFICATE OF COMPLETION
                </span>
              </div>
              <div
                className="h-[46px] w-[28px] bg-gradient-to-b from-[#E5AC32] to-[#9A6F1E] -ml-2 translate-y-2"
                style={{ clipPath: 'polygon(0 0, 100% 0, 58% 50%, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* Presentation Copy */}
            <p className="mt-6 font-serif-cert text-[22px] font-semibold text-[#071426]">
              This certificate is proudly presented to
            </p>

            {/* Student Name in Script */}
            <p className="mt-2 font-script-cert text-[62px] text-[#071426] leading-[1.08] px-4">
              {certificate.studentName}
            </p>

            {/* Gold Diamond Divider */}
            <div className="mt-1 flex items-center justify-center gap-2 w-full max-w-[560px]">
              <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#D4A035] to-[#D4A035]" />
              <span className="h-2 w-2 rotate-45 bg-[#D4A035]" />
              <span className="h-3.5 w-3.5 rotate-45 bg-[#E5AC32]" />
              <span className="h-2 w-2 rotate-45 bg-[#D4A035]" />
              <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-[#D4A035] to-[#D4A035]" />
            </div>

            <p className="mt-3.5 font-serif-cert text-[21px] font-semibold text-[#071426]">
              for successfully completing the course
            </p>

            {/* Course Name Dark Navy Plaque */}
            <div className="mt-2.5 inline-flex items-center justify-center px-12 py-2 bg-gradient-to-b from-[#102B50] to-[#071426] border-2 border-[#D4A035] rounded-lg shadow-sm">
              <span className="font-display text-[26px] font-bold text-[#F3C653] tracking-wide">
                {certificate.courseName}
              </span>
            </div>

            {/* Appreciation Lines */}
            <p className="mt-4 font-serif-cert italic text-[18.5px] font-medium text-[#102B50] leading-snug max-w-[680px]">
              Your dedication and hard work have been recognized and appreciated.
              <br />
              Keep learning and achieving more!
            </p>
          </div>

          {/* Diagonal SAMPLE Watermark (Strictly on Demo Certificates ONLY) */}
          {certificate.isDemo && (
            <div
              className="absolute right-[78px] top-[350px] z-30 pointer-events-none select-none"
              style={{ transform: 'rotate(-19deg)' }}
            >
              <div className="px-8 py-2.5 rounded-xl border-[5px] border-slate-500/35 bg-white/10">
                <span className="font-display text-[56px] font-bold tracking-[0.18em] text-slate-600/35 uppercase leading-none">
                  SAMPLE
                </span>
              </div>
            </div>
          )}

          {/* Bottom Metadata Row: Certificate ID Laurel Badge | Completion Date | Signature & Seal */}
          <div className="absolute bottom-[50px] left-[64px] right-[52px] z-20 flex items-end justify-between">
            {/* Left: Laurel Wreath Certificate ID Badge */}
            <div className="relative flex flex-col items-center w-[220px]">
              <svg viewBox="0 0 220 120" className="w-[215px] h-[118px]" aria-hidden="true">
                <g fill="#C89B3C">
                  <polygon points="110,6 113,13 120,13 114,17 116,24 110,20 104,24 106,17 100,13 107,13" />
                  <polygon points="84,14 86,18 90,18 87,21 88,25 84,22 80,25 81,21 78,18 82,18" />
                  <polygon points="136,14 138,18 142,18 139,21 140,25 136,22 132,25 133,21 130,18 134,18" />
                  <polygon points="62,25 63.5,28 67,28 64.5,30 65.5,33 62,31 58.5,33 59.5,30 57,28 60.5,28" />
                  <polygon points="158,25 159.5,28 163,28 160.5,30 161.5,33 158,31 154.5,33 155.5,30 153,28 156.5,28" />
                </g>
                <path
                  d="M46,35 C30,52 30,78 52,96 M40,48 C34,54 34,62 42,66 M36,64 C32,72 34,80 44,82 M42,80 C40,88 46,94 56,95"
                  fill="none"
                  stroke="#C89B3C"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M174,35 C190,52 190,78 168,96 M180,48 C186,54 186,62 178,66 M184,64 C188,72 186,80 176,82 M178,80 C180,88 174,94 164,95"
                  fill="none"
                  stroke="#C89B3C"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <polygon points="18,76 202,76 192,94 202,110 18,110 28,94" fill="#D9A83E" />
                <rect x="34" y="72" width="152" height="32" rx="3" fill="#F0C65E" stroke="#B68524" strokeWidth="1.2" />
              </svg>
              <div className="absolute top-[30px] text-center">
                <p className="font-serif-cert text-[15px] font-bold text-[#071426] leading-tight">
                  Certificate
                  <br />
                  ID
                </p>
              </div>
              <div className="absolute top-[77px] left-0 right-0 text-center">
                <span className="font-mono text-[13px] font-bold tracking-wider text-[#071426] tabular-nums">
                  {certificate.certificateId}
                </span>
              </div>
            </div>

            {/* Vertical Gold Divider */}
            <div className="h-[58px] w-[1.5px] bg-[#D4A035]/70 mb-4" />

            {/* Center: Completion Date */}
            <div className="flex items-center gap-3 pb-4">
              <svg viewBox="0 0 28 28" className="w-8 h-8 text-[#071426] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="22" height="20" rx="2.5" />
                <line x1="3" y1="11" x2="25" y2="11" />
                <line x1="9" y1="2.5" x2="9" y2="6.5" />
                <line x1="19" y1="2.5" x2="19" y2="6.5" />
                <rect x="7.5" y="14.5" width="3" height="3" fill="currentColor" />
                <rect x="12.5" y="14.5" width="3" height="3" fill="currentColor" />
                <rect x="17.5" y="14.5" width="3" height="3" fill="currentColor" />
                <rect x="7.5" y="19.5" width="3" height="3" fill="currentColor" />
                <rect x="12.5" y="19.5" width="3" height="3" fill="currentColor" />
              </svg>
              <div className="text-left">
                <p className="text-[13px] font-medium text-[#102B50] leading-tight">
                  Completion Date
                </p>
                <p className="font-serif-cert text-[19px] font-bold text-[#071426] tabular-nums leading-tight mt-0.5">
                  {certificate.completionDate}
                </p>
              </div>
            </div>

            {/* Vertical Gold Divider */}
            <div className="h-[58px] w-[1.5px] bg-[#D4A035]/70 mb-4" />

            {/* Right: Uploaded Authorized Signature Image + Rosette Seal */}
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center pb-2">
                <img
                  src={signatureUrl}
                  alt="Authorized Signature"
                  className={`h-[56px] w-auto max-w-[205px] object-contain pointer-events-none select-none mb-0.5 ${
                    signatureUrl === APJ_SIGNATURE_SRC ? 'mix-blend-multiply contrast-125' : ''
                  }`}
                />
                <div className="w-[205px] h-[1.5px] bg-[#071426]" />
                <p className="mt-1 text-[13.5px] font-semibold text-[#071426]">
                  {certificate.authorizedSignatory || 'Authorized Signature'}
                </p>
                <p className="text-[12.5px] font-medium text-[#102B50]">APJ Tech</p>
              </div>

              {/* Gold Rosette Seal with Blue Ribbons */}
              <svg viewBox="0 0 110 135" className="w-[100px] h-[122px] shrink-0" aria-hidden="true">
                <polygon points="34,76 54,82 40,128 28,116 18,124" fill="#071426" stroke="#E5AC32" strokeWidth="1.5" />
                <polygon points="76,76 56,82 70,128 82,116 92,124" fill="#071426" stroke="#E5AC32" strokeWidth="1.5" />
                <circle cx="55" cy="48" r="37" fill="#D4A035" stroke="#9A6F1E" strokeWidth="2" />
                <circle cx="55" cy="48" r="30" fill="#F2C85B" stroke="#9A6F1E" strokeWidth="1.5" />
                <circle cx="55" cy="48" r="24" fill="#071426" stroke="#E5AC32" strokeWidth="1.5" />
                <polygon
                  points="55,31 59.5,42 71,42.5 62,49.5 65,61 55,54.5 45,61 48,49.5 39,42.5 50.5,42"
                  fill="#F2C85B"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
