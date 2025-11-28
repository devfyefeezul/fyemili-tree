import { useState, useEffect } from 'react';
import type { Person } from './types';
import { fetchPeople, addPerson, updatePerson, togglePersonStatus } from './services/api';
import ListView from './components/ListView.tsx';
import TreeView from './components/TreeView.tsx';
import AddMemberForm from './components/AddMemberForm.tsx';

function App() {
  const [view, setView] = useState<'list' | 'tree'>('list');
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [treeMode, setTreeMode] = useState<'whole' | 'family'>('whole');
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [layerDepth, setLayerDepth] = useState<number>(2);

  useEffect(() => {
    document.title = import.meta.env.VITE_APP_TITLE || 'Family Tree';
    loadPeople();
  }, [showInactive]);

  const loadPeople = async () => {
    setLoading(true);
    const data = await fetchPeople(showInactive);
    setPeople(data);
    setLoading(false);
  };

  const handleAddPerson = async (person: Omit<Person, 'id'>) => {
    await addPerson(person);
    await loadPeople();
    setShowAddForm(false);
  };

  const handleUpdatePerson = async (person: Person) => {
    const success = await updatePerson(person);
    if (success) {
      await loadPeople();
    }
  };

  const handleToggleStatus = async (id: string) => {
    const success = await togglePersonStatus(id);
    if (success) {
      await loadPeople();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">{import.meta.env.VITE_APP_TITLE || 'Family Tree'}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded ${view === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('tree')}
              className={`px-3 py-1 rounded ${view === 'tree' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              Tree
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <>
            <div className="mb-4 flex justify-end gap-2">
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`px-4 py-2 rounded shadow transition flex items-center gap-2 ${
                  showInactive 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title={showInactive ? 'Show active records' : 'Show inactive records'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showInactive ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  )}
                </svg>
                <span className="text-sm">{showInactive ? 'Inactive' : 'Active'}</span>
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
              >
                {showAddForm ? 'Cancel' : 'Add Member'}
              </button>
            </div>

            {showAddForm && (
              <div className="mb-6 bg-white p-4 rounded shadow">
                <AddMemberForm onAdd={handleAddPerson} people={people} />
              </div>
            )}

            {view === 'list' ? (
              <ListView people={people} onUpdate={handleUpdatePerson} onToggleStatus={handleToggleStatus} />
            ) : (
              <>
                {/* Tree View Controls - Mobile Responsive */}
                <div className="mb-4 bg-white p-3 rounded shadow space-y-3">
                  {/* Row 1: Mode Toggle Buttons - Full Width */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTreeMode('whole')}
                      className={`px-3 py-2 rounded ${treeMode === 'whole' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Whole Tree
                    </button>
                    <button
                      onClick={() => setTreeMode('family')}
                      className={`px-3 py-2 rounded ${treeMode === 'family' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      Family Mode
                    </button>
                  </div>

                  {/* Row 2 & 3: Family Mode Controls - Full Width Each */}
                  {treeMode === 'family' && (
                    <>
                      {/* Row 2: Family Dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Family:</label>
                        <select
                          className="border rounded p-2 text-sm w-full"
                          value={selectedFamily}
                          onChange={(e) => setSelectedFamily(e.target.value)}
                        >
                          <option value="">Select parent...</option>
                          {people
                            .filter(p => p.spouseId)
                            .sort((a, b) => a.fullName.localeCompare(b.fullName))
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.fullName} & {people.find(s => s.id === p.spouseId)?.fullName}
                              </option>
                            ))}
                        </select>
                      </div>
                      
                      {/* Row 3: Layer Dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Layers:</label>
                        <select
                          className="border rounded p-2 text-sm w-full"
                          value={layerDepth}
                          onChange={(e) => setLayerDepth(Number(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Row 4: Tree View - Full Width with proper scrolling */}
                <TreeView 
                  people={people} 
                  onUpdate={handleUpdatePerson} 
                  onToggleStatus={handleToggleStatus}
                  viewMode={treeMode}
                  selectedFamilyId={selectedFamily}
                  layerDepth={layerDepth}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
