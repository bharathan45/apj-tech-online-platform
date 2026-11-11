import { useMemo, useState } from 'react';
import { Download, Eye, FileText, Search, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { resolveApiUrl } from '../lib/api';
import type { CourseMaterial } from '../types';

export function MaterialsPage() {
  const { content, materials, loading } = useSite();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState<CourseMaterial | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(materials.map((m) => m.courseCategory)));
    return ['All', ...unique];
  }, [materials]);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const catMatch = category === 'All' || m.courseCategory === category;
      const q = search.trim().toLowerCase();
      const textMatch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.courseCategory.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [materials, category, search]);

  return (
    <div>
      <section className="bg-[#071426] text-white py-16 border-b border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm font-semibold text-[#E5AC32]">
            {content.onlineBanner}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance max-w-3xl">
            Course Materials &amp; Practice Library
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Preview and download published PDF notes, spreadsheet exercises, JavaScript code
            examples, and SQL practice scripts directly from our online repository.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    category === cat
                      ? 'bg-[#071426] text-white'
                      : 'text-slate-600 hover:text-[#071426] hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes or files..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
              />
            </div>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-52 rounded-xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="font-display text-lg font-semibold text-[#071426]">
                No course materials found
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory('All');
                  setSearch('');
                }}
                className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#258BFF] rounded-lg cursor-pointer"
              >
                Show All Materials
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((mat) => (
                <article
                  key={mat.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        {mat.courseCategory} <span aria-hidden="true">·</span> {mat.fileType}{' '}
                        <span aria-hidden="true">·</span> {mat.fileSizeLabel}
                      </p>
                      <FileText className="h-5 w-5 text-[#102B50] shrink-0" aria-hidden="true" />
                    </div>
                    <h2 className="mt-3 font-display text-lg font-bold text-[#071426]">
                      {mat.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {mat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(mat)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#071426] hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>

                    <a
                      href={resolveApiUrl(mat.fileUrl)}
                      download={mat.fileName}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-[#071426]/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="material-preview-title"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  {previewItem.courseCategory} <span aria-hidden="true">·</span>{' '}
                  {previewItem.fileName}
                </p>
                <h3
                  id="material-preview-title"
                  className="font-display text-lg font-bold text-[#071426]"
                >
                  {previewItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                aria-label="Close preview"
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-slate-600">{previewItem.description}</p>
              {previewItem.storedFileName && previewItem.fileType === 'PDF' ? (
                <iframe
                  src={resolveApiUrl(`/uploads/${previewItem.storedFileName}`)}
                  title={previewItem.title}
                  className="w-full h-[420px] rounded-lg border border-slate-200"
                />
              ) : (
                <pre className="p-5 rounded-xl bg-[#071426] text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {previewItem.previewContent ||
                    `File "${previewItem.fileName}" is ready for download.`}
                </pre>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <a
                href={resolveApiUrl(previewItem.fileUrl)}
                download={previewItem.fileName}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
