'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface RecruitmentTask {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  roles: string[];
}

interface RecruitmentRole {
  id: string;
  name: string;
  description?: string;
}

interface RecruitmentSettings {
  isActive: boolean;
  roles: RecruitmentRole[];
  tasks: RecruitmentTask[];
}

// --- Modal component ---
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-stellar-white/20 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-stellar-white">{title}</h3>
          <button onClick={onClose} className="p-1 text-stellar-white/50 hover:text-stellar-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function RecruitmentSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<RecruitmentSettings>({
    isActive: true,
    roles: [],
    tasks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [editingRole, setEditingRole] = useState<RecruitmentRole | null>(null);
  const [editingTask, setEditingTask] = useState<RecruitmentTask | null>(null);
  const [showNewRole, setShowNewRole] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);

  // Temp state for modals
  const [modalRole, setModalRole] = useState<Partial<RecruitmentRole>>({ name: '', description: '' });
  const [modalTask, setModalTask] = useState<Partial<RecruitmentTask>>({ title: '', description: '', timeEstimate: '', roles: [] });

  useEffect(() => {
    if (session?.accessToken) {
      loadSettings();
    }
  }, [session]);

  const loadSettings = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/recruitment/settings`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const persistSettings = async (newSettings: RecruitmentSettings) => {
    setSettings(newSettings);
    setError('');
    setSuccess('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/recruitment/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.accessToken}` },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Nepodařilo se uložit nastavení');
      setSuccess('Uloženo');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo');
    }
  };

  // --- Role actions ---
  const openNewRole = () => {
    setModalRole({ name: '', description: '' });
    setShowNewRole(true);
  };

  const openEditRole = (role: RecruitmentRole) => {
    setModalRole({ ...role });
    setEditingRole(role);
  };

  const saveRole = () => {
    if (!modalRole.name?.trim()) return;

    let newSettings: RecruitmentSettings;
    if (editingRole) {
      newSettings = {
        ...settings,
        roles: settings.roles.map(r => r.id === editingRole.id ? { ...r, name: modalRole.name!, description: modalRole.description } : r),
      };
      setEditingRole(null);
    } else {
      newSettings = {
        ...settings,
        roles: [...settings.roles, { id: `role-${Date.now()}`, name: modalRole.name!, description: modalRole.description }],
      };
      setShowNewRole(false);
    }
    persistSettings(newSettings);
  };

  const deleteRole = (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto pozici? Odstraní se i přiřazení u úkolů.')) return;
    persistSettings({
      ...settings,
      roles: settings.roles.filter(r => r.id !== id),
      tasks: settings.tasks.map(t => ({ ...t, roles: t.roles.filter(rid => rid !== id) })),
    });
  };

  // --- Task actions ---
  const openNewTask = () => {
    setModalTask({ title: '', description: '', timeEstimate: '', roles: [] });
    setShowNewTask(true);
  };

  const openEditTask = (task: RecruitmentTask) => {
    setModalTask({ ...task, roles: [...task.roles] });
    setEditingTask(task);
  };

  const saveTask = () => {
    if (!modalTask.title?.trim() || !modalTask.description?.trim()) return;

    let newSettings: RecruitmentSettings;
    if (editingTask) {
      newSettings = {
        ...settings,
        tasks: settings.tasks.map(t => t.id === editingTask.id ? { ...t, title: modalTask.title!, description: modalTask.description!, timeEstimate: modalTask.timeEstimate || '15–30 minut', roles: modalTask.roles || [] } : t),
      };
      setEditingTask(null);
    } else {
      newSettings = {
        ...settings,
        tasks: [...settings.tasks, { id: `task-${Date.now()}`, title: modalTask.title!, description: modalTask.description!, timeEstimate: modalTask.timeEstimate || '15–30 minut', roles: modalTask.roles || [] }],
      };
      setShowNewTask(false);
    }
    persistSettings(newSettings);
  };

  const deleteTask = (id: string) => {
    if (!confirm('Opravdu chcete smazat tento úkol?')) return;
    persistSettings({ ...settings, tasks: settings.tasks.filter(t => t.id !== id) });
  };

  const toggleModalTaskRole = (roleId: string) => {
    const roles = modalTask.roles || [];
    setModalTask({
      ...modalTask,
      roles: roles.includes(roleId) ? roles.filter(r => r !== roleId) : [...roles, roleId],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stellar-white text-xl">Načítání...</div>
      </div>
    );
  }

  // Group tasks by role for display
  const taskGroups: { label: string; roleId: string | null; tasks: RecruitmentTask[] }[] = [];
  settings.roles.forEach(role => {
    taskGroups.push({ label: role.name, roleId: role.id, tasks: settings.tasks.filter(t => t.roles.includes(role.id)) });
  });
  const generalTasks = settings.tasks.filter(t => t.roles.length === 0);
  if (generalTasks.length > 0) {
    taskGroups.push({ label: 'Obecné (pro všechny)', roleId: null, tasks: generalTasks });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stellar-white">Nastavení náboru</h1>
          <p className="text-stellar-white/60 mt-2">Správa pozic a úkolů pro přihlášky</p>
        </div>
{success && <span className="text-green-400 text-sm">{success}</span>}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">{error}</div>}

      {/* Active Status Toggle */}
      <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stellar-white">Nábor aktivní</h2>
            <p className="text-stellar-white/60 text-sm mt-1">Povolí nebo zakáže přihlášky na webu</p>
          </div>
          <label className="relative inline-block w-14 h-8">
            <input
              type="checkbox"
              checked={settings.isActive}
              onChange={(e) => persistSettings({ ...settings, isActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-full h-full bg-gray-700 peer-checked:bg-cosmic-blue rounded-full peer transition-colors cursor-pointer" />
            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
          </label>
        </div>
      </div>

      {/* Roles Section */}
      <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-stellar-white">Pozice</h2>
            <p className="text-stellar-white/60 text-sm mt-1">Pozice, o které se mohou uchazeči ucházet</p>
          </div>
          <button
            onClick={openNewRole}
            className="px-4 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat pozici</span>
          </button>
        </div>

        {settings.roles.length === 0 ? (
          <p className="text-stellar-white/30 text-sm italic py-4">Zatím nejsou definovány žádné pozice.</p>
        ) : (
          <div className="space-y-3">
            {settings.roles.map(role => (
              <div key={role.id} className="bg-stellar-white/5 border border-stellar-white/10 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-stellar-white font-semibold">{role.name}</h3>
                  {role.description && <p className="text-stellar-white/60 text-sm mt-1 truncate">{role.description}</p>}
                </div>
                <div className="flex space-x-1 ml-4 shrink-0">
                  <button onClick={() => openEditRole(role)} className="p-2 text-aurora-cyan hover:bg-aurora-cyan/20 rounded-lg transition-colors" title="Upravit">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteRole(role.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors" title="Smazat">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section — grouped by role */}
      <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-stellar-white">Úkoly</h2>
            <p className="text-stellar-white/60 text-sm mt-1">Úkoly se zobrazí uchazečům na základě vybrané pozice</p>
          </div>
          <button
            onClick={openNewTask}
            className="px-4 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat úkol</span>
          </button>
        </div>

        {taskGroups.length === 0 ? (
          <p className="text-stellar-white/30 text-sm italic py-4">Zatím nejsou definovány žádné úkoly.</p>
        ) : (
          <div className="space-y-6">
            {taskGroups.map(group => (
              <div key={group.roleId || 'general'}>
                <h3 className="text-lg font-semibold text-stellar-white mb-3 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${group.roleId ? 'bg-cosmic-blue' : 'bg-yellow-400'}`} />
                  {group.label}
                  <span className="text-stellar-white/40 text-sm font-normal">
                    ({group.tasks.length} {group.tasks.length === 1 ? 'úkol' : group.tasks.length < 5 ? 'úkoly' : 'úkolů'})
                  </span>
                </h3>

                {group.tasks.length === 0 ? (
                  <p className="text-stellar-white/30 text-sm ml-4 italic">Zatím žádné úkoly</p>
                ) : (
                  <div className="space-y-3 ml-4">
                    {group.tasks.map(task => (
                      <div key={task.id} className="bg-stellar-white/5 border border-stellar-white/10 rounded-lg p-4 flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-stellar-white font-semibold">{task.title}</h4>
                          <p className="text-stellar-white/60 text-sm mt-1">{task.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-stellar-white/50">⏱ {task.timeEstimate}</span>
                            {task.roles.length > 1 && (
                              <span className="text-xs text-stellar-white/40">
                                + {task.roles.filter(r => r !== group.roleId).map(rid => settings.roles.find(r => r.id === rid)?.name).filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-4 shrink-0">
                          <button onClick={() => openEditTask(task)} className="p-2 text-aurora-cyan hover:bg-aurora-cyan/20 rounded-lg transition-colors" title="Upravit">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors" title="Smazat">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Role Modal (new + edit) ===== */}
      {(showNewRole || editingRole) && (
        <Modal
          title={editingRole ? 'Upravit pozici' : 'Nová pozice'}
          onClose={() => { setShowNewRole(false); setEditingRole(null); }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stellar-white/80 mb-1">Název pozice *</label>
              <input
                type="text"
                value={modalRole.name || ''}
                onChange={(e) => setModalRole({ ...modalRole, name: e.target.value })}
                className="w-full px-3 py-2 bg-cosmic-black border border-stellar-white/20 rounded-lg text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                placeholder="např. Software vývojář"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stellar-white/80 mb-1">Popis</label>
              <textarea
                value={modalRole.description || ''}
                onChange={(e) => setModalRole({ ...modalRole, description: e.target.value })}
                className="w-full px-3 py-2 bg-cosmic-black border border-stellar-white/20 rounded-lg text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                placeholder="Krátký popis pozice (volitelné)"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => { setShowNewRole(false); setEditingRole(null); }}
                className="px-4 py-2 text-stellar-white/60 hover:text-stellar-white transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={saveRole}
                disabled={!modalRole.name?.trim()}
                className="px-5 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors disabled:opacity-40"
              >
                {editingRole ? 'Uložit' : 'Přidat'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===== Task Modal (new + edit) ===== */}
      {(showNewTask || editingTask) && (
        <Modal
          title={editingTask ? 'Upravit úkol' : 'Nový úkol'}
          onClose={() => { setShowNewTask(false); setEditingTask(null); }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stellar-white/80 mb-1">Název úkolu *</label>
              <input
                type="text"
                value={modalTask.title || ''}
                onChange={(e) => setModalTask({ ...modalTask, title: e.target.value })}
                className="w-full px-3 py-2 bg-cosmic-black border border-stellar-white/20 rounded-lg text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                placeholder="např. Algoritmus pro výpočet apogea"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stellar-white/80 mb-1">Popis úkolu *</label>
              <textarea
                value={modalTask.description || ''}
                onChange={(e) => setModalTask({ ...modalTask, description: e.target.value })}
                className="w-full px-3 py-2 bg-cosmic-black border border-stellar-white/20 rounded-lg text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                placeholder="Detailní zadání úkolu pro uchazeče"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stellar-white/80 mb-1">Odhadovaný čas</label>
              <input
                type="text"
                value={modalTask.timeEstimate || ''}
                onChange={(e) => setModalTask({ ...modalTask, timeEstimate: e.target.value })}
                className="w-full px-3 py-2 bg-cosmic-black border border-stellar-white/20 rounded-lg text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                placeholder="např. 15–30 minut"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stellar-white/80 mb-2">Pro které pozice</label>
              {settings.roles.length === 0 ? (
                <p className="text-stellar-white/40 text-sm italic">Nejprve přidejte pozice.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {settings.roles.map(role => {
                    const checked = modalTask.roles?.includes(role.id) || false;
                    return (
                      <label
                        key={role.id}
                        className={`flex items-center space-x-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                          checked
                            ? 'bg-cosmic-blue/20 border-cosmic-blue text-stellar-white'
                            : 'bg-cosmic-black border-stellar-white/20 text-stellar-white/70 hover:border-stellar-white/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleModalTaskRole(role.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{role.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="text-stellar-white/40 text-xs mt-2">Bez vybrané pozice se úkol zobrazí všem uchazečům.</p>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => { setShowNewTask(false); setEditingTask(null); }}
                className="px-4 py-2 text-stellar-white/60 hover:text-stellar-white transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={saveTask}
                disabled={!modalTask.title?.trim() || !modalTask.description?.trim()}
                className="px-5 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors disabled:opacity-40"
              >
                {editingTask ? 'Uložit' : 'Přidat'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
