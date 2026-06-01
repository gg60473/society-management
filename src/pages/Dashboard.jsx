import React, { useEffect, useState } from 'react';
import { getDashboardStats, getAIInsights, getVisitors, getMaintenance, getNotices } from '../api';
import { StatCard, Loading, Badge, Btn } from '../components/UI';
import {
  Building2, Users, Home, UserCheck, Wrench, AlertTriangle,
  TrendingUp, DollarSign, Bell, RefreshCw
} from 'lucide-react';

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState(null);
  const [ai, setAi] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, a, v, m, n] = await Promise.all([
        getDashboardStats(), getAIInsights(), getVisitors(), getMaintenance(), getNotices()
      ]);
      setStats(s); setAi(a);
      setVisitors(v.slice(0, 5));
      setMaintenance(m.filter(x => x.status !== 'resolved').slice(0, 4));
      setNotices(n.slice(0, 3));
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <Loading text="Loading dashboard..." />;
  if (!stats) return <div style={{ padding: 32, color: 'var(--danger)' }}>⚠️ Cannot connect to backend. Is the server running on port 8000?</div>;

  const occ = stats.total_flats > 0 ? Math.round(stats.occupied_flats / stats.total_flats * 100) : 0;
  const healthScore = ai?.health_score ?? 0;
  const scoreColor = healthScore >= 70 ? 'var(--success)' : healthScore >= 40 ? 'var(--warning)' : 'var(--danger)';

  const statCards = [
    { label: 'Towers', value: stats.total_towers, icon: <Building2 size={20} />, color: 'var(--accent)' },
    { label: 'Total Flats', value: stats.total_flats, icon: <Home size={20} />, color: '#6366f1' },
    { label: 'Residents', value: stats.total_residents, icon: <Users size={20} />, color: 'var(--success)' },
    { label: 'Pending Visitors', value: stats.pending_visitors, icon: <UserCheck size={20} />, color: 'var(--warning)' },
    { label: 'Open Issues', value: stats.open_maintenance, icon: <Wrench size={20} />, color: 'var(--danger)' },
    { label: 'Occupancy', value: `${occ}%`, icon: <TrendingUp size={20} />, color: 'var(--info)' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">Dashboard</h1>
          <p className="page-sub">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;· Last updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', borderRadius: 12, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>HEALTH SCORE</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, fontFamily: 'Syne,sans-serif', lineHeight: 1 }}>{healthScore}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>/100</div>
          </div>
          <Btn variant="secondary" sm onClick={fetchAll}><RefreshCw size={13} /> Refresh</Btn>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label}>
            <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Alert */}
      {stats.pending_visitors > 0 && (
        <div className="alert alert-warning" style={{ cursor: 'pointer' }} onClick={() => setPage('visitors')}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>{stats.pending_visitors} visitor{stats.pending_visitors > 1 ? 's' : ''} waiting at gate for approval</strong>
            <br /><span style={{ fontSize: 12, opacity: .8 }}>Click to review and manage gate entries →</span>
          </div>
        </div>
      )}
      {stats.critical_issues > 0 && (
        <div className="alert alert-danger" style={{ cursor: 'pointer' }} onClick={() => setPage('maintenance')}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>{stats.critical_issues} critical maintenance issue{stats.critical_issues > 1 ? 's' : ''} requiring immediate attention</strong>
            <br /><span style={{ fontSize: 12, opacity: .8 }}>Click to view maintenance requests →</span>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* AI Insights */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="syne" style={{ fontSize: 15 }}>✨ AI Insights</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('ai')}>View All →</button>
          </div>
          {(ai?.insights || []).slice(0, 4).map((ins, i) => {
            const c = { danger: ['rgba(239,68,68,.1)', '#ef4444'], warning: ['rgba(245,158,11,.1)', '#f59e0b'], info: ['rgba(6,182,212,.1)', '#06b6d4'], success: ['rgba(16,185,129,.1)', '#10b981'] }[ins.type] || ['rgba(99,102,241,.1)', '#6366f1'];
            return (
              <div key={i} className="insight-card" style={{ background: c[0], borderColor: c[1] + '44' }}>
                <div>
                  <div style={{ fontWeight: 700, color: c[1], fontSize: 13 }}>{ins.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{ins.detail}</div>
                </div>
                {ins.action && <button className="btn btn-ghost btn-sm" onClick={() => ins.tab && setPage(ins.tab)} style={{ flexShrink: 0, fontSize: 11 }}>{ins.action}</button>}
              </div>
            );
          })}
        </div>

        {/* Financial Summary */}
        <div className="card">
          <h3 className="syne" style={{ fontSize: 15, marginBottom: 16 }}>
            <DollarSign size={15} style={{ display: 'inline', marginRight: 6 }} />
            Financials
          </h3>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>MONTHLY EXPENSES</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--danger)', fontFamily: 'Syne,sans-serif' }}>
              ₹{(stats.monthly_expenses || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>OUTSTANDING DUES</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--warning)', fontFamily: 'Syne,sans-serif' }}>
              ₹{(stats.total_dues || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="divider" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'rgba(59,130,246,.08)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>UNSOLD FLATS</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Syne,sans-serif' }}>{stats.unsold_flats}</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,.08)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>OCCUPIED</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)', fontFamily: 'Syne,sans-serif' }}>{stats.occupied_flats}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Visitors */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="syne" style={{ fontSize: 15 }}>Recent Visitors</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('visitors')}>All →</button>
          </div>
          {visitors.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--muted)', fontSize: 13 }}>No visitors today</div>
          ) : visitors.map(v => (
            <div key={v.id} className="list-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{v.purpose} · Flat {v.flat?.flat_number}</div>
              </div>
              <Badge s={v.status} small />
            </div>
          ))}
        </div>

        {/* Open Maintenance */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="syne" style={{ fontSize: 15 }}>Open Maintenance</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('maintenance')}>All →</button>
          </div>
          {maintenance.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--success)', fontSize: 13 }}>✓ No open issues!</div>
          ) : maintenance.map(m => (
            <div key={m.id} className="list-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.area} · {m.reported}</div>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <Badge s={m.priority} small /><Badge s={m.status} small />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notices */}
      {notices.length > 0 && (
        <div className="card" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="syne" style={{ fontSize: 15 }}><Bell size={14} style={{ marginRight: 6, display: 'inline' }} />Latest Notices</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('notices')}>All →</button>
          </div>
          {notices.map(n => (
            <div key={n.id} className="list-item" style={{ gap: 10 }}>
              <span style={{ fontSize: 18 }}>{n.priority === 'high' ? '🚨' : '📢'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{n.message}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{n.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
