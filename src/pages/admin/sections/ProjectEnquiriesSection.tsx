import { useEffect, useMemo, useState } from 'react';
import { Mail, MessageCircle, Search, Trash2, X } from 'lucide-react';
import { useSite } from '../../../context/SiteContext';
import { api } from '../../../lib/api';
import type { EnquiryStatus, ProjectEnquiry } from '../../../types';

const STATUS_OPTIONS: EnquiryStatus[] = [
  'New',
  'Contacted',
  'In Progress',
  'Completed',
  'Rejected',
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ProjectEnquiriesSection({ onStatsChanged }: { onStatsChanged: () => void }) {
  const { settings } = useSite();
  const [enquiries, setEnquiries] = useState<ProjectEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState<ProjectEnquiry | null>(null);
  const [statusDraft, setStatusDraft] = useState<EnquiryStatus>('New');
  const [assignedDraft, setAssignedDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const list = await api.getProjectEnquiries();
      setEnquiries(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return enquiries.filter((item) => {
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.studentName.toLowerCase().includes(q) ||
        item.projectTitle.toLowerCase().includes(q) ||
        item.projectType.toLowerCase().includes(q) ||
        item.collegeName.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [enquiries, statusFilter, search]);

  function openDetail(item: ProjectEnquiry) {
    setSelected(item);
    setStatusDraft(item.status);
    setAssignedDraft(item.assignedTo || '');
    setNotesDraft(item.internalNotes || '');
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await api.updateProjectEnquiry(selected.id, {
        status: statusDraft,
        assignedTo: assignedDraft,
        internalNotes: notesDraft,
      });
      setSelected(updated);
      await load();
      onStatsChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await api.deleteProjectEnquiry(id);
    if (selected?.id === id) setSelected(null);
    await load();
    onStatsChanged();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#071426]">Project Enquiries</h2>
          <p className="text-xs text-slate-500">
            Review student project proposals, assign mentors, update statuses, and track internal notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or student..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading project enquiries...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No project enquiries submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Project Title &amp; Type</th>
                  <th className="py-3.5 px-4">Tech Stack</th>
                  <th className="py-3.5 px-4">Assigned Team Member</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const cleanWa = item.whatsappNumber.replace(/[^0-9]/g, '');
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#071426]">{item.studentName}</p>
                        <p className="text-xs text-slate-500">
                          {item.collegeName} · {item.department}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-[#102B50]">{item.projectTitle}</p>
                        <p className="text-xs text-slate-500">{item.projectType}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {item.preferredTechnology}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#071426]">
                        {item.assignedTo || <span className="text-slate-400">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {formatDate(item.enquiryDate)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-[#258BFF]">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetail(item)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-[#071426] bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                          >
                            View / Assign
                          </button>
                          <a
                            href={`https://wa.me/${cleanWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp Student"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-md"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={`mailto:${item.email}`}
                            title="Email Student"
                            className="p-1.5 text-[#258BFF] hover:bg-[#258BFF]/10 border border-[#258BFF]/30 rounded-md"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-md cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      {/* Project Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-[#071426]/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-slate-400">
                  {selected.id} · {selected.projectType}
                </p>
                <h3 className="font-display text-lg font-bold text-[#071426]">
                  {selected.projectTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F4F7FC] p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Student</span>
                  <strong className="text-[#071426]">{selected.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">College &amp; Department</span>
                  <strong className="text-[#071426]">
                    {selected.collegeName} ({selected.department})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">WhatsApp</span>
                  <strong className="text-[#071426] tabular-nums">{selected.whatsappNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <strong className="text-[#071426] break-all">{selected.email}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Preferred Technology</span>
                  <strong className="text-[#071426]">{selected.preferredTechnology}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Required Support</span>
                  <strong className="text-[#071426]">{selected.requiredSupport}</strong>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#071426] mb-1">Project Description</p>
                <p className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selected.projectDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Enquiry Status
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as EnquiryStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Assign Team Member
                  </label>
                  <select
                    value={assignedDraft}
                    onChange={(e) => setAssignedDraft(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    <option value="">Unassigned</option>
                    {settings.teamMembers.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Internal Mentor Notes
                </label>
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Architecture notes, milestone schedule, review observations..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selected.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#102B50] bg-slate-100 border border-slate-200 rounded-lg"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Assignment & Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
