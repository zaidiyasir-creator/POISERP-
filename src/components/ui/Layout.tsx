import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  LayoutDashboard, Users, BookOpen, FileText, Receipt, 
  Wrench, Activity, ShieldCheck, RefreshCw, AlertTriangle, Settings, LogOut 
} from 'lucide-react';
import { PoisLogo } from './PoisLogo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}


export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, users, setCurrentUser, jobs, projects, menuVisibility, logout } = useApp();

  // Find overdue jobs or projects at SLA risk (delivery time exceeding 14-30 working days)
  const slaRiskProjects = projects.filter(p => p.atSlaRisk).length;
  const pendingJobs = jobs.filter(j => j.status !== 'closed' && j.status !== 'activated').length;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Client CRM', icon: Users },
    { id: 'catalog', label: 'Rate Catalog', icon: BookOpen },
    { id: 'quotations', label: 'Quotation Builder', icon: FileText },
    { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
    { id: 'jobs', label: 'Job Scheduling', icon: Wrench },
    { id: 'projects', label: 'Project Timelines', icon: Activity },
    { id: 'selftests', label: 'Pricing Self-Tests', icon: ShieldCheck },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const filteredNavigationItems = navigationItems.filter(item => {
    const key = `${currentUser.role}:${item.id}`;
    return menuVisibility[key] !== false;
  });

  useEffect(() => {
    const isTabVisible = filteredNavigationItems.some(item => item.id === activeTab);
    if (!isTabVisible && filteredNavigationItems.length > 0) {
      setActiveTab(filteredNavigationItems[0].id);
    }
  }, [currentUser.role, menuVisibility, activeTab, setActiveTab]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = users.find(u => u.id === e.target.value);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-50 text-red-700 border-red-200';
      case 'ceo': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hod_sales': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sales_rep': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'technician': return 'bg-brand-50 text-brand-700 border-brand-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50/50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          {/* Branded Logo */}
          <PoisLogo className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none text-white">POIS ERP SYSTEM</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Integrator ERP</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'jobs' && pendingJobs > 0 && (
                  <span className="ml-auto bg-slate-800 text-brand-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                    {pendingJobs}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-800 capitalize">
              {navigationItems.find(n => n.id === activeTab)?.label}
            </h2>
            {slaRiskProjects > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-medium px-2.5 py-1 rounded-full border border-rose-100 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{slaRiskProjects} SLA delivery risk alert(s)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">{currentUser.name}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-gray-700 border border-gray-200">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="border-l border-gray-200 pl-3">
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all text-xs font-semibold border border-transparent hover:border-rose-100"
                title="Log Out of Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
