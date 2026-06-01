import React, { useEffect, useState } from 'react';
import { getMaintenance, addMaintenance, updateMaintenance } from '../api';
import { Loading, Badge, Modal, Field, Btn, Empty, StatCard } from '../components/UI';
import { Plus, Play, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AREAS = ['Tower A', 'Tower B', 'Tower C', 'Common Area', 'Garden', 'Parking', 'Lobby', 'Terrace', 'Basement', 'Gate', 'Gym', 'Pool Area'];

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', area: '', priority: 'medium', description: '', assigned_to: '' });

  const load = async () => {
    setLoading(true);
    setItems(await getMaintenance());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.area) return toast.error('Title and area are required');
    setSaving(true);
    try {
      await addMaintenance(form);
      toast.success('Maintenance request created!');
      setShowAdd(false);
      setForm({ title: '', area: '', priority: 'medium', description: '', assigned_to: '' });
      load();
    } catch { toast.error('Failed to create request'); }
    setSaving(false);
  };

  const changeStatus = async (id, status) => {
    try {
      await updateMaintenance(id, { status });
      toast.success(`Status → ${status}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const filtered = (() => {
    if (filter === 'all') return items;
    if (filter === 'active') return items.filter(m => m.status !== 'resolved');
    if (['open', 'in_progress', 'resolved'].includes(filter)) return items.filter(m => m.status === filter);
    return items.filter(m => m.priority === filter);
  })();

  if (loading) return <Loading />;

  const stats = {
    open: items.filter(m => m.status === 'open').length,
    in_progress: items.filter(m => m.status === 'in_progress').length,
    resolved: items.filter(m => m.status === 'resolved').length,
    critical: items.filter(m => m.priority === 'critical').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">Maintenance Tracker</h1>
          <p className="page-sub">{stats.open + stats.in_progress} active issues · {stats.resolved} resolved</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} /> New Request</Btn>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Open" value={stats.open} color="var(--danger)" />
        <StatCard label="In Progress" value={stats.in_progress} color="var(--warning)" />
        <StatCard label="Resolved" value={stats.resolved} color="var(--success)" />
        <StatCard label="Critical" value={stats.critical} color="var(--danger)" />
      </div>

      {/* Filters */}
      <div className="filter-pills">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'open', label: 'Open' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'critical', label: '🔴 Critical' },
          { key: 'high', label: 'High' },
          { key: 'medium', label: 'Medium' },
          { key: 'low', label: 'Low' },
        ].map(({ key, label }) => (
          <button key={key} className={`pill ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty icon="🔧" title="No maintenance issues found" sub="All clear! No issues match this filter." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(m => (
            <div key={m.id} className="card" style={{
              borderColor: m.priority === 'critical' && m.status !== 'resolved' ? 'rgba(239,68,68,.4)' : 'var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{m.title}</span>
                    <Badge s={m.priority} small />
                    <Badge s={m.status} small />
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>
                    📍 {m.area} · Reported: {m.reported}
                    {m.assigned_to && <span> · 👤 {m.assigned_to}</span>}
                  </div>
                  {m.description && (
                    <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{m.description}</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                  {m.status === 'open' && (
                    <Btn variant="secondary" sm onClick={() => changeStatus(m.id, 'in_progress')}>
                      <Play size={12} /> Start
                    </Btn>
                  )}
                  {m.status === 'in_progress' && (
                    <Btn variant="success" sm onClick={() => changeStatus(m.id, 'resolved')}>
                      <CheckCircle size={12} /> Resolve
                    </Btn>
                  )}
                  {m.status === 'resolved' && (
                    <Btn variant="secondary" sm onClick={() => changeStatus(m.id, 'open')}>
                      Reopen
                    </Btn>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="New Maintenance Request" onClose={() => setShowAdd(false)}>
          <Field label="Issue Title *">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Elevator not working on Floor 5" />
          </Field>
          <div className="form-row">
            <Field label="Area *">
              <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                <option value="">Select area...</option>
                {AREAS.map(a => <option key={a}>{a}</option>)}
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['critical', 'high', 'medium', 'low'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Assign To">
            <input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="Team or person responsible" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the issue in detail..." />
          </Field>
          <div className="modal-footer">
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={handleAdd} disabled={saving}>{saving ? 'Creating...' : 'Create Request'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
