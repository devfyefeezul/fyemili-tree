import { useState } from 'react';
import type { Person } from '../types';
import MemberDetailModal from './MemberDetailModal';

interface ListViewProps {
  people: Person[];
  onUpdate: (person: Person) => void;
  onToggleStatus: (id: string) => void;
}

// Utility function to format date as dd-MM-yyyy
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Utility function to calculate age from birth date
const calculateAge = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const birthDate = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function ListView({ people, onUpdate, onToggleStatus }: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [sortBy, setSortBy] = useState<'fullName' | 'nickName' | 'birthDate' | 'gender' | 'age'>('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredPeople = people
    .filter(p =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nickName && p.nickName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.birthDate && p.birthDate.includes(searchTerm))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'fullName':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'nickName':
          // Handle missing nicknames: put them last
          if (!a.nickName && !b.nickName) comparison = 0;
          else if (!a.nickName) comparison = 1;
          else if (!b.nickName) comparison = -1;
          else comparison = a.nickName.localeCompare(b.nickName);
          break;
        case 'birthDate':
          // Handle missing birth dates: put them last
          if (!a.birthDate && !b.birthDate) comparison = 0;
          else if (!a.birthDate) comparison = 1;
          else if (!b.birthDate) comparison = -1;
          else comparison = new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();
          break;
        case 'age':
          // Sort by age (calculated from birthDate)
          // Note: Youngest (smallest age) to Oldest (largest age) for Ascending
          // This is effectively the REVERSE of birthDate sorting (Latest date = Smallest age)
          if (!a.birthDate && !b.birthDate) comparison = 0;
          else if (!a.birthDate) comparison = 1;
          else if (!b.birthDate) comparison = -1;
          else {
            const ageA = calculateAge(a.birthDate);
            const ageB = calculateAge(b.birthDate);
            comparison = ageA - ageB;
          }
          break;
        case 'gender':
          // Handle missing gender: put them last
          if (!a.gender && !b.gender) comparison = 0;
          else if (!a.gender) comparison = 1;
          else if (!b.gender) comparison = -1;
          else comparison = a.gender.localeCompare(b.gender);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div>
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search family members (name, nickname, birth date)..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="flex gap-2">
          <div className="flex-1">
            <select
              className="w-full p-2 border rounded bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="fullName">Sort by Name</option>
              <option value="nickName">Sort by Nickname</option>
              <option value="birthDate">Sort by Birth Date</option>
              <option value="age">Sort by Age</option>
              <option value="gender">Sort by Gender</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border rounded bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[120px] justify-center"
            title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
          >
            {sortOrder === 'asc' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span>Asc</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <span>Desc</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredPeople.map(person => (
          <div
            key={person.id}
            className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition"
            onClick={() => setSelectedPerson(person)}
          >
            <div className="flex items-center gap-4">
              {person.photoUrl && (
                <img
                  src={person.photoUrl}
                  alt={person.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold">{person.fullName}</h3>
                {person.nickName && (
                  <p className="text-sm text-gray-500">"{person.nickName}"</p>
                )}
                <p className="text-sm text-gray-500">
                  {formatDate(person.birthDate)}
                  {person.birthDate && (
                    <span className="ml-1 text-gray-400">
                      ({calculateAge(person.birthDate)} years)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPerson && (
        <MemberDetailModal
          person={selectedPerson}
          people={people}
          onClose={() => setSelectedPerson(null)}
          onUpdate={(updatedPerson) => {
            onUpdate(updatedPerson);
            setSelectedPerson(updatedPerson);
          }}
          onToggleStatus={onToggleStatus}
        />
      )}
    </div>
  );
}
