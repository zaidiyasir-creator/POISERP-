import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  LayoutDashboard, Users, BookOpen, FileText, Receipt, 
  Wrench, Activity, ShieldCheck, RefreshCw, AlertTriangle, Settings, LogOut,
  KeyRound, Eye, EyeOff, Lock, X, AlertCircle, LayoutGrid
} from 'lucide-react';
import { PoisLogo } from './PoisLogo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}


export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, users, setUsers, setCurrentUser, jobs, projects, menuVisibility, logout, troubleTickets } = useApp();

  // Reset Password states
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Find overdue jobs or projects at SLA risk (delivery time exceeding 14-30 working days)
  const slaRiskProjects = projects.filter(p => p.atSlaRisk).length;
  const pendingJobs = jobs.filter(j => j.status !== 'closed' && j.status !== 'activated').length;
  const activeTicketsCount = troubleTickets ? troubleTickets.filter(t => ['open', 'investigating'].includes(t.status)).length : 0;

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Client CRM', icon: Users },
    { id: 'catalog', label: 'Rate Catalog', icon: BookOpen },
    { id: 'quotations', label: 'Quotation Builder', icon: FileText },
    { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
    { id: 'jobs', label: 'Job Scheduling', icon: Wrench },
    { id: 'projects', label: 'Project Timelines', icon: Activity },
    { id: 'selftests', label: 'Pricing Self-Tests', icon: ShieldCheck },
    { id: 'tickets', label: 'Trouble Tickets', icon: AlertCircle },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const filteredNavigationItems = navigationItems.filter(item => {
    if (currentUser.role !== 'admin' && item.id === 'settings') {
      return false;
    }
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const expectedCurrentPassword = currentUser.password || 'admin123';
    if (currentPassword !== expectedCurrentPassword) {
      setErrorMsg('Incorrect current password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    const updatedUser = { ...currentUser, password: newPassword };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    
    setSuccessMsg('Your password has been updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setSuccessMsg('');
      setShowResetModal(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex bg-gray-50/50 font-sans relative overflow-x-hidden">
      {/* Sidebar Backdrop for Mobile */}
      {!isSidebarCollapsed && (
        <button 
          onClick={() => setIsSidebarCollapsed(true)} 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity border-none outline-none cursor-pointer w-full h-full text-left"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 transition-all duration-300 overflow-hidden 
        ${isSidebarCollapsed ? 'w-0 border-r-0' : 'w-64'} 
        lg:relative fixed inset-y-0 left-0 z-50 h-full`}>
        <div className="w-64 flex flex-col h-full shrink-0">
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
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) {
                      setIsSidebarCollapsed(true);
                    }
                  }}
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
                  {item.id === 'tickets' && activeTicketsCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-600 animate-pulse">
                      {activeTicketsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button (Red Grid Icon Style) */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-xs flex items-center justify-center cursor-pointer mr-1 shrink-0"
              title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 capitalize truncate">
              {navigationItems.find(n => n.id === activeTab)?.label}
            </h2>
            {slaRiskProjects > 0 && (
              <div className="hidden md:flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-medium px-2.5 py-1 rounded-full border border-rose-100 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{slaRiskProjects} SLA delivery risk alert(s)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-700">{currentUser.name}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-gray-700 border border-gray-200 shrink-0">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <button
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowResetModal(true);
                }}
                className="flex items-center gap-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-all text-xs font-semibold border border-gray-100 hover:border-brand-200"
                title="Reset Password"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Password</span>
              </button>

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

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full shadow-lg p-6 relative">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Reset Your Password</h3>
                <p className="text-xs text-gray-400">Secure your POIS ERP login credentials</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 pr-10 animate-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 pr-10 animate-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 pr-10 animate-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-xs py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-xs"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
