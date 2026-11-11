import { useState } from 'react';
import { resolveApiUrl } from '../lib/api';
import type { Course } from '../types';

interface CourseArtworkProps {
  course: Pick<Course, 'slug' | 'title' | 'imageUrl' | 'category'>;
  className?: string;
}

export function CourseArtwork({ course, className = 'h-48 w-full' }: CourseArtworkProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (course.imageUrl && !imgFailed) {
    return (
      <div className={`relative overflow-hidden bg-[#071426] ${className}`}>
        <img
          src={resolveApiUrl(course.imageUrl)}
          alt={course.title}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const slug = course.slug.toLowerCase();

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#071426] via-[#0E2344] to-[#102B50] p-5 flex flex-col justify-between ${className}`}
    >
      {/* Subtle blueprint grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id={`grid-${course.slug}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#258BFF" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${course.slug})`} />
      </svg>

      {/* Domain-specific technical motif */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <span className="text-[11px] font-medium tracking-wider uppercase text-[#E5AC32]">
          100% Online Track
        </span>
        {slug.includes('python') ? (
          <svg viewBox="0 0 120 72" className="h-14 w-24 shrink-0" aria-hidden="true">
            <circle cx="24" cy="20" r="6" fill="#258BFF" />
            <circle cx="24" cy="52" r="6" fill="#258BFF" />
            <circle cx="62" cy="14" r="6" fill="#E5AC32" />
            <circle cx="62" cy="36" r="6" fill="#E5AC32" />
            <circle cx="62" cy="58" r="6" fill="#E5AC32" />
            <circle cx="98" cy="36" r="7" fill="#FFFFFF" />
            <path
              d="M30 20 L56 14 M30 20 L56 36 M30 52 L56 36 M30 52 L56 58 M68 14 L91 36 M68 36 L91 36 M68 58 L91 36"
              stroke="#60A5FA"
              strokeWidth="1.5"
              strokeOpacity="0.65"
            />
          </svg>
        ) : slug.includes('office') ? (
          <svg viewBox="0 0 120 72" className="h-14 w-24 shrink-0" aria-hidden="true">
            <rect x="12" y="10" width="96" height="52" rx="4" fill="#071426" stroke="#258BFF" strokeOpacity="0.5" />
            <line x1="12" y1="24" x2="108" y2="24" stroke="#258BFF" strokeOpacity="0.4" />
            <line x1="44" y1="10" x2="44" y2="62" stroke="#258BFF" strokeOpacity="0.4" />
            <line x1="76" y1="10" x2="76" y2="62" stroke="#258BFF" strokeOpacity="0.4" />
            <rect x="49" y="31" width="22" height="6" rx="1" fill="#E5AC32" />
            <rect x="81" y="45" width="20" height="6" rx="1" fill="#258BFF" />
          </svg>
        ) : slug.includes('analytics') ? (
          <svg viewBox="0 0 120 72" className="h-14 w-24 shrink-0" aria-hidden="true">
            <rect x="14" y="40" width="12" height="22" rx="2" fill="#258BFF" />
            <rect x="34" y="28" width="12" height="34" rx="2" fill="#258BFF" fillOpacity="0.8" />
            <rect x="54" y="18" width="12" height="44" rx="2" fill="#E5AC32" />
            <rect x="74" y="26" width="12" height="36" rx="2" fill="#258BFF" />
            <rect x="94" y="12" width="12" height="50" rx="2" fill="#E5AC32" />
            <path d="M20 34 L40 22 L60 12 L80 20 L100 8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          </svg>
        ) : slug.includes('frontend') ? (
          <svg viewBox="0 0 120 72" className="h-14 w-24 shrink-0" aria-hidden="true">
            <rect x="8" y="10" width="104" height="52" rx="5" fill="#071426" stroke="#258BFF" strokeOpacity="0.6" />
            <circle cx="18" cy="18" r="2.5" fill="#E5AC32" />
            <circle cx="26" cy="18" r="2.5" fill="#258BFF" />
            <rect x="18" y="28" width="38" height="24" rx="3" fill="#102B50" stroke="#258BFF" strokeOpacity="0.5" />
            <rect x="62" y="28" width="40" height="10" rx="2" fill="#E5AC32" fillOpacity="0.9" />
            <rect x="62" y="42" width="40" height="10" rx="2" fill="#258BFF" fillOpacity="0.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 120 72" className="h-14 w-24 shrink-0" aria-hidden="true">
            <ellipse cx="60" cy="18" rx="34" ry="8" fill="#102B50" stroke="#E5AC32" strokeWidth="1.5" />
            <path d="M26 18 V36 C26 40.4 41.2 44 60 44 C78.8 44 94 40.4 94 36 V18" fill="none" stroke="#258BFF" strokeWidth="1.5" />
            <path d="M26 36 V54 C26 58.4 41.2 62 60 62 C78.8 62 94 58.4 94 54 V36" fill="none" stroke="#258BFF" strokeWidth="1.5" />
            <ellipse cx="60" cy="36" rx="34" ry="8" fill="none" stroke="#258BFF" strokeOpacity="0.5" />
          </svg>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        <p className="text-xs text-slate-300 truncate">{course.category}</p>
        <p className="font-display text-xl font-semibold text-white tracking-tight truncate">
          {course.title}
        </p>
      </div>
    </div>
  );
}
