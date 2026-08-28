import { apiRequest } from '../request';
import type {
  GroupsResponse,
  User,
  CreateGroupPayload,
  Group,
} from '../../types/group';

export const groupAPI = {
  getGroups: () =>
    apiRequest<GroupsResponse>({ method: 'GET', url: '/api/groups' }),

  searchMembers: (query: string) =>
    apiRequest<User[]>({
      method: 'GET',
      url: `/api/users/search?query=${query}`,
    }),

  createGroup: (payload: CreateGroupPayload) =>
    apiRequest<Group>({ method: 'POST', url: '/api/groups', data: payload }),
};
