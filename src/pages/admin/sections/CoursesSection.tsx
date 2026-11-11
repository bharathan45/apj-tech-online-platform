import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Edit3, Eye, EyeOff, Plus, Trash2, Upload, X } from 'lucide-react';
import { useSite } from '../../../context/SiteContext';
import { api } from '../../../lib/api';
import type { Course, CourseModule } from '../../../types';

interface CourseDraft {
  id?: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  published: boolean;
  syllabusOverview: string;
  modules: CourseModule[];
  learningOutcomesText: string;
  sampleLessonTitle: string;
  sampleLessonContent: string;
  sampleLessonCode: string;
  practiceExercisesText: string;
  sampleProjectTitle: string;
  sampleProjectDescription: string;
}

function emptyDraft(): CourseDraft {
  return {
    title: '',
    slug: '',
    category: 'Online IT Training',
    shortDescription: '',
    description: '',
    imageUrl: '',
    published: true,
    syllabusOverview: '',
    modules: [{ id: 'm1', title: 'Module 1: Core Foundations', topics: ['Topic 1', 'Topic 2'] }],
    learningOutcomesText: '',
    sampleLessonTitle: '',
    sampleLessonContent: '',
    sampleLessonCode: '',
    practiceExercisesText: '',
    sampleProjectTitle: '',
    sampleProjectDescription: '',
  };
}

