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
