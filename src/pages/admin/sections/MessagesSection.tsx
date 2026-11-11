import { useEffect, useState } from 'react';
import { Mail, MessageCircle, Trash2, X } from 'lucide-react';
import { api } from '../../../lib/api';
import type { ContactMessage, ContactStatus } from '../../../types';

const MESSAGE_STATUSES: ContactStatus[] = ['Unread', 'Read', 'Replied', 'Archived'];

export function MessagesSection({ onStatsChanged }: { onStatsChanged: () => void }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [statusDraft, setStatusDraft] = useState<ContactStatus>('Read');
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const list = await api.getContactMessages();
      setMessages(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openMessage(msg: ContactMessage) {
    setSelected(msg);
    setStatusDraft(msg.status === 'Unread' ? 'Read' : msg.status);
    setNotesDraft(msg.internalNotes || '');
    if (msg.status === 'Unread') {
      await api.updateContactMessage(msg.id, { status: 'Read' });
      await load();
      onStatsChanged();
    }
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await api.updateContactMessage(selected.id, {
        status: statusDraft,
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
    await api.deleteContactMessage(id);
    if (selected?.id === id) setSelected(null);
    await load();
    onStatsChanged();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-[#071426]">Contact Messages</h2>
        <p className="text-xs text-slate-500">
          Messages submitted through the Contact Us page. Reply via Email or WhatsApp and update status.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No contact messages received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Sender</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-[#071426]">{msg.name}</p>
                      <p className="text-xs text-slate-500">{msg.email}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-medium text-[#102B50]">{msg.subject}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{msg.message}</p>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-semibold text-[#258BFF]">
                      {msg.status}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openMessage(msg)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-[#071426] bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(msg.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-md cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {selected && (
        <div className="fixed inset-0 z-50 bg-[#071426]/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{selected.email}</p>
                <h3 className="font-display text-lg font-bold text-[#071426]">
                  {selected.subject}
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

            <div className="p-6 space-y-4 text-sm">
              <div className="p-4 rounded-lg bg-[#F4F7FC] border border-slate-200 text-xs space-y-1">
                <p>
                  <strong>From:</strong> {selected.name} ({selected.email})
                </p>
                {selected.phone && (
                  <p>
                    <strong>Phone:</strong> {selected.phone}
                  </p>
                )}
              </div>

              <p className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                {selected.message}
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">Status</label>
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as ContactStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {MESSAGE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#071426] mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(
                      selected.subject
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#102B50] bg-slate-100 border border-slate-200 rounded-lg"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Reply Email</span>
                  </a>
                  {selected.phone && (
                    <a
                      href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
