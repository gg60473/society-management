import React, { useEffect, useState } from 'react';
import { getOwners, addOwner, getFlats } from '../api';
import { Loading, Badge, Avatar, Modal, Field, Btn, Empty } from '../components/UI';
import { Plus, Search, Phone, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Residents() {
  const [owners, setOwners] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', email: '', flat_id: '', move_in: new Date().toISOString().split('T')[0], dues: 0 });

  const load = async () => {
    setLoading(true);
    const [o, f] = await Promise.all([getOwners(), getFlats()]);
    setOwners(o); setFlats(f); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.flat_id) return toast.error('Name, phone and flat are required');
    setSaving(true);
    try {
      await addOwner({ ...form, dues: +form.dues });
      toast.success(`${form.name} added as resident!`);
      setShowAdd(false);
      setForm({ name: '', phone: '', email: '', flat_id: '', move_in: new Date().toISOString().split('T')[0], dues: 0 });
      load();
    } catch { toast.error('Failed to add resident'); }
    setSaving(false);
  };

  const availableFlats = flats.filter(f => f.status !== 'owned');

  const filtered = owners.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.name.toLowerCase().includes(s) || o.phone.includes(search) || o.email?.toLowerCase().includes(s);
  });

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">Residents</h1>
          <p className="page-sub">{owners.length} registered residents · {owners.filter(o => o.dues > 0).length} with pending dues</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add Resident</Btn>
      </div>

      <div className="search-bar" style={{ marginBottom: 20 }}>
        <Search size={14} />
        <input placeholder="Search by name, phone, or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Empty icon="👥" title="No residents found" sub="Add your first resident to get started." action={<Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add Resident</Btn>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(owner => {
            const flat = owner.flat;
            return (
              <div key={owner.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '14px 18px' }}>
                <Avatar name={owner.name} size={46} />
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{owner.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
                    {flat?.flat_number} · {flat?.bedrooms} BHK · {flat?.area_sqft} sqft
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)' }}>
                  <span><Phone size={11} style={{ marginRight: 4 }} />{owner.phone}</span>
                  <span><Mail size={11} style={{ marginRight: 4 }} />{owner.email}</span>
                  <span><Calendar size={11} style={{ marginRight: 4 }} />Since {owner.move_in}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {owner.dues > 0
                    ? <span style={{ background: 'rgba(245,158,11,.12)', color: 'var(--warning)', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Due: ₹{owner.dues.toLocaleString('en-IN')}</span>
                    : <span style={{ background: 'rgba(16,185,129,.12)', color: 'var(--success)', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✓ Clear</span>}
                  <Btn variant="secondary" sm onClick={() => setSelected(owner)}>Details</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resident Modal */}
      {showAdd && (
        <Modal title="Add New Resident" onClose={() => setShowAdd(false)}>
          <Field label="Full Name *">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Resident's full name" />
          </Field>
          <div className="form-row">
            <Field label="Phone Number *">
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-XXXXXXXXXX" />
            </Field>
            <Field label="Email Address">
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
            </Field>
          </div>
          <Field label="Assign Flat *">
            <select value={form.flat_id} onChange={e => setForm(f => ({ ...f, flat_id: e.target.value }))}>
              <option value="">Select available flat...</option>
              {availableFlats.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flat_number} — {f.bedrooms} BHK, {f.area_sqft} sqft [{f.status}]
                </option>
              ))}
            </select>
          </Field>
          <div className="form-row">
            <Field label="Move-in Date">
              <input type="date" value={form.move_in} onChange={e => setForm(f => ({ ...f, move_in: e.target.value }))} />
            </Field>
            <Field label="Outstanding Dues (₹)">
              <input type="number" min={0} value={form.dues} onChange={e => setForm(f => ({ ...f, dues: e.target.value }))} />
            </Field>
          </div>
          <div className="modal-footer">
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Resident'}</Btn>
          </div>
        </Modal>
      )}

      {/* Resident Detail Modal */}
      {selected && (
        <Modal title="Resident Details" onClose={() => setSelected(null)}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--card2)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
            <Avatar name={selected.name} size={52} />
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20 }}>{selected.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>Flat {selected.flat?.flat_number}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Resident since {selected.move_in}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              ['📞 Phone', selected.phone],
              ['✉️ Email', selected.email],
              ['🏠 Flat', selected.flat?.flat_number],
              ['🛏 Type', `${selected.flat?.bedrooms} BHK`],
              ['📐 Area', `${selected.flat?.area_sqft} sqft`],
              ['📅 Move-in', selected.move_in],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--card2)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3 }}>{v || '—'}</div>
              </div>
            ))}
          </div>
          <div style={{ background: selected.dues > 0 ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.08)', border: `1px solid ${selected.dues > 0 ? 'rgba(245,158,11,.25)' : 'rgba(16,185,129,.25)'}`, borderRadius: 10, padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>OUTSTANDING DUES</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: selected.dues > 0 ? 'var(--warning)' : 'var(--success)' }}>
              {selected.dues > 0 ? `₹${selected.dues.toLocaleString('en-IN')}` : '✓ All Clear'}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
