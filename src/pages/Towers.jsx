import React, { useEffect, useState } from 'react';
import { getTowers, addTower, deleteTower, getFlats, addFlat } from '../api';
import { Modal, Field, Btn, Loading, Badge, Empty, Progress } from '../components/UI';
import { Plus, Trash2, Building2, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Towers() {
  const [towers, setTowers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddFlat, setShowAddFlat] = useState(null);
  const [saving, setSaving] = useState(false);

  const [tForm, setTForm] = useState({ name: '', floors: 10, flats_per_floor: 4, year_built: 2024, amenities: '' });
  const [fForm, setFForm] = useState({ flat_number: '', floor: 1, area_sqft: 1200, bedrooms: 2 });

  const load = async () => {
    setLoading(true);
    const [t, f] = await Promise.all([getTowers(), getFlats()]);
    setTowers(t); setFlats(f);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAddTower = async () => {
    if (!tForm.name.trim()) return toast.error('Tower name required');
    setSaving(true);
    try {
      await addTower({ ...tForm, floors: +tForm.floors, flats_per_floor: +tForm.flats_per_floor, year_built: +tForm.year_built, amenities: tForm.amenities.split(',').map(a => a.trim()).filter(Boolean) });
      toast.success(`Tower "${tForm.name}" added!`);
      setShowAdd(false);
      setTForm({ name: '', floors: 10, flats_per_floor: 4, year_built: 2024, amenities: '' });
      load();
    } catch { toast.error('Failed to add tower'); }
    setSaving(false);
  };

  const handleDeleteTower = async (id, name) => {
    if (!window.confirm(`Delete Tower "${name}"? All associated flats will be removed.`)) return;
    try {
      await deleteTower(id);
      toast.success('Tower deleted');
      load();
    } catch { toast.error('Failed to delete tower'); }
  };

  const handleAddFlat = async () => {
    if (!fForm.flat_number && !showAddFlat) return;
    setSaving(true);
    try {
      const tower = towers.find(t => t.id === showAddFlat);
      const prefix = tower?.name?.split(' ')[1] || 'X';
      const fn = fForm.flat_number || `${prefix}-${fForm.floor}${String.fromCharCode(64 + Math.ceil(Math.random() * 4))}`;
      await addFlat({ tower_id: showAddFlat, flat_number: fn, floor: +fForm.floor, area_sqft: +fForm.area_sqft, bedrooms: +fForm.bedrooms, status: 'unsold' });
      toast.success('Flat added!');
      setShowAddFlat(null);
      setFForm({ flat_number: '', floor: 1, area_sqft: 1200, bedrooms: 2 });
      load();
    } catch { toast.error('Failed to add flat'); }
    setSaving(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">Towers & Flats</h1>
          <p className="page-sub">{towers.length} towers · {flats.length} total units</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add Tower</Btn>
      </div>

      {towers.length === 0 ? (
        <Empty icon="🏗" title="No towers added yet" sub="Start by adding your first tower to the society." action={<Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add First Tower</Btn>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {towers.map(tower => {
            const tFlats = flats.filter(f => f.tower_id === tower.id);
            const owned = tFlats.filter(f => f.status === 'owned').length;
            const rented = tFlats.filter(f => f.status === 'rented').length;
            const unsold = tFlats.filter(f => f.status === 'unsold').length;
            const occ = tFlats.length > 0 ? Math.round((owned + rented) / tFlats.length * 100) : 0;

            return (
              <div key={tower.id} className="card">
                {/* Tower Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, background: 'rgba(59,130,246,.12)', border: '1.5px solid rgba(59,130,246,.3)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={24} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20 }}>{tower.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
                        {tower.floors} floors · {tower.flats_per_floor} flats/floor · Built {tower.year_built}
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {tower.amenities?.map(a => <span key={a} className="tag">{a}</span>)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn variant="secondary" sm onClick={() => setShowAddFlat(tower.id)}><Plus size={12} /> Add Flat</Btn>
                    <Btn variant="danger" sm onClick={() => handleDeleteTower(tower.id, tower.name)}><Trash2 size={12} /></Btn>
                  </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { l: 'Total', v: tFlats.length, c: 'var(--accent)' },
                    { l: 'Owned', v: owned, c: 'var(--success)' },
                    { l: 'Rented', v: rented, c: 'var(--info)' },
                    { l: 'Unsold', v: unsold, c: 'var(--warning)' },
                  ].map(s => (
                    <div key={s.l} style={{ background: 'var(--card2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: s.c, fontFamily: 'Syne,sans-serif' }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <Progress value={occ} label="Occupancy Rate" color={occ >= 70 ? 'var(--success)' : occ >= 40 ? 'var(--warning)' : 'var(--danger)'} />

                {/* Flat Visual Grid */}
                {tFlats.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LayoutGrid size={12} /> Flat Layout
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {tFlats.map(f => {
                        const c = { owned: ['#10b981', 'rgba(16,185,129,.15)'], rented: ['#06b6d4', 'rgba(6,182,212,.15)'], unsold: ['#475569', 'rgba(71,85,105,.15)'] }[f.status] || ['#6366f1', 'rgba(99,102,241,.15)'];
                        return (
                          <div key={f.id} className="flat-cell" title={`${f.flat_number} — ${f.status}`} style={{ borderColor: c[0] + '66', background: c[1], color: c[0] }}>
                            {f.flat_number.split('-')[1] || f.flat_number}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                      {[['Owned', '#10b981'], ['Rented', '#06b6d4'], ['Unsold', '#475569']].map(([l, c]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Tower Modal */}
      {showAdd && (
        <Modal title="Add New Tower" onClose={() => setShowAdd(false)}>
          <Field label="Tower Name *">
            <input value={tForm.name} onChange={e => setTForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Tower C" />
          </Field>
          <div className="form-row">
            <Field label="Number of Floors">
              <input type="number" value={tForm.floors} min={1} max={60} onChange={e => setTForm(f => ({ ...f, floors: e.target.value }))} />
            </Field>
            <Field label="Flats per Floor">
              <input type="number" value={tForm.flats_per_floor} min={1} max={20} onChange={e => setTForm(f => ({ ...f, flats_per_floor: e.target.value }))} />
            </Field>
          </div>
          <Field label="Year Built">
            <input type="number" value={tForm.year_built} onChange={e => setTForm(f => ({ ...f, year_built: e.target.value }))} />
          </Field>
          <Field label="Amenities" hint="Comma separated: Gym, Swimming Pool, Parking">
            <input value={tForm.amenities} onChange={e => setTForm(f => ({ ...f, amenities: e.target.value }))} placeholder="Gym, Pool, Parking, Garden" />
          </Field>
          <div className="modal-footer">
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={handleAddTower} disabled={saving}>{saving ? 'Adding...' : 'Add Tower'}</Btn>
          </div>
        </Modal>
      )}

      {/* Add Flat Modal */}
      {showAddFlat && (
        <Modal title={`Add Flat — ${towers.find(t => t.id === showAddFlat)?.name}`} onClose={() => setShowAddFlat(null)}>
          <Field label="Flat Number" hint="Leave blank to auto-generate">
            <input value={fForm.flat_number} onChange={e => setFForm(f => ({ ...f, flat_number: e.target.value }))} placeholder="e.g. A-301 (auto if empty)" />
          </Field>
          <div className="form-row">
            <Field label="Floor Number">
              <input type="number" value={fForm.floor} min={1} onChange={e => setFForm(f => ({ ...f, floor: e.target.value }))} />
            </Field>
            <Field label="Bedrooms (BHK)">
              <select value={fForm.bedrooms} onChange={e => setFForm(f => ({ ...f, bedrooms: e.target.value }))}>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} BHK</option>)}
              </select>
            </Field>
          </div>
          <Field label="Area (sq ft)">
            <input type="number" value={fForm.area_sqft} onChange={e => setFForm(f => ({ ...f, area_sqft: e.target.value }))} />
          </Field>
          <div className="modal-footer">
            <Btn variant="secondary" onClick={() => setShowAddFlat(null)}>Cancel</Btn>
            <Btn onClick={handleAddFlat} disabled={saving}>{saving ? 'Adding...' : 'Add Flat'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
