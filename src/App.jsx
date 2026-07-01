import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, Building2, Home, Users, DoorOpen,
  Wrench, Bell, DollarSign, Sparkles, ChevronRight
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Towers from './pages/Towers';
import Flats from './pages/Flats';
import Residents from './pages/Residents';
import Visitors from './pages/Visitors';
import Maintenance from './pages/Maintenance';
import { Notices, Expenses, AIInsights } from './pages/Others';
import { getVisitors, getDashboardStats } from './api';

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',     icon: LayoutDashboard, section: null },
  { id: 'towers',      label: 'Towers & Flats', icon: Building2,       section: 'PROPERTY' },
  { id: 'flats',       label: 'Flat Registry',  icon: Home,            section: null },
  { id: 'residents',   label: 'Residents',      icon: Users,           section: 'PEOPLE' },
  { id: 'visitors',    label: 'Visitor Gate',   icon: DoorOpen,        section: null, badge: 'pending_visitors' },
  { id: 'maintenance', label: 'Maintenance',    icon: Wrench,          section: 'OPERATIONS' },
  { id: 'notices',     label: 'Notices',        icon: Bell,            section: null },
  { id: 'expenses',    label: 'Finances',       icon: DollarSign,      section: null },
  { id: 'ai',          label: 'AI Insights',    icon: Sparkles,        section: 'ANALYTICS' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const s = await getDashboardStats();
        setStats(s);
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [page]);

  const PAGES = {
    dashboard: <Dashboard setPage={setPage} />,
    towers: <Towers />,
    flats: <Flats />,
    residents: <Residents />,
    visitors: <Visitors />,
    maintenance: <Maintenance />,
    notices: <Notices />,
    expenses: <Expenses />,
    ai: <AIInsights setPage={setPage} />,
  };

  let lastSection = null;

  return (
    <div className="app-shell">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1c1c28', color: '#e2e8f0', border: '1px solid #1e2535', fontSize: 13 },
          success: { iconTheme: { primary: '#10b981', secondary: '#1c1c28' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1c1c28' } },
        }}
      />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🏘</div>
          <div>
            <div className="logo-text">SocietyOS</div>
            <div className="logo-sub">Management Suite</div>
          </div>
        </div>

        <nav className="nav">
          {NAV.map(item => {
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;
            const badgeCount = item.badge ? stats[item.badge] : 0;
            const Icon = item.icon;

            return (
              <React.Fragment key={item.id}>
                {showSection && <div className="nav-section">{item.section}</div>}
                <button
                  className={`nav-item ${page === item.id ? 'active' : ''}`}
                  onClick={() => setPage(item.id)}
                >
                  <Icon size={16} color={page === item.id ? 'var(--accent)' : 'currentColor'} />
                  <span>{item.label}</span>
                  {badgeCount > 0 && <span className="nav-badge">{badgeCount}</span>}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>Society Admin Panel Test </div>
          <div style={{ fontSize: 10, color: 'var(--faint)' }}>v2.0 · API: https://your-render-url.onrender.com</div>
        </div>
      </aside>
       
      {/* Main Content */}
      <main className="main">
        {PAGES[page] || <Dashboard setPage={setPage} />}
      </main>
    </div>
  );
}
