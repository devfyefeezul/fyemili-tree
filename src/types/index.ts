export interface EditHistory {
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
  editedBy?: string;
}

export interface Person {
  id: string;
  parentId: string | null;
  spouseId?: string | null;
  fullName: string;
  nickName?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  bio?: string;
  photoUrl?: string;
  status?: 'active' | 'inactive';
  history?: EditHistory[];
}

export interface TreeNode extends Person {
  children: TreeNode[];
  spouse?: TreeNode;
  isOpen?: boolean;
}
