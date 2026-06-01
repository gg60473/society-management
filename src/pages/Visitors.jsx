import React, { useEffect, useState } from 'react';
import { getVisitors, addVisitor, approveVisitor, denyVisitor, checkoutVisitor, getFlats } from '../api';
import { Loading, Badge, Avatar, Modal, Field, Btn, Empty } from '../components/UI';
import { Plus, ShieldCheck, ShieldX, LogOut, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const PURPOSES = ['Guest', 'Delivery', 'Plumber', 'Electrician', 'Doctor', 'Domestic Help', 'Courier', 'Cab / Taxi', 'Vendor', 'Other'];

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', purpose: 'Guest', flat_id: '', guard_note: '' });

  const load = async () => {
    setLoading(true);
    const [v, f] = await Promise.all([getVisitors(), getFlats()]);
    setVisitors(v); setFlats(f); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.flat_id) return toast.error('Name, phone and flat are required');
    setSaving(true);
    try {
      await addVisitor(form);
      toast.success('Visitor logged — awaiting approval');
      setShowAdd(false);
      setForm({ name: '', phone: '', purpose: 'Guest', flat_id: '', guard_note: '' });
      load();
    } catch { toast.error('Failed to log visitor'); }
    setSaving(false);
  };

  const handleApprove = async (id, name) => {
    try { await approveVisitor(id); toast.success(`✓ ${name} approved — gate open!`); load(); }
    catch { toast.error('Failed to approve'); }
  };
  const handleDeny = async (id, name) => {
    try { await denyVisitor(id); toast.error(`✗ ${name} denied entry`); load(); }
    catch { toast.error('Failed to deny'); }
  };
  const handleCheckout = async (id, name) => {
    try { await checkoutVisitor(id); toast.success(`${name} checked out`); load(); }
    catch { toast.error('Failed to checkout'); }
  };

  const filtered = filter === 'all' ? visitors : visitors.filter(v => v.status === filter);
  const pending = visitors.filter(v => v.status === 'pending');
  const occupiedFlats = flats.filter(f => f.status !== 'unsold');

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">Visitor Gate</h1>
          <p className="page-sub">{pending.length} pending · {visitors.length} total entries today</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Log Visitor</Btn>
      </div>

      {/* Pending Alert Banner */}
      {pending.length > 0 && (
        <div className="alert alert-warning pulse">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>{pending.length} visitor{pending.length > 1 ? 's' : ''} waiting at gate for approval</strong>
            <div style={{ fontSize: 12, marginTop: 2, opacity: 0.85 }}>Review and approve or deny entry below</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-pills">
        {['all', 'pending', 'approved', 'checked_out', 'denied'].map(s => {
          const count = s === 'all' ? visitors.length : visitors.filter(v => v.status === s).length;
          return (
            <button key={s} className={`pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Visitor Cards */}
      {filtered.length === 0 ? (
        <Empty icon="🚪" title="No visitors found" sub="No records match this filter." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(v => (
            <div key={v.id} className="card" style={{
              borderColor: v.status === 'pending' ? 'rgba(245,158,11,.4)' : 'var(--border)',
              background: v.status === 'pending' ? 'rgba(245,158,11,.03)' : 'var(--card)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar name={v.name} size={44} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{v.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                      📞 {v.phone} · <strong>{v.purpose}</strong>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                      Visiting: <strong style={{ color: 'var(--text)' }}>Flat {v.flat?.flat_number}</strong>
                      {v.owner && <span> ({v.owner.name})</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge s={v.status} />
                  {v.check_in && <span style={{ fontSize: 11, color: 'var(--muted)' }}>In: {v.check_in}</span>}
                  {v.check_out && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Out: {v.check_out}</span>}
                </div>
              </div>

              {v.guard_note && (
                <div style={{ marginTop: 10, background: 'var(--card2)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'var(--muted)' }}>
                  📝 Guard Note: {v.guard_note}
                </div>
              )}

              {/* Action Buttons */}
              {v.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <Btn variant="success" sm onClick={() => handleApprove(v.id, v.name)}>
                    <ShieldCheck size={13} /> Approve Entry
                  </Btn>
                  <Btn variant="danger" sm onClick={() => handleDeny(v.id, v.name)}>
                    <ShieldX size={13} /> Deny Entry
                  </Btn>
                </div>
              )}
              {v.status === 'approved' && (
                <div style={{ marginTop: 12 }}>
                  <Btn variant="secondary" sm onClick={() => handleCheckout(v.id, v.name)}>
                    <LogOut size={13} /> Check Out
                  </Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Visitor Modal */}
      {showAdd && (
        <Modal title="Log Visitor Entry" onClose={() => setShowAdd(false)}>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <ShieldCheck size={14} style={{ flexShrink: 0 }} />
            All visitors require management approval before entry is granted
          </div>
          <Field label="Visitor Name *">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name of visitor" />
          </Field>
          <div className="form-row">
            <Field label="Phone Number *">
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-XXXXXXXXXX" />
            </Field>
            <Field label="Purpose of Visit">
              <select value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}>
                {PURPOSES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Visiting Flat *">
            <select value={form.flat_id} onChange={e => setForm(f => ({ ...f, flat_id: e.target.value }))}>
              <option value="">Select flat to visit...</option>
              {occupiedFlats.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flat_number}{f.owner ? ` — ${f.owner.name}` : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Guard Note (Optional)">
            <textarea value={form.guard_note} onChange={e => setForm(f => ({ ...f, guard_note: e.target.value }))} rows={2} placeholder="Any additional notes from security guard..." />
          </Field>
          <div className="modal-footer">
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={handleAdd} disabled={saving}>{saving ? 'Logging...' : 'Log Visitor'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
