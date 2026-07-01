import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CatalogItem, CatalogCategory, CatalogUnit } from '../../types';
import { 
  Plus, Search, Edit2, Check, X, ShieldAlert,
  Coins, Wifi, Activity, HelpCircle 
} from 'lucide-react';

export const CatalogModule: React.FC = () => {
  const { catalog, addCatalogItem, updateCatalogItem, deleteCatalogItem, currentUser } = useApp();

  // Search & Tab Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CatalogCategory | 'all'>('all');

  // Form states
  const [editingItemCode, setEditingItemCode] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingNotes, setEditingNotes] = useState<string>('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CatalogItem>>({
    code: '',
    name: '',
    category: 'internet-access',
    unit: 'month',
    unit_price: 0,
    taxable: true,
    notes: ''
  });

  const categories: { id: CatalogCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Services' },
    { id: 'line-rental', label: 'Leased / PABX Lines' },
    { id: 'internet-access', label: 'Internet Access' },
    { id: 'fiber-package', label: 'GPON Fiber Packages' },
    { id: 'one-time', label: 'One-time Install' },
    { id: 'equipment', label: 'Cabling / Equipment' }
  ];

  const isAdmin = currentUser.role === 'admin';

  const handleEditClick = (item: CatalogItem) => {
    setEditingItemCode(item.code);
    setEditingPrice(item.unit_price);
    setEditingNotes(item.notes);
  };

  const handleSaveClick = (item: CatalogItem) => {
    updateCatalogItem({
      ...item,
      unit_price: Number(editingPrice),
      notes: editingNotes
    });
    setEditingItemCode(null);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.code || !newItem.name) {
      alert('Code and Name are required.');
      return;
    }
    
    // Check duplicate code
    if (catalog.some(item => item.code.toUpperCase() === newItem.code?.toUpperCase())) {
      alert('An item with this rate card code already exists.');
      return;
    }

    const item: CatalogItem = {
      code: newItem.code.toUpperCase(),
      name: newItem.name,
      category: (newItem.category as CatalogCategory) || 'internet-access',
      unit: (newItem.unit as CatalogUnit) || 'month',
      unit_price: Number(newItem.unit_price) || 0,
      taxable: newItem.taxable !== undefined ? newItem.taxable : true,
      notes: newItem.notes || ''
    };

    addCatalogItem(item);
    setShowAddForm(false);
    setNewItem({
      code: '',
      name: '',
      category: 'internet-access',
      unit: 'month',
      unit_price: 0,
      taxable: true,
      notes: ''
    });
  };

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const getCategoryColor = (category: CatalogCategory) => {
    switch (category) {
      case 'line-rental': return 'bg-brand-50 text-brand-700 border-brand-100';
      case 'internet-access': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'fiber-package': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'one-time': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'equipment': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search rate catalog by item code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>

        {isAdmin ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Create Catalog Rate</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
            <ShieldAlert className="w-4 h-4 text-gray-400" />
            <span>Product prices locked. Swap simulation role to <strong>Admin</strong> to modify rates.</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-gray-100 overflow-x-auto shadow-xs gap-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`py-2 px-4 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rate cards listing */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="divide-y divide-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 w-32">Rate Code</th>
                <th className="px-6 py-4">Service Description</th>
                <th className="px-6 py-4 w-40">Category</th>
                <th className="px-6 py-4 w-32">Unit Type</th>
                <th className="px-6 py-4 w-44">Unit Price (RM)</th>
                <th className="px-6 py-4 w-28">Taxable (SST)</th>
                {isAdmin && <th className="px-6 py-4 w-24 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredCatalog.map(item => {
                const isEditing = editingItemCode === item.code;
                return (
                  <tr key={item.code} className="hover:bg-slate-50/20">
                    <td className="px-6 py-4 font-mono font-bold text-gray-700">{item.code}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded p-1 mt-1 font-normal"
                            placeholder="Add brief specification notes..."
                          />
                        ) : (
                          <p className="text-[10px] text-gray-400 mt-0.5">{item.notes || 'No added details'}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                        {item.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-500">{item.unit.replace('-', ' ')}</td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">RM</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(Number(e.target.value))}
                            className="w-24 bg-white border border-gray-300 rounded p-1 font-bold text-gray-900"
                          />
                        </div>
                      ) : (
                        <p className="font-bold text-gray-900">
                          RM {item.unit_price.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.taxable ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.taxable ? 'SST 8%' : 'Exempt'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveClick(item)}
                              className="p-1 text-emerald-600 hover:text-emerald-950 hover:bg-emerald-50 rounded"
                              title="Save Rates"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItemCode(null)}
                              className="p-1 text-rose-600 hover:text-rose-950 hover:bg-rose-50 rounded"
                              title="Cancel Edit"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 text-brand-600 hover:text-brand-950 hover:bg-brand-50 rounded"
                            title="Edit Service Rate"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredCatalog.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-gray-400">
                    No matching rates catalog found. Use 'Create Catalog Rate' to declare services.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Catalog Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Add New Service Rate Item</h3>
                <p className="text-xs text-gray-400 mt-0.5">Declare price points for quotation builders and invoicing</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-900 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Unique Rate Code <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GF-2G"
                    value={newItem.code}
                    onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded p-2 font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Category Service <span className="text-rose-600">*</span></label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value as CatalogCategory})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    <option value="line-rental">Leased / PABX Line Rental</option>
                    <option value="internet-access">Internet Broadband / Dedicated</option>
                    <option value="fiber-package">GPON Fiber Package Bundle</option>
                    <option value="one-time">One-time / Active installation</option>
                    <option value="equipment">Cabling / Hardware Equipment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Service Name Description <span className="text-rose-600">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dedicated Broadband Speed 500Mbps"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Billing Frequency Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value as CatalogUnit})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    <option value="month">Monthly Recurring (month)</option>
                    <option value="one-time">One-Time Charge (one-time)</option>
                    <option value="per-meter">Cabling Meters (per-meter)</option>
                    <option value="per-unit">Equipment Count (per-unit)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Unit Rate Price (RM) <span className="text-rose-600">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({...newItem, unit_price: Number(e.target.value)})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1 select-none cursor-pointer">
                <input
                  type="checkbox"
                  id="taxCheck"
                  checked={newItem.taxable}
                  onChange={(e) => setNewItem({...newItem, taxable: e.target.checked})}
                  className="rounded text-brand-600 focus:ring-brand-600 border-gray-300 h-4 w-4"
                />
                <label htmlFor="taxCheck" className="font-bold text-gray-700">Subject to Malaysia SST 8% Service Tax</label>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Internal Specification Notes</label>
                <textarea
                  placeholder="Describe technical constraints or equipment specifics..."
                  value={newItem.notes}
                  onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                  rows={3}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-3 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Save Item Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CatalogModule;
