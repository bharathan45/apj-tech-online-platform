import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Download, Eye, EyeOff, Plus, Trash2, Upload, X } from 'lucide-react';
import { useSite } from '../../../context/SiteContext';
import { api, resolveApiUrl } from '../../../lib/api';
import type { CourseMaterial } from '../../../types';

const COURSE_CATEGORIES = [
  'Python + AI',
  'MS Office',
  'Data Analytics',
  'Frontend Development',
  'Database Management',
  'General',
];

export function MaterialsSection({ onStatsChanged }: { onStatsChanged: () => void }) {
  const { refreshPublicData } = useSite();
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState(COURSE_CATEGORIES[0]);
  const [previewContent, setPreviewContent] = useState('');
  const [published, setPublished] = useState(true);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    storedFileName: string;
    fileName: string;
    fileType: string;
    fileSizeLabel: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadMaterials() {
    setLoading(true);
    try {
      const list = await api.getAdminMaterials();
      setMaterials(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load materials.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setError(null);
    try {
      const res = await api.uploadFile(file);
      setUploadedFileMeta({
        storedFileName: res.storedFileName,
        fileName: res.fileName,
        fileType: res.fileType,
        fileSizeLabel: res.fileSizeLabel,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createMaterial({
        title,
        description,
        courseCategory,
        previewContent,
        published,
        storedFileName: uploadedFileMeta?.storedFileName || '',
        fileName: uploadedFileMeta?.fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileType: uploadedFileMeta?.fileType || 'PDF',
        fileSizeLabel: uploadedFileMeta?.fileSizeLabel || 'Generated PDF',
      });
      setShowAdd(false);
      setTitle('');
      setDescription('');
      setPreviewContent('');
      setUploadedFileMeta(null);
      await loadMaterials();
      await refreshPublicData();
      onStatsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save material.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(mat: CourseMaterial) {
    try {
      await api.updateMaterial(mat.id, { published: !mat.published });
      await loadMaterials();
      await refreshPublicData();
      onStatsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteMaterial(id);
      setConfirmDeleteId(null);
      await loadMaterials();
      await refreshPublicData();
      onStatsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete material.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#071426]">
            Manage Course Materials
          </h2>
          <p className="text-xs text-slate-500">
            Upload PDFs or practice files. Only published materials appear to the public.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading study materials...</div>
        ) : materials.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No course materials uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-5">Course Category</th>
                  <th className="py-3.5 px-5">File</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-[#071426]">{m.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{m.description}</p>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                      {m.courseCategory}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 whitespace-nowrap">
                      {m.fileType} · {m.fileSizeLabel}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold ${
                          m.published ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {m.published ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={resolveApiUrl(m.fileUrl)}
                          download={m.fileName}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#071426] hover:bg-slate-100 border border-slate-200 rounded-md"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Test File</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => togglePublish(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer"
                        >
                          {m.published ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>Unpublish</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              <span>Publish</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(m.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6">
            <h3 className="font-display text-lg font-bold text-[#071426]">Delete Material?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This removes the study material and any uploaded file from the server.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-[#071426]/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#071426]">
                Upload Course Material
              </h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Material Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Python Loops Practice Worksheet"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Course Category *
                </label>
                <select
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {COURSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1.5">
                  Attach PDF or Practice File
                </label>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#071426] bg-[#F4F7FC] hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer">
                  <Upload className="h-4 w-4 text-[#258BFF]" />
                  <span>{uploadingFile ? 'Uploading File...' : 'Select File (PDF, XLSX, ZIP, SQL, JS...)'}</span>
                  <input type="file" onChange={handleFileSelect} className="hidden" />
                </label>
                {uploadedFileMeta && (
                  <p className="mt-1.5 text-xs text-emerald-700 font-medium">
                    Uploaded: {uploadedFileMeta.fileName} ({uploadedFileMeta.fileSizeLabel})
                  </p>
                )}
                {!uploadedFileMeta && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    If no file is uploaded, the system generates a formatted PDF from the notes below.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Preview Text / Study Notes Content (Optional)
                </label>
                <textarea
                  rows={3}
                  value={previewContent}
                  onChange={(e) => setPreviewContent(e.target.value)}
                  placeholder="Optional text preview or study notes..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-[#071426] cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Publish immediately to public Course Materials</span>
              </label>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingFile}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
