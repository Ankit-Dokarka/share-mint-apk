export interface Member {
  _id: string;
  fullName?: string;
  email?: string;
}

export interface Group {
  _id: string;
  name: string;
  members: Member[];
}

export interface GroupsResponse {
  success: boolean;
  groups: Group[];
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
}

export interface CreateGroupPayload {
  name: string;
  members: string[];
}
