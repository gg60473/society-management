import React, { useEffect, useState } from 'react';
import { getNotices, addNotice, getExpenses, addExpense, getAIInsights, getDashboardStats } from '../api';
import { Loading, Modal, Field, Btn, Empty } from '../components/UI';
import { Plus, Bell, RefreshCw, Zap, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// NOTICES
// ─────────────────────────────────────────────────────────────
export function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal' });

  const load = async () => { setLoading(true); setNotices(await getNotices()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.message) return toast.error('Title and message required');
    setSaving(true);
    try {
      await addNotice(form);
      toast.success('Notice published to all residents!');
      setShowAdd(false);
      setForm({ title: '', message: '', priority: 'normal' });
      load();
    } catch { toast.error('Failed to publish notice'); }
    setSaving(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">Notice Board</h1>
          <p className="page-sub">{notices.length} active notices</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Post Notice</Btn>
      </div>

      {notices.length === 0 ? (
        <Empty icon="📢" title="No notices posted" sub="Post a notice to inform all residents." action={<Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Post First Notice</Btn>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notices.map(n => {
            const isHigh = n.priority === 'high';
            return (
              <div key={n.id} className="card" style={{
                borderColor: isHigh ? 'rgba(239,68,68,.3)' : 'var(--border)',
                background: isHigh ? 'rgba(239,68,68,.02)' : 'var(--card)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{isHigh ? '🚨' : '📢'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: isHigh ? 'var(--danger)' : 'var(--text)' }}>{n.title}</div>
                      {isHigh && <span style={{ background: 'rgba(239,68,68,.15)', color: 'var(--danger)', padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>IMPORTANT</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{n.date}</div>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{n.message}</div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Post New Notice" onClose={() => setShowAdd(false)}>
          <Field label="Title *">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice subject" />
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option value="normal">Normal</option>
              <option value="high">High Priority</option>
            </select>
          </Field>
          <Field label="Message *">
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Write your notice here..." />
          </Field>
          <div className="modal-footer">
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={handleAdd} disabled={saving}>{saving ? 'Publishing...' : 'Publish Notice'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXPENSES
// ─────────────────────────────────────────────────────────────
const EXP_CATS = ['Maintenance', 'Security', 'Utilities', 'Cleaning', 'Landscaping', 'Repairs', 'Administrative', 'Insurance', 'Events', 'Other'];

export function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: 'Maintenance', amount: '', description: '' });

  const load = async () => { setLoading(true); setExpenses(await getExpenses()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.amount || !form.description) return toast.error('Amount and description required');
    setSaving(true);
    try {
      await addExpense({ ...form, amount: +form.amount });
      toast.success('Expense recorded!');
      setShowAdd(false);
      setForm({ category: 'Maintenance', amount: '', description: '' });
      load();
    } catch { toast.error('Failed to record expense'); }
    setSaving(false);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCat = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">Finances</h1>
          <p className="page-sub">{expenses.length} transactions this month</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} /> Add Expense</Btn>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Summary */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingDown size={16} color="var(--danger)" />
            <h3 className="syne" style={{ fontSize: 15 }}>Monthly Expenses</h3>
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--danger)', fontFamily: 'Syne,sans-serif', marginBottom: 4 }}>
            ₹{total.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Total this month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--muted)' }}>{cat}</span>
                  <span style={{ fontWeight: 600 }}>₹{amt.toLocaleString('en-IN')}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${(amt / total * 100).toFixed(1)}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown by Category */}
        <div className="card">
          <h3 className="syne" style={{ fontSize: 15, marginBottom: 16 }}>Category Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(byCat).map(([cat, amt]) => {
              const pct = Math.round(amt / total * 100);
              return (
                <div key={cat} style={{ background: 'var(--card2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{cat}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Syne,sans-serif', color: 'var(--text)' }}>₹{(amt / 1000).toFixed(1)}K</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{pct}% of total</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 className="syne" style={{ fontSize: 15 }}>Transaction History</h3>
        </div>
        {expenses.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>No expenses recorded</div>
        ) : expenses.map(e => (
          <div key={e.id} className="list-item">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {{Maintenance:'🔧',Security:'🛡',Utilities:'⚡',Cleaning:'🧹',Security:'🔒',Other:'💼'}[e.category] || '💰'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{e.description}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{e.category} · {e.date}</div>
            </div>
            <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 15, fontFamily: 'Syne,sans-serif' }}>
              −₹{e.amount.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal title="Record Expense" onClose={() => setShowAdd(false)}>
          <Field label="Category">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {EXP_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Amount (₹) *">
            <input type="number" min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
          </Field>
          <Field label="Description *">
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What was this expense for?" />
          </Field>
          <div className="modal-footer">
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Record Expense'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI INSIGHTS
// ─────────────────────────────────────────────────────────────
export function AIInsights({ setPage }) {
  const [ai, setAi] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, s] = await Promise.all([getAIInsights(), getDashboardStats()]);
    setAi(a); setStats(s); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <Loading text="Running AI analysis..." />;
  if (!ai || !stats) return <div style={{ padding: 32, color: 'var(--danger)' }}>Failed to load AI insights</div>;

  const score = ai.health_score;
  const scoreColor = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const occ = stats.total_flats > 0 ? Math.round(stats.occupied_flats / stats.total_flats * 100) : 0;

  const analyticsCards = [
    { label: 'Occupancy Rate', value: `${occ}%`, sub: `${stats.occupied_flats}/${stats.total_flats} flats`, color: 'var(--accent)' },
    { label: 'Unsold Units', value: stats.unsold_flats, sub: `Across ${stats.total_towers} towers`, color: 'var(--warning)' },
    { label: 'Total Residents', value: stats.total_residents, sub: 'Registered in system', color: 'var(--success)' },
    { label: 'Monthly Expenses', value: `₹${Math.round(stats.monthly_expenses / 1000)}K`, sub: 'Current month', color: 'var(--danger)' },
    { label: 'Open Issues', value: stats.open_maintenance, sub: 'Maintenance requests', color: 'var(--info)' },
    { label: 'Pending Visitors', value: stats.pending_visitors, sub: 'Awaiting gate approval', color: 'var(--pink)', colorVar: '#ec4899' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title syne">✨ AI Insights</h1>
          <p className="page-sub">Automated society health monitoring · Generated {new Date(ai.generated_at).toLocaleTimeString('en-IN')}</p>
        </div>
        <Btn variant="secondary" onClick={load}><RefreshCw size={13} /> Refresh Analysis</Btn>
      </div>

      {/* Health Score Hero */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(59,130,246,.06), rgba(99,102,241,.06))', borderColor: 'rgba(59,130,246,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: scoreColor, fontFamily: 'Syne,sans-serif', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>HEALTH SCORE</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Syne,sans-serif', marginBottom: 8 }}>
              {score >= 70 ? '🟢 Society is Healthy' : score >= 40 ? '🟡 Needs Attention' : '🔴 Critical Issues Detected'}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
              {score >= 70 ? 'All systems are functioning well. Keep up the great management!' : score >= 40 ? 'Some areas need attention. Review the recommendations below.' : 'Multiple critical issues require immediate action.'}
            </div>
            <div className="progress" style={{ height: 10 }}>
              <div className="progress-bar" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor}, var(--accent))` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Insight Cards */}
      <div style={{ marginBottom: 20 }}>
        <h3 className="syne" style={{ fontSize: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="var(--warning)" /> Live Monitoring
        </h3>
        {ai.insights.map((ins, i) => {
          const c = {
            danger: ['rgba(239,68,68,.1)', 'rgba(239,68,68,.25)', '#ef4444'],
            warning: ['rgba(245,158,11,.1)', 'rgba(245,158,11,.25)', '#f59e0b'],
            info: ['rgba(6,182,212,.1)', 'rgba(6,182,212,.25)', '#06b6d4'],
            success: ['rgba(16,185,129,.1)', 'rgba(16,185,129,.25)', '#10b981'],
          }[ins.type] || ['rgba(99,102,241,.1)', 'rgba(99,102,241,.25)', '#6366f1'];
          return (
            <div key={i} style={{
              background: c[0], border: `1px solid ${c[1]}`,
              borderRadius: 10, padding: '14px 18px', marginBottom: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              transition: 'transform .12s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div>
                <div style={{ fontWeight: 700, color: c[2], fontSize: 14 }}>{ins.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{ins.detail}</div>
              </div>
              {ins.tab && (
                <Btn variant="secondary" sm onClick={() => setPage(ins.tab)} style={{ flexShrink: 0 }}>{ins.action} →</Btn>
              )}
            </div>
          );
        })}
      </div>

      {/* Analytics Grid */}
      <h3 className="syne" style={{ fontSize: 16, marginBottom: 14 }}>Society Analytics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {analyticsCards.map(c => (
          <div key={c.label} className="card card-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, fontFamily: 'Syne,sans-serif', color: c.color, lineHeight: 1.1 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
