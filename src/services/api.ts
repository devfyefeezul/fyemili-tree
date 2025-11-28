import type { Person } from '../types';
import { mockPeople } from './mockData';

// Configuration
const API_URL = import.meta.env.VITE_API_URL || '';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const fetchPeople = async (showInactive = false): Promise<Person[]> => {
  if (USE_MOCK_DATA || !API_URL) {
    console.warn(USE_MOCK_DATA 
      ? 'Using mock data (VITE_USE_MOCK_DATA=true)' 
      : 'No API URL provided, using mock data.');
    // Show ONLY inactive if showInactive is true, otherwise show ONLY active
    const filtered = showInactive 
      ? mockPeople.filter(p => p.status === 'inactive')
      : mockPeople.filter(p => p.status !== 'inactive');
    return new Promise((resolve) => setTimeout(() => resolve(filtered), 500));
  }

  console.log('Fetching data from Google Sheets API:', API_URL);
  
  try {
    const response = await fetch(API_URL);
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received data from Google Sheets:', data);
    console.log('Data type:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('Number of records:', Array.isArray(data) ? data.length : 'N/A');
    
    if (!Array.isArray(data)) {
      console.error('Expected array but got:', typeof data);
      console.log('Falling back to mock data');
      return showInactive 
        ? mockPeople.filter(p => p.status === 'inactive')
        : mockPeople.filter(p => p.status !== 'inactive');
    }
    
    // Show ONLY inactive if showInactive is true, otherwise show ONLY active
    const filtered = (showInactive 
      ? data.filter((p: Person) => p.status === 'inactive')
      : data.filter((p: Person) => p.status !== 'inactive'))
      .map((p: Person) => ({
        ...p,
        id: String(p.id),
        parentId: p.parentId ? String(p.parentId) : null,
        spouseId: p.spouseId ? String(p.spouseId) : null,
      }));
    
    console.log('Filtered records:', filtered.length);
    return filtered;
  } catch (error) {
    console.error('Error fetching people:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.log('Falling back to mock data');
    return showInactive 
      ? mockPeople.filter(p => p.status === 'inactive')
      : mockPeople.filter(p => p.status !== 'inactive');
  }
};

export const addPerson = async (person: Omit<Person, 'id'>): Promise<Person | null> => {
  if (USE_MOCK_DATA || !API_URL) {
    console.warn(USE_MOCK_DATA 
      ? 'Using mock data (VITE_USE_MOCK_DATA=true)' 
      : 'No API URL provided, mocking add person.');
    const newPerson = { ...person, id: crypto.randomUUID(), status: 'active' as const };
    mockPeople.push(newPerson);
    return new Promise((resolve) => setTimeout(() => resolve(newPerson), 500));
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(person),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    if (result.status === 'success') {
       return { ...person, id: 'temp-id' }; 
    }
    return null;
  } catch (error) {
    console.error('Error adding person:', error);
    return null;
  }
};

export const updatePerson = async (person: Person): Promise<boolean> => {
  if (USE_MOCK_DATA || !API_URL) {
    console.warn(USE_MOCK_DATA 
      ? 'Using mock data (VITE_USE_MOCK_DATA=true)' 
      : 'No API URL provided, mocking update person.');
    const index = mockPeople.findIndex(p => p.id === person.id);
    if (index !== -1) {
      mockPeople[index] = person;
      return new Promise((resolve) => setTimeout(() => resolve(true), 500));
    }
    return false;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      body: JSON.stringify(person),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error('Error updating person:', error);
    return false;
  }
};

export const togglePersonStatus = async (id: string): Promise<boolean> => {
  if (USE_MOCK_DATA || !API_URL) {
    console.warn(USE_MOCK_DATA 
      ? 'Using mock data (VITE_USE_MOCK_DATA=true)' 
      : 'No API URL provided, mocking toggle status.');
    const person = mockPeople.find(p => p.id === id);
    if (person) {
      person.status = person.status === 'active' ? 'inactive' : 'active';
      return new Promise((resolve) => setTimeout(() => resolve(true), 500));
    }
    return false;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      body: JSON.stringify({ id, toggleStatus: true }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error('Error toggling status:', error);
    return false;
  }
};
