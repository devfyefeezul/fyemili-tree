import { useState, useMemo } from 'react';
import type { Person, TreeNode } from '../types';
import MemberDetailModal from './MemberDetailModal';

interface TreeViewProps {
  people: Person[];
  onUpdate: (person: Person) => void;
  onToggleStatus: (id: string) => void;
  viewMode?: 'whole' | 'family';
  selectedFamilyId?: string;
  layerDepth?: number;
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

const buildTree = (people: Person[]): TreeNode[] => {
  const nodeMap: { [key: string]: TreeNode } = {};
  const roots: TreeNode[] = [];

  // Initialize all nodes
  people.forEach(person => {
    nodeMap[person.id] = { ...person, children: [], isOpen: true };
  });

  // Resolve spouse relationships
  people.forEach(person => {
    if (person.spouseId && nodeMap[person.spouseId]) {
      nodeMap[person.id].spouse = nodeMap[person.spouseId];
    }
  });

  // Build parent-child relationships
  people.forEach(person => {
    if (person.parentId && nodeMap[person.parentId]) {
      const parent = nodeMap[person.parentId];
      // Add this person to parent's children if not already added
      if (!parent.children.some(c => c.id === person.id)) {
        parent.children.push(nodeMap[person.id]);
      }

      // ALSO add to the parent's spouse's children (if spouse exists)
      // This ensures children appear under the couple regardless of which parent is referenced
      if (parent.spouseId && nodeMap[parent.spouseId]) {
        const spouse = nodeMap[parent.spouseId];
        if (!spouse.children.some(c => c.id === person.id)) {
          spouse.children.push(nodeMap[person.id]);
        }
      }
    }
  });

  // Find roots (people without parents who aren't spouses of someone with a parent)
  people.forEach(person => {
    // Check if parent exists in the current tree (nodeMap)
    const hasParentInTree = person.parentId && nodeMap[person.parentId];

    if (!hasParentInTree) {
      const node = nodeMap[person.id];
      // Only add as root if not a spouse of someone who already has a parent IN THE TREE
      const spouse = person.spouseId ? nodeMap[person.spouseId] : null;
      const spouseHasParentInTree = spouse && spouse.parentId && nodeMap[spouse.parentId];

      if (!spouseHasParentInTree) {
        // Avoid duplicate roots (spouse pairs)
        if (!roots.some(r => r.id === person.id || r.id === person.spouseId)) {
          roots.push(node);
        }
      }
    }
  });

  return roots;
};

interface FamilyUnitProps {
  node: TreeNode;
  onSelect: (person: Person) => void;
}

const FamilyUnit = ({ node, onSelect }: FamilyUnitProps) => {
  const [isOpen, setIsOpen] = useState(node.isOpen);
  const hasSpouse = !!node.spouse;
  const hasChildren = node.children.length > 0;

  // Count sons and daughters
  const sons = node.children.filter(c => c.gender === 'male').length;
  const daughters = node.children.filter(c => c.gender === 'female').length;

  // Calculate card width and spacing
  const cardWidth = 160; // w-40 = 10rem = 160px
  const spouseGap = 48; // w-12 = 3rem = 48px
  const parentWidth = hasSpouse ? (cardWidth * 2 + spouseGap) : cardWidth;
  const parentCenterOffset = hasSpouse ? (cardWidth + spouseGap / 2) : (cardWidth / 2);

  const PersonCard = ({ person }: { person: TreeNode }) => {
    const displayName = person.nickName ? `${person.nickName}` : person.fullName;
    const genderSymbol = person.gender === 'male' ? '♂' : person.gender === 'female' ? '♀' : '⚪';
    const genderColor = person.gender === 'male' ? 'text-blue-500' : person.gender === 'female' ? 'text-pink-500' : 'text-gray-400';

    return (
      <div
        className="bg-white p-3 rounded shadow border border-gray-200 w-40 text-center cursor-pointer hover:bg-gray-50 transition relative"
        onClick={() => onSelect(person)}
      >
        <div className="flex items-center justify-center gap-1">
          <span className={`text-sm ${genderColor}`}>{genderSymbol}</span>
          <div className="font-bold text-sm truncate" title={person.fullName}>{displayName}</div>
        </div>
        {person.birthDate && (
          <div className="text-xs text-gray-500">
            {formatDate(person.birthDate)} ({calculateAge(person.birthDate)} years)
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Parent(s) - horizontal layout for spouse pair */}
      <div className="flex items-center gap-0 relative z-10">
        <PersonCard person={node} />

        {hasSpouse && node.spouse && (
          <>
            {/* Horizontal line between spouses with gender indicator */}
            <div className="relative flex items-center">
              <div className="w-12 h-px bg-gray-400"></div>
              {/* Gender indicators on the connecting line */}
              {(sons > 0 || daughters > 0) && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 -top-6 bg-white px-1 text-xs text-gray-600 whitespace-nowrap"
                  title={`${sons} son${sons !== 1 ? 's' : ''}, ${daughters} daughter${daughters !== 1 ? 's' : ''}`}
                >
                  {sons > 0 && <span className="text-blue-500">♂{sons}</span>}
                  {sons > 0 && daughters > 0 && <span className="mx-0.5">|</span>}
                  {daughters > 0 && <span className="text-pink-500">♀{daughters}</span>}
                </div>
              )}
            </div>
            <PersonCard person={node.spouse} />
          </>
        )}
      </div>

      {/* Expand/collapse button */}
      {hasChildren && (
        <button
          className="mt-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm hover:bg-blue-600 z-10"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? '-' : '+'}
        </button>
      )}

      {/* Children */}
      {isOpen && hasChildren && (
        <div className="flex flex-col items-center w-full relative pt-8">
          {/* Vertical line down from couple center or single parent center */}
          <div
            className="bg-gray-300 absolute"
            style={{
              width: '2px',
              height: '40px', // Length to connect parents to children
              top: '-8px', // Start slightly up to connect with parents/button
              left: '50%',
              marginLeft: hasSpouse ? `${parentCenterOffset - parentWidth / 2}px` : '0'
            }}
          ></div>

          {/* Children container with proper centering */}
          <div className="flex flex-col items-center relative">
            {/* Children nodes */}
            <div className="flex">
              {node.children.map((child, index) => {
                // Calculate offset for vertical line to point to biological child's card
                const childVerticalOffset = child.spouse ? -(cardWidth + spouseGap) / 2 : 0;

                return (
                  <div key={child.id} className="flex flex-col items-center relative px-4 pt-8">
                    {/* Horizontal connectors - only between siblings, at container center */}
                    {index > 0 && (
                      <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-gray-300"></div>
                    )}
                    {index < node.children.length - 1 && (
                      <div className="absolute top-0 right-0 w-1/2 h-0.5 bg-gray-300"></div>
                    )}

                    {/* Bridge line if vertical line is offset */}
                    {childVerticalOffset !== 0 && (
                      <div
                        className="bg-gray-300 absolute h-0.5"
                        style={{
                          top: 0,
                          left: '50%',
                          width: `${Math.abs(childVerticalOffset)}px`,
                          transform: childVerticalOffset > 0 ? 'none' : 'translateX(-100%)'
                        }}
                      ></div>
                    )}

                    {/* Vertical line to child - offset to point to biological child */}
                    <div
                      className="bg-gray-300 absolute"
                      style={{
                        width: '2px',
                        height: '32px',
                        top: 0,
                        left: '50%',
                        marginLeft: `${childVerticalOffset}px`,
                        transform: 'translateX(-50%)'
                      }}
                    ></div>

                    <FamilyUnit node={child} onSelect={onSelect} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TreeView({ people, onUpdate, onToggleStatus, viewMode = 'whole', selectedFamilyId, layerDepth = 2 }: TreeViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPeople = useMemo(() => {
    if (viewMode === 'family' && selectedFamilyId) {
      const result: Person[] = [];
      const selectedPerson = people.find(p => p.id === selectedFamilyId);

      if (!selectedPerson) return people;

      // Add the selected person and spouse
      result.push(selectedPerson);
      if (selectedPerson.spouseId) {
        const spouse = people.find(p => p.id === selectedPerson.spouseId);
        if (spouse) result.push(spouse);
      }

      // Add descendants up to layerDepth
      const addDescendants = (parentId: string, currentDepth: number) => {
        if (currentDepth > layerDepth) return;

        const children = people.filter(p => p.parentId === parentId);
        children.forEach(child => {
          if (!result.some(p => p.id === child.id)) {
            result.push(child);
            // Add spouse if exists
            if (child.spouseId) {
              const spouse = people.find(p => p.id === child.spouseId);
              if (spouse && !result.some(p => p.id === spouse.id)) {
                result.push(spouse);
              }
            }
            addDescendants(child.id, currentDepth + 1);
          }
        });
      };

      addDescendants(selectedFamilyId, 1);
      if (selectedPerson.spouseId) {
        addDescendants(selectedPerson.spouseId, 1);
      }

      return result;
    }
    return people;
  }, [people, viewMode, selectedFamilyId, layerDepth]);

  const treeData = useMemo(() => buildTree(filteredPeople), [filteredPeople]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)] border border-gray-200 rounded">
        <div className="p-8 bg-gray-50 shadow-inner min-h-[500px] w-max">
          <div className="flex justify-center gap-16">
            {treeData.map(root => (
              <FamilyUnit key={root.id} node={root} onSelect={setSelectedPerson} />
            ))}
            {treeData.length === 0 && (
              <div className="text-gray-500">No family members found. Add someone to start the tree!</div>
            )}
          </div>
        </div>
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
