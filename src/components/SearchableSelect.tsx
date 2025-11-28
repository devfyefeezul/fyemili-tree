import { useState, useRef, useEffect } from 'react';
import type { Person } from '../types';

interface SearchableSelectProps {
  people: Person[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export default function SearchableSelect({ people, value, onChange, label }: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sort alphabetically by fullName
  const sortedPeople = [...people].sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Filter based on search
  const filteredPeople = sortedPeople.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (p.nickName && p.nickName.toLowerCase().includes(search.toLowerCase()))
  );

  // Get display name for selected value
  const selectedPerson = people.find(p => p.id === value);
  const displayName = selectedPerson ? `${selectedPerson.fullName}${selectedPerson.nickName ? ` (${selectedPerson.nickName})` : ''}` : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 border rounded cursor-pointer"
          value={isOpen ? search : displayName}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search or select parent..."
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          ▼
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          <div
            className="p-2 hover:bg-gray-100 cursor-pointer border-b"
            onClick={() => {
              onChange('');
              setSearch('');
              setIsOpen(false);
            }}
          >
            (No Parent / Root)
          </div>
          {filteredPeople.length === 0 ? (
            <div className="p-2 text-gray-500 text-center">No results found</div>
          ) : (
            filteredPeople.map(p => (
              <div
                key={p.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(p.id);
                  setSearch('');
                  setIsOpen(false);
                }}
              >
                {p.fullName}
                {p.nickName && <span className="text-gray-500"> ({p.nickName})</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
