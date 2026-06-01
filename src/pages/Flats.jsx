import React, { useEffect, useState } from 'react';
import { getFlats, getTowers } from '../api';
import { Loading, Badge, Avatar, Modal, Empty } from '../components/UI';
import { Search } from 'lucide-react';

export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [towerFilter, setTowerFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([getFlats(), getTowers()]).then(([f, t]) => {
      setFlats(f); setTowers(t); setLoading(false);
    });
  }, []);

  const filtered = flats.filter(f => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (towerFilter !== 'all' && f.tower_id !== towerFilter) return false;
    if (search && !f.flat_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTower = (f) => towers.find(t => t.id === f.tower_id);

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">Flat Registry</h1>
          <p className="page-sub">{filtered.length} of {flats.length} flats shown</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 180 }}>
          <Search size={14} />
          <input placeholder="Search flat number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="owned">Owned</option>
          <option value="rented">Rented</option>
          <option value="unsold">Unsold</option>
        </select>
        <select style={{ width: 150 }} value={towerFilter} onChange={e => setTowerFilter(e.target.value)}>
          <option value="all">All Towers</option>
          {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Status Pills */}
      <div className="filter-pills">
        {['all', 'owned', 'rented', 'unsold'].map(s => {
          const count = s === 'all' ? flats.length : flats.filter(f => f.status === s).length;
          return (
            <button key={s} className={`pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Empty icon="🏠" title="No flats found" sub="Try changing your filter or search term." />
      ) : (
        <div className="grid-auto">
          {filtered.map(flat => {
            const tower = getTower(flat);
            return (
              <div key={flat.id} className="card" style={{ cursor: 'pointer', transition: 'border-color .15s, transform .15s' }}
                onClick={() => setSelected(flat)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18 }}>{flat.flat_number}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{tower?.name} · Floor {flat.floor}</div>
                  </div>
                  <Badge s={flat.status} />
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                  <span>🛏 {flat.bedrooms} BHK</span>
                  <span>📐 {flat.area_sqft} sqft</span>
                </div>
                {flat.owner ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card2)', borderRadius: 8, padding: '8px 10px' }}>
                    <Avatar name={flat.owner.name} size={30} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{flat.owner.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{flat.owner.phone}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--warning)', fontWeight: 600, textAlign: 'center' }}>
                    Available for Sale / Rent
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Flat Detail Modal */}
      {selected && (
        <Modal title={`Flat ${selected.flat_number}`} onClose={() => setSelected(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              ['Flat Number', selected.flat_number],
              ['Tower', towers.find(t => t.id === selected.tower_id)?.name],
              ['Floor', `Floor ${selected.floor}`],
              ['Status', <Badge s={selected.status} />],
              ['Bedrooms', `${selected.bedrooms} BHK`],
              ['Area', `${selected.area_sqft} sq ft`],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--card2)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>

          {selected.owner ? (
            <div style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Owner / Resident Details</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <Avatar name={selected.owner.name} size={44} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.owner.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Since {selected.owner.move_in}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div>📞 <span style={{ color: 'var(--accent)' }}>{selected.owner.phone}</span></div>
                <div>✉️ <span style={{ color: 'var(--accent)' }}>{selected.owner.email}</span></div>
                {selected.owner.dues > 0 && (
                  <div style={{ marginTop: 6, background: 'rgba(245,158,11,.1)', borderRadius: 6, padding: '8px 12px', color: 'var(--warning)', fontWeight: 700 }}>
                    ⚠️ Outstanding Dues: ₹{selected.owner.dues.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(245,158,11,.06)', border: '1px dashed rgba(245,158,11,.3)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔑</div>
              <div style={{ fontWeight: 700, color: 'var(--warning)' }}>Flat is Available</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Go to Residents page to assign an owner</div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
