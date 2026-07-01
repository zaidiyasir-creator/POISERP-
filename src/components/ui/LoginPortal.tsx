import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { PoisLogo } from './PoisLogo';
import { Lock, Mail, ArrowRight, UserCheck, Shield, Key, ArrowLeft, CheckCircle } from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const { users, login, setUsers } = useApp();
  const [showDirectory, setShowDirectory] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>(
    users.find(u => u.email === 'demo@pois-integrator.com.my') || 
    users[0] || {
      id: 'U-01',
      name: 'Sarah Tan',
      role: 'sales_rep',
      email: 'demo@pois-integrator.com.my',
      password: 'demo123'
    }
  );
  const [emailInput, setEmailInput] = useState(selectedUser.email);
  const [password, setPassword] = useState(selectedUser.password || (selectedUser.email === 'admin@pois-integrator.com.my' ? 'admin123' : 'demo123'));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset states
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setEmailInput(user.email);
    setPassword(user.password || (user.email === 'admin@pois-integrator.com.my' ? 'admin123' : 'demo123'));
    setError('');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const targetUserIndex = users.findIndex(u => u.email.toLowerCase() === resetEmail.trim().toLowerCase());
    if (targetUserIndex === -1) {
      setResetError('Email not found in our system. Please use a registered corporate email.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    // Update password in global state
    const updatedUsers = [...users];
    updatedUsers[targetUserIndex] = {
      ...updatedUsers[targetUserIndex],
      password: resetNewPassword
    };
    setUsers(updatedUsers);

    // If the updated user is the currently selected user in login state, update its fields
    if (selectedUser.email.toLowerCase() === resetEmail.trim().toLowerCase()) {
      setSelectedUser(updatedUsers[targetUserIndex]);
      setPassword(resetNewPassword);
    }

    setResetSuccess('Password has been successfully changed! You can now sign in.');
    setResetEmail('');
    setResetNewPassword('');
    setResetConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      // Find user by email
      const match = users.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase());
      if (match) {
        const expectedPassword = match.password || (match.email === 'admin@pois-integrator.com.my' ? 'admin123' : 'demo123');
        if (password === expectedPassword) {
          login(match);
        } else {
          setError('Incorrect secure ERP password.');
          setIsSubmitting(false);
        }
      } else {
        // If email doesn't exist but looks valid, we can auto-register a Sales Rep for convenience
        if (emailInput.includes('@')) {
          const namePart = emailInput.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          const newUser: User = {
            id: 'U-' + Math.floor(1000 + Math.random() * 9000),
            name: namePart || 'Corporate User',
            role: 'sales_rep',
            email: emailInput.trim().toLowerCase(),
            password: password
          };
          setUsers(prev => [...prev, newUser]);
          login(newUser);
        } else {
          setError('Account not found. Please enter a valid corporate email format.');
          setIsSubmitting(false);
        }
      }
    }, 400); // Small realistic delay for UI polish
  };

  const getRoleLabelColor = (role: UserRole) => {
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-0 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-2xl relative z-10 overflow-hidden">
        
        {/* Left column: Branding Info */}
        <div className="md:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-slate-950 to-slate-900 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <PoisLogo className="w-10 h-10 text-brand-500 fill-brand-500" />
              <div>
                <h1 className="text-xl font-black text-white tracking-wider">POIS</h1>
                <p className="text-[9px] font-bold tracking-widest text-brand-400 uppercase">SYSTEM INTEGRATOR</p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 leading-tight">
                Unified Telecom ERP & Business Portal
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure access for Fiber Installation, Quotation SST Calculator, Enterprise SLA Trackers, Automated Invoicing, and Site Survey coordination.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/60 mt-8">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-brand-500" />
              <p className="text-[10px] font-semibold text-slate-400">
                Malaysia Corporate Compliance Standard ERP
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Login forms & profile directory switcher */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          {showResetForm ? (
            // --- PASSWORD RESET FORM ---
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(false);
                    setResetError('');
                    setResetSuccess('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Reset Secure Password</h3>
                <p className="text-xs text-slate-400">Set a new ERP access password for your corporate profile.</p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {resetError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium">
                    {resetError}
                  </div>
                )}
                {resetSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Corporate Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        placeholder="name@pois-integrator.com.my"
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      New Secure Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        required
                        placeholder="Minimum 6 characters"
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        required
                        placeholder="Re-enter new password"
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-500/10"
                >
                  <Lock className="w-4 h-4" />
                  <span>Update & Save Secure Password</span>
                </button>
              </form>
            </div>
          ) : (
            // --- STANDARD SIGN IN FORM ---
            <>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Employee Sign In</h3>
                <p className="text-xs text-slate-400">Enter your email and password to access the ERP corporate portal.</p>
              </div>

              {/* Default Demo Credentials Banner */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-brand-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Default Demo Credentials</span>
                </div>
                <p className="font-mono">Email: <span className="text-white select-all font-semibold">demo@pois-integrator.com.my</span></p>
                <p className="font-mono">Password: <span className="text-white select-all font-semibold font-mono">demo123</span></p>
              </div>

              {/* Directory Grid (Hidden by default) */}
              {showDirectory && (
                <div className="space-y-2 p-4 bg-slate-900/60 rounded-xl border border-slate-800 animate-fade-in">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1.5">
                    Enterprise Employee Directory
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {users.map((u) => {
                      const isSelected = selectedUser.id === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleUserSelect(u)}
                          className={`p-3 text-left rounded-xl border transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/5'
                              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/80'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                            isSelected ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {u.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">{u.name}</p>
                            <span className={`text-[9px] uppercase font-bold tracking-wide mt-1 inline-block px-1.5 py-0.2 rounded border ${getRoleLabelColor(u.role)}`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Email
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDirectory(!showDirectory)}
                        className="text-[10px] text-brand-400 hover:text-brand-300 font-bold tracking-wide uppercase focus:outline-none"
                      >
                        {showDirectory ? 'Hide Demo Users' : 'Show Demo Users'}
                      </button>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                        placeholder="name@pois-integrator.com.my"
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Secure ERP Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(emailInput);
                          setShowResetForm(true);
                          setResetError('');
                          setResetSuccess('');
                        }}
                        className="text-[10px] text-brand-400 hover:text-brand-300 font-bold tracking-wide uppercase focus:outline-none"
                      >
                        Forgot / Reset?
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-500/10 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying Secure Session...</span>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Authenticate and Log In</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
