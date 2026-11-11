import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSite } from '../../../context/SiteContext';
import { api } from '../../../lib/api';
import type { SiteSettings } from '../../../types';

export function SettingsSection() {
  const { refreshPublicData } = useSite();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [teamText, setTeamText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAdminSettings()
      .then((s) => {
        setSettings(s);
        setTeamText(s.teamMembers.join('\n'));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedMsg(null);
    setError(null);
    try {
      const next: SiteSettings = {
        ...settings,
        teamMembers: teamText
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const updated = await api.updateAdminSettings(next);
      setSettings(updated);
      await refreshPublicData();
      setSavedMsg('Contact & team settings updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg(null);
    setPwError(null);
    try {
      await api.changeAdminPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPwMsg('Admin password updated successfully.');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPwSaving(false);
    }
  }

  if (loading || !settings) {
    return <div className="p-8 text-sm text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-display text-xl font-bold text-[#071426]">Settings</h2>
        <p className="text-xs text-slate-500">
          Configure company contact links, certificate signatory, project mentor roster, and admin credentials.
        </p>
      </div>

      {/* Contact & Team Settings */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-5 text-sm"
      >
        <h3 className="font-display text-base font-bold text-[#071426]">
          Contact Information &amp; Mentor Roster
        </h3>

        {savedMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{savedMsg}</span>
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">
              WhatsApp Number
            </label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">
              WhatsApp URL
            </label>
            <input
              type="url"
              value={settings.whatsappUrl}
              onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">
              Authorized Signatory Label (Certificates)
            </label>
            <input
              type="text"
              value={settings.authorizedSignatory}
              onChange={(e) =>
                setSettings({ ...settings, authorizedSignatory: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#071426] mb-1">
            Team Members for Project Assignment (one per line)
          </label>
          <textarea
            rows={4}
            value={teamText}
            onChange={(e) => setTeamText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Change Admin Password */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 text-sm"
      >
        <h3 className="font-display text-base font-bold text-[#071426]">
          Change Admin Password
        </h3>

        {pwMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            {pwMsg}
          </div>
        )}
        {pwError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {pwError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#071426] mb-1">
              New Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={pwSaving}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#071426] hover:bg-[#102B50] rounded-lg cursor-pointer"
          >
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
