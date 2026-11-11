import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSite } from '../../../context/SiteContext';
import { api } from '../../../lib/api';
import type { WebsiteContent } from '../../../types';

export function ContentSection() {
  const { refreshPublicData } = useSite();
  const [form, setForm] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAdminContent()
      .then((c) => setForm(c))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load content.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSavedNotice(false);
    setError(null);
    try {
      const updated = await api.updateAdminContent(form);
      setForm(updated);
      await refreshPublicData();
      setSavedNotice(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save content.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <div className="p-8 text-sm text-slate-500">Loading website content editor...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-xl font-bold text-[#071426]">Website Content</h2>
        <p className="text-xs text-slate-500">
          Edit public homepage headlines, online service banner, introduction, mission, and vision.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Website content updated and published live.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-5 text-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">
              Main Slogan
            </label>
            <input
              type="text"
              value={form.slogan}
              onChange={(e) => setForm({ ...form, slogan: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071426] mb-1">
            100% Online Services Banner Text
          </label>
          <input
            type="text"
            value={form.onlineBanner}
            onChange={(e) => setForm({ ...form, onlineBanner: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071426] mb-1">
            Homepage Hero Heading
          </label>
          <input
            type="text"
            value={form.heroHeading}
            onChange={(e) => setForm({ ...form, heroHeading: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071426] mb-1">
            Homepage Hero Description
          </label>
          <textarea
            rows={3}
            value={form.heroDescription}
            onChange={(e) => setForm({ ...form, heroDescription: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071426] mb-1">
            Homepage Company Introduction
          </label>
          <textarea
            rows={2}
            value={form.companyIntro}
            onChange={(e) => setForm({ ...form, companyIntro: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071426] mb-1">
            About Us Introduction
          </label>
          <textarea
            rows={3}
            value={form.aboutIntro}
            onChange={(e) => setForm({ ...form, aboutIntro: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">Mission</label>
            <textarea
              rows={3}
              value={form.mission}
              onChange={(e) => setForm({ ...form, mission: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">Vision</label>
            <textarea
              rows={3}
              value={form.vision}
              onChange={(e) => setForm({ ...form, vision: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-60 rounded-lg cursor-pointer"
          >
            {saving ? 'Publishing Changes...' : 'Save & Publish Content'}
          </button>
        </div>
      </form>
    </div>
  );
}
