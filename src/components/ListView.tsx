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

export default function ListView({ people, onUpdate, onToggleStatus }: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPeople = people.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.nickName && p.nickName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search family members..."
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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
                <p className="text-sm text-gray-500">{formatDate(person.birthDate)}</p>
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
