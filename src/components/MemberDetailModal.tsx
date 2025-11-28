import { useState } from 'react';
import type { Person, EditHistory } from '../types';
import ConfirmDialog from './ConfirmDialog';
import SearchableSelect from './SearchableSelect';
import HistoryModal from './HistoryModal';

interface MemberDetailModalProps {
  person: Person;
  people: Person[];
  onClose: () => void;
  onUpdate: (person: Person) => void;
  onToggleStatus: (id: string) => void;
}

// Utility function to format date as dd/MM/yyyy for display
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  // Try to parse the date
  let date = new Date(dateStr);
  
  // Handle DD-MM-YYYY format manually if standard parsing fails or gives invalid date
  if (isNaN(date.getTime()) && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-').map(Number);
    date = new Date(year, month - 1, day);
  }
  
  if (isNaN(date.getTime())) return dateStr;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Utility to convert various date formats to YYYY-MM-DD for input[type="date"]
const toInputDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  let date = new Date(dateStr);
  
  // Handle DD-MM-YYYY format (common in some regions/spreadsheets)
  if (isNaN(date.getTime()) || dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      // Assume DD-MM-YYYY if first part is > 12 or based on context, but safely:
      // If we have 3 parts, try to construct date. 
      // Note: Date input needs YYYY-MM-DD
      const d = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const y = parseInt(parts[2]);
      
      // Check if it looks like DD-MM-YYYY (Year at end)
      if (y > 1000) {
         date = new Date(y, m - 1, d);
      }
    }
  }

  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MemberDetailModal({ person, people, onClose, onUpdate, onToggleStatus }: MemberDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editedPerson, setEditedPerson] = useState({ ...person });

  const isInactive = person.status === 'inactive';
  const canEdit = !isInactive;

  const handleSave = () => {
    // Track changes in history
    const changes: EditHistory[] = [];
    const timestamp = new Date().toISOString();

    if (editedPerson.fullName !== person.fullName) {
      changes.push({
        timestamp,
        field: 'fullName',
        oldValue: person.fullName,
        newValue: editedPerson.fullName,
      });
    }

    if (editedPerson.nickName !== person.nickName) {
      changes.push({
        timestamp,
        field: 'nickName',
        oldValue: person.nickName || '',
        newValue: editedPerson.nickName || '',
      });
    }

    if (editedPerson.gender !== person.gender) {
      changes.push({
        timestamp,
        field: 'gender',
        oldValue: person.gender || '',
        newValue: editedPerson.gender || '',
      });
    }

    if (editedPerson.birthDate !== person.birthDate) {
      changes.push({
        timestamp,
        field: 'birthDate',
        oldValue: person.birthDate || '',
        newValue: editedPerson.birthDate || '',
      });
    }

    if (editedPerson.bio !== person.bio) {
      changes.push({
        timestamp,
        field: 'bio',
        oldValue: person.bio || '',
        newValue: editedPerson.bio || '',
      });
    }

    if (editedPerson.photoUrl !== person.photoUrl) {
      changes.push({
        timestamp,
        field: 'photoUrl',
        oldValue: person.photoUrl || '',
        newValue: editedPerson.photoUrl || '',
      });
    }

    if (editedPerson.parentId !== person.parentId) {
      changes.push({
        timestamp,
        field: 'parentId',
        oldValue: person.parentId || '',
        newValue: editedPerson.parentId || '',
      });
    }

    if (editedPerson.spouseId !== person.spouseId) {
      changes.push({
        timestamp,
        field: 'spouseId',
        oldValue: person.spouseId || '',
        newValue: editedPerson.spouseId || '',
      });
    }

    // Add changes to history
    const updatedPerson = {
      ...editedPerson,
      history: [...(person.history || []), ...changes],
    };

    onUpdate(updatedPerson);
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    onToggleStatus(person.id);
    setShowStatusConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{isEditing ? 'Edit Member' : person.fullName}</h2>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                {person.history && person.history.length > 0 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-gray-600 hover:text-gray-700 p-1"
                    title="View History"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setShowStatusConfirm(true)}
                  className={`p-1 ${isInactive ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}`}
                  title={isInactive ? 'Activate' : 'Deactivate'}
                >
                  {isInactive ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  )}
                </button>
              </>
            ) : null}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>
        </div>

        {isInactive && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4 text-orange-800 text-sm">
            ⚠️ This record is inactive and cannot be edited.
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editedPerson.fullName}
                  onChange={(e) => setEditedPerson({ ...editedPerson, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={editedPerson.nickName || ''}
                  onChange={(e) => setEditedPerson({ ...editedPerson, nickName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full p-2 border rounded"
                value={editedPerson.gender || 'male'}
                onChange={(e) => setEditedPerson({ ...editedPerson, gender: e.target.value as 'male' | 'female' | 'other' })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SearchableSelect
                people={people.filter(p => p.id !== person.id)}
                value={editedPerson.parentId || ''}
                onChange={(value) => setEditedPerson({ ...editedPerson, parentId: value || null })}
                label="Parent"
              />

              <SearchableSelect
                people={people.filter(p => p.id !== person.id)}
                value={editedPerson.spouseId || ''}
                onChange={(value) => setEditedPerson({ ...editedPerson, spouseId: value || null })}
                label="Spouse/Partner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={toInputDate(editedPerson.birthDate)}
                  onChange={(e) => setEditedPerson({ ...editedPerson, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  className="w-full p-2 border rounded"
                  value={editedPerson.photoUrl || ''}
                  onChange={(e) => setEditedPerson({ ...editedPerson, photoUrl: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={editedPerson.bio || ''}
                onChange={(e) => setEditedPerson({ ...editedPerson, bio: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditedPerson({ ...person });
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            {person.photoUrl && (
              <img
                src={person.photoUrl}
                alt={person.fullName}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <div className="space-y-2 mb-4">
              {person.nickName && (
                <p className="text-gray-600"><strong>Nickname:</strong> {person.nickName}</p>
              )}
              {person.gender && (
                <p className="text-gray-600"><strong>Gender:</strong> {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}</p>
              )}
              {person.spouseId && (
                <p className="text-gray-600">
                  <strong>Spouse:</strong> {people.find(p => p.id === person.spouseId)?.fullName || 'Unknown'}
                </p>
              )}
              <p className="text-gray-600"><strong>Born:</strong> {formatDate(person.birthDate)}</p>
              <p className="text-gray-700">{person.bio}</p>
            </div>
          </>
        )}
      </div>

      {showStatusConfirm && (
        <ConfirmDialog
          title={isInactive ? "Activate Member" : "Deactivate Member"}
          message={isInactive 
            ? `Are you sure you want to activate ${person.fullName}? They will appear in the tree and lists.`
            : `Are you sure you want to deactivate ${person.fullName}? They will be hidden from the tree and lists but can be restored later.`
          }
          onConfirm={handleToggleStatus}
          onCancel={() => setShowStatusConfirm(false)}
        />
      )}

      {showHistory && (
        <HistoryModal
          history={person.history || []}
          memberName={person.fullName}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
