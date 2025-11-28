import { useState } from 'react';
import type { Person } from '../types';
import SearchableSelect from './SearchableSelect';

interface AddMemberFormProps {
  onAdd: (person: Omit<Person, 'id'>) => void;
  people: Person[];
}

export default function AddMemberForm({ onAdd, people }: AddMemberFormProps) {
  const [fullName, setFullName] = useState('');
  const [nickName, setNickName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [parentId, setParentId] = useState('');
  const [spouseId, setSpouseId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      fullName,
      nickName: nickName || undefined,
      gender,
      parentId: parentId || null,
      spouseId: spouseId || null,
      birthDate,
      bio,
      photoUrl,
    });
    // Reset form
    setFullName('');
    setNickName('');
    setGender('male');
    setParentId('');
    setSpouseId('');
    setBirthDate('');
    setBio('');
    setPhotoUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold mb-4">Add Family Member</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nickname</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          value={gender}
          onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SearchableSelect
          people={people}
          value={parentId}
          onChange={setParentId}
          label="Parent"
        />

        <SearchableSelect
          people={people}
          value={spouseId}
          onChange={setSpouseId}
          label="Spouse/Partner (optional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Date</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Photo URL</label>
          <input
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Save Member
      </button>
    </form>
  );
}