export function CoursesSection({ onStatsChanged }: { onStatsChanged: () => void }) {
  const { refreshPublicData } = useSite();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<CourseDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadCourses() {
    setLoading(true);
    try {
      const list = await api.getAdminCourses();
      setCourses(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load courses.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function openEdit(c: Course) {
    setEditing({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      shortDescription: c.shortDescription,
      description: c.description,
      imageUrl: c.imageUrl,
      published: c.published,
      syllabusOverview: c.syllabusOverview,
      modules: c.modules.length > 0 ? structuredClone(c.modules) : [{ id: 'm1', title: '', topics: [] }],
      learningOutcomesText: c.learningOutcomes.join('\n'),
      sampleLessonTitle: c.sampleLessonTitle,
      sampleLessonContent: c.sampleLessonContent,
      sampleLessonCode: c.sampleLessonCode,
      practiceExercisesText: c.practiceExercises.join('\n'),
      sampleProjectTitle: c.sampleProjectTitle,
      sampleProjectDescription: c.sampleProjectDescription,
    });
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingImg(true);
    try {
      const uploaded = await api.uploadFile(file);
      setEditing({ ...editing, imageUrl: uploaded.fileUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImg(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: editing.title,
      slug: editing.slug,
      category: editing.category,
      shortDescription: editing.shortDescription,
      description: editing.description,
      imageUrl: editing.imageUrl,
      published: editing.published,
      syllabusOverview: editing.syllabusOverview,
      modules: editing.modules.filter((m) => m.title.trim()),
      learningOutcomes: editing.learningOutcomesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      sampleLessonTitle: editing.sampleLessonTitle,
      sampleLessonContent: editing.sampleLessonContent,
      sampleLessonCode: editing.sampleLessonCode,
      practiceExercises: editing.practiceExercisesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      sampleProjectTitle: editing.sampleProjectTitle,
      sampleProjectDescription: editing.sampleProjectDescription,
    };

    try {
      if (editing.id) {
        await api.updateCourse(editing.id, payload);
      } else {
        await api.createCourse(payload);
      }
      setEditing(null);
      await loadCourses();
      await refreshPublicData();
      onStatsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save course.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(course: Course) {
    try {
      await api.updateCourse(course.id, { published: !course.published });
      await loadCourses();
      await refreshPublicData();
      onStatsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update publish state.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteCourse(id);
      setConfirmDeleteId(null);
      await loadCourses();
      await refreshPublicData();
      onStatsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete course.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#071426]">Manage Courses</h2>
          <p className="text-xs text-slate-500">
            Create, edit, publish, or unpublish courses. Published updates sync immediately to the public website.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyDraft())}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Course Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No courses created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Course Title</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Modules</th>
                  <th className="py-3.5 px-5">Visibility</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5 font-semibold text-[#071426]">
                      <div>{c.title}</div>
                      <div className="font-mono text-[11px] font-normal text-slate-400">
                        /{c.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{c.category}</td>
                    <td className="py-3.5 px-5 tabular-nums text-slate-600">
                      {c.modules.length}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-xs font-semibold ${
                          c.published ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {c.published ? 'Published' : 'Unpublished'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => togglePublish(c)}
                          title={c.published ? 'Unpublish course' : 'Publish course'}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer"
                        >
                          {c.published ? (
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
                          onClick={() => openEdit(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#258BFF] hover:bg-[#258BFF]/10 border border-[#258BFF]/30 rounded-md cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(c.id)}
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

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6">
            <h3 className="font-display text-lg font-bold text-[#071426]">Delete Course?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will permanently remove the course from the database and public website.
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Course Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-[#071426]/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#071426]">
                {editing.id ? `Edit Course: ${editing.title}` : 'Add New Course'}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Course Cover Image (Optional Upload)
                  </label>
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#071426] bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingImg ? 'Uploading...' : 'Upload Course Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {editing.imageUrl && (
                    <span className="ml-3 text-xs text-emerald-700 font-medium">Image attached</span>
                  )}
                </div>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-[#071426] cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={editing.published}
                    onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>Publish immediately on public website</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Short Summary *
                </label>
                <input
                  type="text"
                  required
                  value={editing.shortDescription}
                  onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Full Course Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Syllabus Overview
                </label>
                <input
                  type="text"
                  value={editing.syllabusOverview}
                  onChange={(e) => setEditing({ ...editing, syllabusOverview: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              {/* Modules Editor */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-[#071426] uppercase tracking-wider">
                    Course Modules &amp; Topics
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        modules: [
                          ...editing.modules,
                          {
                            id: `m-${Date.now()}`,
                            title: `Module ${editing.modules.length + 1}`,
                            topics: ['Topic 1'],
                          },
                        ],
                      })
                    }
                    className="text-xs font-semibold text-[#258BFF] hover:underline cursor-pointer"
                  >
                    + Add Module
                  </button>
                </div>

                <div className="space-y-3">
                  {editing.modules.map((mod, idx) => (
                    <div
                      key={mod.id}
                      className="p-4 rounded-lg bg-[#F4F7FC] border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => {
                            const next = [...editing.modules];
                            next[idx] = { ...mod, title: e.target.value };
                            setEditing({ ...editing, modules: next });
                          }}
                          placeholder="Module Title"
                          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white rounded border border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = editing.modules.filter((_, i) => i !== idx);
                            setEditing({ ...editing, modules: next });
                          }}
                          className="text-xs text-red-600 hover:underline px-2 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={mod.topics.join(', ')}
                        onChange={(e) => {
                          const next = [...editing.modules];
                          next[idx] = {
                            ...mod,
                            topics: e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean),
                          };
                          setEditing({ ...editing, modules: next });
                        }}
                        placeholder="Topics separated by commas"
                        className="w-full px-3 py-1.5 text-xs bg-white rounded border border-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Learning Outcomes (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={editing.learningOutcomesText}
                    onChange={(e) =>
                      setEditing({ ...editing, learningOutcomesText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Practice Exercises (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={editing.practiceExercisesText}
                    onChange={(e) =>
                      setEditing({ ...editing, practiceExercisesText: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Sample Lesson Title
                  </label>
                  <input
                    type="text"
                    value={editing.sampleLessonTitle}
                    onChange={(e) =>
                      setEditing({ ...editing, sampleLessonTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Sample Project Title
                  </label>
                  <input
                    type="text"
                    value={editing.sampleProjectTitle}
                    onChange={(e) =>
                      setEditing({ ...editing, sampleProjectTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Sample Lesson Content
                </label>
                <textarea
                  rows={2}
                  value={editing.sampleLessonContent}
                  onChange={(e) =>
                    setEditing({ ...editing, sampleLessonContent: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Sample Lesson Code Snippet (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editing.sampleLessonCode}
                  onChange={(e) =>
                    setEditing({ ...editing, sampleLessonCode: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Sample Project Description
                </label>
                <textarea
                  rows={2}
                  value={editing.sampleProjectDescription}
                  onChange={(e) =>
                    setEditing({ ...editing, sampleProjectDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-60 rounded-lg cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
