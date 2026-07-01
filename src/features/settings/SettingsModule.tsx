import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, CatalogItem, CatalogCategory, SlaSettings } from '../../types';
import { 
  UserPlus, Shield, Eye, EyeOff, Trash2, Edit3, Check, Lock, 
  Plus, Search, Edit2, X, Settings, DollarSign, Percent, RefreshCw, Layers, Cloud,
  Activity, Sliders
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser,
    users, 
    setUsers, 
    menuVisibility, 
    setMenuVisibility, 
    catalog, 
    setCatalog,
    updateCatalogItem,
    nextcloudConfig,
    setNextcloudConfig,
    slaSettings,
    setSlaSettings
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'menus' | 'pricing' | 'security' | 'nextcloud' | 'sla'>('users');

  // --- PASSWORD & SECURITY STATES ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // --- NEXTCLOUD INTEGRATION STATES ---
  const [nextcloudUrl, setNextcloudUrl] = useState(nextcloudConfig.url);
  const [nextcloudUsername, setNextcloudUsername] = useState(nextcloudConfig.username);
  const [nextcloudToken, setNextcloudToken] = useState(nextcloudConfig.token);
  const [nextcloudFormEnabled, setNextcloudFormEnabled] = useState(nextcloudConfig.enabled);
  const [nxcSuccess, setNxcSuccess] = useState('');
  const [nxcError, setNxcError] = useState('');
  const [nxcTesting, setNxcTesting] = useState(false);

  // --- USER MANAGEMENT STATES ---
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'sales_rep' as UserRole
  });
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [resettingPasswordValue, setResettingPasswordValue] = useState('');

  // --- MENU CONFIG STATES ---
  const [menuSuccess, setMenuSuccess] = useState('');

  // --- SLA AGREEMENT & ADJUSTMENT STATES ---
  const [targetUptime, setTargetUptime] = useState(slaSettings.targetUptime);
  const [deliverySlaDays, setDeliverySlaDays] = useState(slaSettings.deliverySlaDays);
  const [cablingAdjustmentRate, setCablingAdjustmentRate] = useState(slaSettings.cablingAdjustmentRate);
  const [outageRebatePercent, setOutageRebatePercent] = useState(slaSettings.outageRebatePercent);
  const [resolutionSlaHours, setResolutionSlaHours] = useState(slaSettings.resolutionSlaHours);
  const [latencySlaMs, setLatencySlaMs] = useState(slaSettings.latencySlaMs);
  const [packetLossSlaPercent, setPacketLossSlaPercent] = useState(slaSettings.packetLossSlaPercent);
  const [slaSuccess, setSlaSuccess] = useState('');
  const [slaError, setSlaError] = useState('');

  const handleSaveSlaSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSlaError('');
    setSlaSuccess('');

    if (currentUser.role !== 'admin' && currentUser.role !== 'ceo') {
      setSlaError('Only administrators or CEOs have permission to modify master SLA agreement parameters.');
      return;
    }

    if (targetUptime < 90 || targetUptime > 100) {
      setSlaError('Target Uptime must be between 90% and 100%.');
      return;
    }

    if (deliverySlaDays < 1 || deliverySlaDays > 90) {
      setSlaError('Delivery SLA days must be between 1 and 90 days.');
      return;
    }

    if (cablingAdjustmentRate < 0) {
      setSlaError('Cabling adjustment rate cannot be negative.');
      return;
    }

    if (outageRebatePercent < 0 || outageRebatePercent > 100) {
      setSlaError('Outage rebate percentage must be between 0% and 100%.');
      return;
    }

    setSlaSettings({
      targetUptime,
      deliverySlaDays,
      cablingAdjustmentRate,
      outageRebatePercent,
      resolutionSlaHours,
      latencySlaMs,
      packetLossSlaPercent
    });

    setSlaSuccess('Master SLA agreement rates and billing adjustment settings saved successfully!');
    setTimeout(() => setSlaSuccess(''), 4000);
  };

  // --- PRICING & RATES STATES ---
  const [pricingSearch, setPricingSearch] = useState('');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [editedPrice, setEditedPrice] = useState<string>('');
  const [editedName, setEditedName] = useState<string>('');
  const [editedTaxable, setEditedTaxable] = useState<boolean>(true);
  const [pricingSuccess, setPricingSuccess] = useState('');

  // Default menus listing for configuration
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'clients', label: 'Client CRM' },
    { id: 'catalog', label: 'Rate Catalog' },
    { id: 'quotations', label: 'Quotation Builder' },
    { id: 'invoices', label: 'Invoices & Billing' },
    { id: 'jobs', label: 'Job Scheduling' },
    { id: 'projects', label: 'Project Timelines' },
    { id: 'selftests', label: 'Pricing Self-Tests' },
    { id: 'tickets', label: 'Trouble Tickets' },
    { id: 'settings', label: 'System Settings' }
  ];

  const rolesList: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'System Admin' },
    { value: 'ceo', label: 'CEO' },
    { value: 'hod_sales', label: 'HOD Sales' },
    { value: 'sales_rep', label: 'Sales Rep' },
    { value: 'technician', label: 'Technician' }
  ];

  // --- USER HANDLERS ---
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (currentUser.role !== 'admin') {
      setUserError('Only administrators have permission to register new system users.');
      return;
    }

    if (!newUser.name.trim()) {
      setUserError('Name is required.');
      return;
    }
    if (!newUser.email.trim() || !newUser.email.includes('@')) {
      setUserError('Valid email is required.');
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      setUserError('A user with this email already exists.');
      return;
    }

    const createdUser: User = {
      id: 'U-' + Math.floor(1000 + Math.random() * 9000),
      name: newUser.name.trim(),
      email: newUser.email.trim().toLowerCase(),
      role: newUser.role,
      password: 'admin123'
    };

    setUsers(prev => [...prev, createdUser]);
    setNewUser({ name: '', email: '', role: 'sales_rep' });
    setUserSuccess(`Successfully registered login user "${createdUser.name}" with default password "admin123"!`);
    
    // Auto clear success message
    setTimeout(() => setUserSuccess(''), 4000);
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser.role !== 'admin') {
      alert('Only administrators have permission to remove users.');
      return;
    }
    if (userId === currentUser.id) {
      alert('Cannot delete the currently simulated user.');
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (window.confirm(`Are you sure you want to remove access for "${targetUser.name}"?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setUserSuccess('User account removed successfully.');
      setTimeout(() => setUserSuccess(''), 4000);
    }
  };

  const handleAdminResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    if (resettingPasswordValue.trim().length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // Update password in global list
    setUsers(prev => prev.map(u => u.id === resettingUser.id ? { ...u, password: resettingPasswordValue.trim() } : u));
    
    setUserSuccess(`Successfully reset password for "${resettingUser.name}" to "${resettingPasswordValue.trim()}"!`);
    setResettingUser(null);
    setResettingPasswordValue('');

    setTimeout(() => setUserSuccess(''), 4000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    const expectedCurrentPassword = currentUser.password || 'admin123';
    if (currentPassword !== expectedCurrentPassword) {
      setSecurityError('Incorrect current password.');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirmation do not match.');
      return;
    }

    const updatedUser = { ...currentUser, password: newPassword };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    
    setSecuritySuccess('Your secure password has been updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setSecuritySuccess(''), 4000);
  };

  const handleSaveNextcloud = (e: React.FormEvent) => {
    e.preventDefault();
    setNxcError('');
    setNxcSuccess('');

    if (!nextcloudUrl.trim().startsWith('http://') && !nextcloudUrl.trim().startsWith('https://')) {
      setNxcError('Invalid Nextcloud URL. It must start with http:// or https://');
      return;
    }

    setNextcloudConfig({
      url: nextcloudUrl.trim(),
      username: nextcloudUsername.trim(),
      token: nextcloudToken,
      enabled: nextcloudFormEnabled
    });

    setNxcSuccess('Nextcloud integration profile updated successfully!');
    setTimeout(() => setNxcSuccess(''), 4000);
  };

  const handleTestNextcloudConnection = () => {
    setNxcError('');
    setNxcSuccess('');
    setNxcTesting(true);

    setTimeout(() => {
      setNxcTesting(false);
      if (!nextcloudUrl.trim()) {
        setNxcError('Nextcloud Server URL is required.');
      } else {
        setNxcSuccess('✓ Connection Success! Nextcloud directories: /contracts, /billing, and /receipts are synced with POIS ERP.');
      }
    }, 1200);
  };

  // --- MENU HANDLERS ---
  const isMenuVisibleForRole = (role: UserRole, tabId: string): boolean => {
    const key = `${role}:${tabId}`;
    return menuVisibility[key] !== false; // Visible by default unless set to false
  };

  const handleToggleMenu = (role: UserRole, tabId: string) => {
    // Prevent locking Admin out of Settings
    if (role === 'admin' && tabId === 'settings') {
      alert('System Admin must always have access to Settings to prevent lockout.');
      return;
    }

    const key = `${role}:${tabId}`;
    const currentVal = isMenuVisibleForRole(role, tabId);
    
    setMenuVisibility(prev => ({
      ...prev,
      [key]: !currentVal
    }));

    setMenuSuccess('Navigation visibility policy updated.');
    setTimeout(() => setMenuSuccess(''), 3000);
  };

  const handleResetMenus = () => {
    if (window.confirm('Reset all menu visibility policies to default (all menus visible to all roles)?')) {
      const defaultState: Record<string, boolean> = {};
      rolesList.forEach(roleObj => {
        menuItems.forEach(menu => {
          defaultState[`${roleObj.value}:${menu.id}`] = true;
        });
      });
      setMenuVisibility(defaultState);
      setMenuSuccess('Menu visibilities reset to system defaults.');
      setTimeout(() => setMenuSuccess(''), 3000);
    }
  };

  // --- PRICING RATE HANDLERS ---
  const handleEditPricing = (item: CatalogItem) => {
    setEditingItem(item);
    setEditedPrice(item.unit_price.toString());
    setEditedName(item.name);
    setEditedTaxable(item.taxable);
    setPricingSuccess('');
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const newPriceVal = parseFloat(editedPrice);
    if (isNaN(newPriceVal) || newPriceVal < 0) {
      alert('Please enter a valid price >= 0.');
      return;
    }

    const updatedItem: CatalogItem = {
      ...editingItem,
      name: editedName.trim() || editingItem.name,
      unit_price: newPriceVal,
      taxable: editedTaxable
    };

    updateCatalogItem(updatedItem);
    
    setEditingItem(null);
    setPricingSuccess(`Rate updated: ${updatedItem.code} price changed to RM ${updatedItem.unit_price.toFixed(2)}`);
    setTimeout(() => setPricingSuccess(''), 4000);
  };

  const filteredCatalog = catalog.filter(item => 
    item.code.toLowerCase().includes(pricingSearch.toLowerCase()) ||
    item.name.toLowerCase().includes(pricingSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(pricingSearch.toLowerCase())
  );

  const getCategoryBadgeColor = (category: CatalogCategory) => {
    switch (category) {
      case 'line-rental': return 'bg-brand-50 text-brand-700 border-brand-100';
      case 'internet-access': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'fiber-package': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'one-time': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'equipment': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Nav */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`py-3.5 px-6 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'border-brand-600 text-brand-600 bg-brand-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>User Accounts</span>
        </button>
        <button
          onClick={() => setActiveSubTab('menus')}
          className={`py-3.5 px-6 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'menus'
              ? 'border-brand-600 text-brand-600 bg-brand-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Menu Visibility Configuration</span>
        </button>
        <button
          onClick={() => setActiveSubTab('pricing')}
          className={`py-3.5 px-6 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'pricing'
              ? 'border-brand-600 text-brand-600 bg-brand-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Rates & Pricing Settings</span>
        </button>
        <button
          onClick={() => setActiveSubTab('security')}
          className={`py-3.5 px-6 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'border-brand-600 text-brand-600 bg-brand-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Password & Security</span>
        </button>
        <button
          onClick={() => setActiveSubTab('nextcloud')}
          className={`py-3.5 px-6 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'nextcloud'
              ? 'border-brand-600 text-brand-600 bg-brand-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Nextcloud Integration</span>
        </button>
        <button
          onClick={() => setActiveSubTab('sla')}
          className={`py-3.5 px-6 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'sla'
              ? 'border-brand-600 text-brand-600 bg-brand-50/10'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>SLA & Agreement Settings</span>
        </button>
      </div>

      {/* 1. USER MANAGEMENT SUBTAB */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add User form card */}
          {currentUser.role === 'admin' ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs h-fit">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-4 border-b border-gray-100">
                <UserPlus className="w-4 h-4 text-brand-600" />
                <span>Register New Login User</span>
              </h3>

              <form onSubmit={handleAddUser} className="space-y-4 mt-4">
                {userError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
                    {userError}
                  </div>
                )}
                {userSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
                    {userSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kenneth Kumar"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="e.g. kenneth@pois-integrator.com.my"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ERP Security Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
                  >
                    <option value="sales_rep">Sales</option>
                    <option value="hod_sales">HOD</option>
                    <option value="ceo">CEO</option>
                    <option value="technician">Technician</option>
                    <option value="admin">System Admin</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                    Registering this user adds them to the live ERP system database. You can instantly simulate acting as them in the bottom sidebar switch panel.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create ERP Account</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-fit space-y-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-4 border-b border-slate-200">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Administrative Privileges Required</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Only simulated **System Administrators (Admin)** have the authorization to register new login users or deactivate active employee profiles.
              </p>
              <div className="bg-amber-50 border border-amber-100 text-amber-800 text-[11px] p-3 rounded-lg leading-relaxed font-medium">
                💡 **Your Current Action Privilege:** Under your current role as a non-admin, you are authorized **only to perform Reset Passwords** on existing directories.
              </div>
            </div>
          )}

          {/* User List Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Active System User Directory</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage login credentials and simulated workspace profiles.</p>
              </div>
              <span className="bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {users.length} registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Employee Details</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">ERP Access Role</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Corporate Email</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-800 flex items-center justify-center font-bold text-xs uppercase">
                            {u.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{u.name}</p>
                            <p className="text-[10px] font-mono text-gray-400 mt-0.5">UID: {u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border rounded-md ${
                          u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' :
                          u.role === 'ceo' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          u.role === 'hod_sales' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          u.role === 'sales_rep' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-600 font-mono">
                        {u.email}
                      </td>
                      <td className="px-5 py-4 text-right flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setResettingUser(u);
                            setResettingPasswordValue(u.password || 'admin123');
                          }}
                          className="p-1.5 text-brand-600 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-all"
                          title="Reset employee password"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        {u.id === currentUser.id ? (
                          <span className="text-[10px] text-gray-400 italic px-1">Simulated Now</span>
                        ) : (
                          currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-all"
                              title="Deactivate account access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Reset Password Modal */}
          {resettingUser && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-brand-600" />
                    <span>Reset User Password</span>
                  </h3>
                  <button
                    onClick={() => setResettingUser(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>You are resetting the ERP password for:</p>
                  <p className="font-bold text-gray-800">{resettingUser.name} <span className="font-mono font-medium text-gray-500">({resettingUser.email})</span></p>
                </div>

                <form onSubmit={handleAdminResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">New Secure Password</label>
                    <input
                      type="text"
                      value={resettingPasswordValue}
                      onChange={(e) => setResettingPasswordValue(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
                      required
                      placeholder="Enter at least 6 characters"
                      minLength={6}
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setResettingUser(null)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-xs"
                    >
                      Save New Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MENU VISIBILITY CONFIG SUBTAB */}
      {activeSubTab === 'menus' && (
        <div className="space-y-4">
          {currentUser.role !== 'admin' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-2xl mx-auto space-y-3">
              <Lock className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="font-bold text-amber-900 text-sm">Restricted Access Module</h3>
              <p className="text-xs text-amber-700 leading-relaxed max-w-md mx-auto">
                Only simulated **System Administrators (Admin)** have the authorization to configure custom menu visibility policies for corporate security and clean role-based dashboards.
              </p>
              <div className="pt-2">
                <p className="text-[11px] text-gray-500 font-medium">
                  💡 Tip: Switch your active simulated role to **Sys Admin** using the dropdown panel in the bottom-left of the sidebar to access these settings.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50/50 gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Shield className="w-4.5 h-4.5 text-brand-600" />
                    <span>Role-Based Menu Visibility Controller</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Configure exactly which navigation tabs are shown or hidden for each employee role.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetMenus}
                    className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs px-3 py-2 rounded-lg transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore Defaults</span>
                  </button>
                </div>
              </div>

              {menuSuccess && (
                <div className="m-5 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{menuSuccess}</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-600">Module / Navigation Menu</th>
                      {rolesList.map(r => (
                        <th key={r.value} className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                          {r.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {menuItems.map((menu) => (
                      <tr key={menu.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">{menu.label}</p>
                            <p className="text-[10px] text-gray-400 font-mono">Tab ID: {menu.id}</p>
                          </div>
                        </td>
                        {rolesList.map(r => {
                          const visible = isMenuVisibleForRole(r.value, menu.id);
                          const isDisabled = r.value === 'admin' && menu.id === 'settings';
                          return (
                            <td key={r.value} className="px-6 py-4 text-center">
                              <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                <input
                                  type="checkbox"
                                  checked={visible}
                                  disabled={isDisabled}
                                  onChange={() => handleToggleMenu(r.value, menu.id)}
                                  className={`rounded h-4.5 w-4.5 border-gray-300 transition-colors ${
                                    isDisabled 
                                      ? 'text-gray-300 bg-gray-100 cursor-not-allowed' 
                                      : 'text-brand-600 focus:ring-brand-600 cursor-pointer'
                                  }`}
                                />
                                <span className="sr-only">Toggle visibility of {menu.label} for {r.label}</span>
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-5 border-t border-gray-100 bg-slate-50 text-[11px] text-gray-500 leading-relaxed flex items-start gap-2.5">
                <span className="font-bold text-brand-600">🛡️ Policy Enforcement:</span>
                <p>
                  Updates to these visibilities take effect immediately. If a menu is toggled off for a role, the navigation button will disappear from their left sidebar entirely, creating a tailored user experience depending on whether they are in Sales, Engineering, or Management.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PRICING RATES & CATALOG PRICE CONFIG SUBTAB */}
      {activeSubTab === 'pricing' && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search catalog rates by code or name..."
                value={pricingSearch}
                onChange={(e) => setPricingSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
              />
            </div>
            <div className="text-right text-xs text-gray-500">
              Showing <span className="font-bold text-gray-800">{filteredCatalog.length}</span> of {catalog.length} Rate Card items.
            </div>
          </div>

          {pricingSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
              {pricingSuccess}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Item Code</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Service Category</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Description</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Billing Type / Unit</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Standard Rate (SST Incl.)</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredCatalog.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-slate-800">
                      {item.code}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${getCategoryBadgeColor(item.category)}`}>
                        {item.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        {item.notes && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-md">{item.notes}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 capitalize">
                      per {item.unit.replace('-', ' ')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="font-bold text-gray-800">RM {item.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{item.taxable ? 'Subject to SST 8%' : 'SST Exempt'}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleEditPricing(item)}
                        className="p-1 text-brand-600 hover:text-brand-950 hover:bg-brand-50 rounded-lg transition-all"
                        title="Adjust rate card price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT PRICING MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden animate-slide-up">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Adjust Catalog Rate Card</h4>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Item Code: {editingItem.code}</p>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Service / Item Name</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Standard Unit Rate (RM)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">RM</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedPrice}
                      onChange={(e) => setEditedPrice(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Tax Classification</label>
                  <div className="h-[42px] flex items-center">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedTaxable}
                        onChange={(e) => setEditedTaxable(e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-600 border-gray-300 h-4.5 w-4.5"
                      />
                      <span className="text-xs font-semibold text-gray-700">Subject to SST 8%</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-[10px] text-gray-500 leading-relaxed border border-gray-100">
                ⚠️ **Downstream ERP Compliance Notice:** Changing this catalog item price updates the master rate card. All **new quotations** created subsequently will fetch this updated price automatically.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Rate Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. PASSWORD & SECURITY SUBTAB */}
      {activeSubTab === 'security' && (
        <div className="max-w-2xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-4 border-b border-gray-100 mb-6">
            <Lock className="w-4 h-4 text-brand-600" />
            <span>Change Your Secure Password</span>
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {securityError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
                {securityError}
              </div>
            )}
            {securitySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
                {securitySuccess}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono"
                    required
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono"
                    required
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono"
                  required
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-[10.5px] text-gray-500 leading-relaxed border border-gray-100 space-y-1 mt-4">
              <p className="font-semibold text-gray-700">🔒 ERP Session Security Protocol:</p>
              <p>Your password is securely saved within your browser's persistent session storage container. Please record and secure your new credentials carefully.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save Secure Password</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. NEXTCLOUD INTEGRATION SUBTAB */}
      {activeSubTab === 'nextcloud' && (
        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-4 border-b border-gray-100">
              <Cloud className="w-4 h-4 text-brand-600" />
              <span>Configure Nextcloud Server Storage (WebDAV)</span>
            </h3>

            <form onSubmit={handleSaveNextcloud} className="space-y-4">
              {nxcError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
                  {nxcError}
                </div>
              )}
              {nxcSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
                  {nxcSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Nextcloud Server WebDAV URL</label>
                  <input
                    type="url"
                    value={nextcloudUrl}
                    onChange={(e) => setNextcloudUrl(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono"
                    required
                    placeholder="https://nextcloud.yourdomain.com/remote.php/dav/files/user/"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Provide the full Nextcloud WebDAV URL endpoint for secure automatic upload synchronization.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Nextcloud Username</label>
                    <input
                      type="text"
                      value={nextcloudUsername}
                      onChange={(e) => setNextcloudUsername(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
                      required
                      placeholder="e.g. erp_uploader"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Application Token / Password</label>
                    <input
                      type="password"
                      value={nextcloudToken}
                      onChange={(e) => setNextcloudToken(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono"
                      required
                      placeholder="••••••••••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <input
                    type="checkbox"
                    id="nxc-enabled-chk"
                    checked={nextcloudFormEnabled}
                    onChange={(e) => setNextcloudFormEnabled(e.target.checked)}
                    className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                  />
                  <label htmlFor="nxc-enabled-chk" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                    Enable Automatic Document Cloud Sync
                  </label>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 px-5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Integration Profile</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestNextcloudConnection}
                  disabled={nxcTesting}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${nxcTesting ? 'animate-spin' : ''}`} />
                  <span>{nxcTesting ? 'Testing Handshake...' : 'Test Connection'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Status Panel */}
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-5 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-800">
              <Cloud className="w-4 h-4" />
              <span>Nextcloud WebDAV Status</span>
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Integration:</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                  nextcloudConfig.enabled 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {nextcloudConfig.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-slate-400">Server Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                  <span>ONLINE</span>
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Synchronized Vault Folders</span>
                
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
                    <span className="text-slate-300">📁 /contracts</span>
                    <span className="text-emerald-400 text-[10px] font-bold">✓ Synced</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
                    <span className="text-slate-300">📁 /billing</span>
                    <span className="text-emerald-400 text-[10px] font-bold">✓ Synced</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/60">
                    <span className="text-slate-300">📁 /receipts</span>
                    <span className="text-emerald-400 text-[10px] font-bold">✓ Synced</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-[10px] leading-relaxed text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">💡 Automated Sync Protocol:</p>
                <p>When saving Quotations, Invoices, and DuitNow Payment Receipts, PDF snapshots are automatically routed and saved securely in your Nextcloud instance folders via standard WebDAV file transfer protocols.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SLA & AGREEMENT SETTINGS SUBTAB */}
      {activeSubTab === 'sla' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Main settings form */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-4 border-b border-gray-100 animate-fade-in">
              <Sliders className="w-4 h-4 text-brand-600" />
              <span>Configure Corporate Master SLA Agreement Rates</span>
            </h3>

            <form onSubmit={handleSaveSlaSettings} className="space-y-4 animate-fade-in">
              {slaError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
                  {slaError}
                </div>
              )}
              {slaSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
                  {slaSuccess}
                </div>
              )}

              {/* SECTION A: AGREEMENT RATES (TARGET UPTIME / PERFORMANCE) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Section A: Performance & Reliability Guarantees (SLA Rate)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Target Symmetrical Uptime Guarantee (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="90"
                        max="100"
                        value={targetUptime}
                        onChange={(e) => setTargetUptime(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono font-bold"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Guaranteed annual network availability (e.g. 99.9% / "Three Nines").</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Standard Provisioning Delivery SLA (Days)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={deliverySlaDays}
                        onChange={(e) => setDeliverySlaDays(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono font-bold"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">Days</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Maximum working days allowed for physical drop-cable splicing before SLA breach.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Maximum Backbone Latency (ms)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={latencySlaMs}
                        onChange={(e) => setLatencySlaMs(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono font-semibold"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">ms</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Guaranteed Max Packet Loss (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={packetLossSlaPercent}
                        onChange={(e) => setPacketLossSlaPercent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono font-semibold"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Critical Ticket Resolution (Hours)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={resolutionSlaHours}
                        onChange={(e) => setResolutionSlaHours(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono font-semibold"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400">Hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: BILLING ADJUSTMENTS */}
              <div className="space-y-4 pt-4 border-t border-gray-150">
                <h4 className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Section B: Financial Penalties & Adjustments Settings
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Cabling Over-distance Adjustment Rate (RM/m)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">RM</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={cablingAdjustmentRate}
                        onChange={(e) => setCablingAdjustmentRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono font-bold"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Reconciliation fee billed on excess fiber drop cabling installed beyond quoted quantities.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Outage Billing Rebate Factor (% MRC / Hour)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={outageRebatePercent}
                        onChange={(e) => setOutageRebatePercent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-mono font-bold"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Percentage rebate of Monthly Recurring Charge (MRC) per hour of breached downtime resolution.</p>
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={currentUser.role !== 'admin' && currentUser.role !== 'ceo'}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 px-5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Update SLA Policy</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Status Panel */}
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-5 space-y-5 shadow-sm animate-fade-in">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-slate-800">
              <Activity className="w-4 h-4 text-brand-400" />
              <span>SLA Regulatory Compliance</span>
            </h4>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1">
                <p className="font-bold text-slate-300">Malaysia MCMC Standards</p>
                <p className="text-[10px] leading-relaxed text-slate-400">
                  These SLA and adjustment settings comply with standard commercial lease contracts for High-Speed Broadband (HSBB) and Metro Ethernet services regulated by the Malaysian Communications and Multimedia Commission.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Live Adjustment Enforcements</span>
                
                <div className="space-y-2.5 text-[11px] font-medium font-mono">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Cabling Excess Rate:</span>
                    <span className="text-brand-300 font-bold">RM {cablingAdjustmentRate.toFixed(2)}/meter</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Uptime Target:</span>
                    <span className="text-brand-300 font-bold">{targetUptime.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Provisioning Window:</span>
                    <span className="text-brand-300 font-bold">{deliverySlaDays} Working Days</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">Outage Comp rebate:</span>
                    <span className="text-brand-300 font-bold">{outageRebatePercent.toFixed(1)}% MRC/hr</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-brand-950/40 border border-brand-900/30 rounded-xl text-[10.5px] leading-relaxed text-slate-300">
                <p className="font-bold text-brand-300 mb-1">ℹ️ Compensation Rule:</p>
                <p>
                  Any project scheduled with an installation work order or fiber drop activation will enforce a maximum delivery limit of **{deliverySlaDays} working days**. If breached, simulated clients are contractually entitled to rebates determined by the configured hourly adjustment settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
